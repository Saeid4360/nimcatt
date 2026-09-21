const UPSTREAM_HOST = "site.api.espn.com";
const UPSTREAM_FETCH_HOST = "site.web.api.espn.com";
const ALLOWED_PATHS = [
  "/apis/site/v2/sports/soccer/",
  "/apis/v2/sports/soccer/",
];
const CACHE_TTL_SECONDS = {
  scoreboard: 120,
  match: 120,
  standings: 1800,
  schedule: 3600,
  team: 21600,
  roster: 21600,
};
const ALLOWED_KINDS = new Set(Object.keys(CACHE_TTL_SECONDS));
const PLAYER_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_fa TEXT, first_name_en TEXT, last_name_en TEXT, slug TEXT,
    date_of_birth TEXT, birth_place TEXT, nationality TEXT, citizenship_code TEXT, gender TEXT, height_cm REAL,
    weight_kg REAL, preferred_foot TEXT, primary_position TEXT, photo_url TEXT, status TEXT,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS players_name_en_idx ON players(name_en)`,
  `CREATE INDEX IF NOT EXISTS players_name_fa_idx ON players(name_fa)`,
  `CREATE TABLE IF NOT EXISTS player_provider_ids (
    id TEXT PRIMARY KEY, player_id TEXT NOT NULL, provider TEXT NOT NULL, external_id TEXT NOT NULL,
    first_seen_at INTEGER NOT NULL, last_seen_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS player_provider_external_uidx ON player_provider_ids(provider, external_id)`,
  `CREATE INDEX IF NOT EXISTS player_provider_player_idx ON player_provider_ids(player_id)`,
  `CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY, provider TEXT NOT NULL, external_id TEXT NOT NULL, league TEXT, name_en TEXT, name_fa TEXT,
    logo_url TEXT, updated_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS teams_provider_external_uidx ON teams(provider, external_id)`,
  `CREATE INDEX IF NOT EXISTS teams_league_idx ON teams(league)`,
  `CREATE TABLE IF NOT EXISTS player_team_periods (
    id TEXT PRIMARY KEY, player_id TEXT NOT NULL, team_id TEXT NOT NULL, league TEXT, season_year INTEGER,
    jersey_number TEXT, position TEXT, valid_from TEXT, valid_to TEXT, is_current INTEGER NOT NULL DEFAULT 1,
    first_seen_at INTEGER NOT NULL, last_seen_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS player_team_player_idx ON player_team_periods(player_id)`,
  `CREATE INDEX IF NOT EXISTS player_team_team_idx ON player_team_periods(team_id)`,
  `CREATE TABLE IF NOT EXISTS fixtures (
    id TEXT PRIMARY KEY, provider TEXT NOT NULL, external_id TEXT NOT NULL, league TEXT, season_year INTEGER,
    round_number INTEGER, kickoff_at TEXT, home_team_id TEXT, away_team_id TEXT, status TEXT, updated_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS fixtures_provider_external_uidx ON fixtures(provider, external_id)`,
  `CREATE INDEX IF NOT EXISTS fixtures_league_season_round_idx ON fixtures(league, season_year, round_number)`,
  `CREATE TABLE IF NOT EXISTS player_match_stats (
    id TEXT PRIMARY KEY, player_id TEXT NOT NULL, fixture_id TEXT NOT NULL, team_id TEXT NOT NULL, provider TEXT NOT NULL,
    starter INTEGER, position TEXT, minutes REAL, goals REAL, assists REAL, rating REAL, shots_total REAL,
    shots_on_target REAL, passes_total REAL, passes_accurate REAL, key_passes REAL, duels_total REAL, duels_won REAL,
    dribbles_attempted REAL, dribbles_completed REAL, tackles REAL, interceptions REAL, clearances REAL,
    possession_lost REAL, fouls_committed REAL, fouls_won REAL, yellow_cards REAL, red_cards REAL, xg REAL, xa REAL,
    stats_json TEXT NOT NULL, provider_updated_at INTEGER, updated_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS player_match_provider_uidx ON player_match_stats(player_id, fixture_id, provider)`,
  `CREATE INDEX IF NOT EXISTS player_match_player_idx ON player_match_stats(player_id)`,
  `CREATE INDEX IF NOT EXISTS player_match_fixture_idx ON player_match_stats(fixture_id)`,
  `CREATE TABLE IF NOT EXISTS player_season_stats (
    id TEXT PRIMARY KEY, player_id TEXT NOT NULL, team_id TEXT NOT NULL, provider TEXT NOT NULL, league TEXT,
    season_year INTEGER, appearances REAL, minutes REAL, goals REAL, assists REAL, rating REAL,
    stats_json TEXT NOT NULL, updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS player_season_player_idx ON player_season_stats(player_id)`,
  `CREATE INDEX IF NOT EXISTS player_season_league_idx ON player_season_stats(league, season_year)`,
  `CREATE TABLE IF NOT EXISTS match_events (
    id TEXT PRIMARY KEY, fixture_id TEXT NOT NULL, provider TEXT NOT NULL, external_id TEXT, sequence INTEGER,
    period INTEGER, minute INTEGER, second INTEGER, team_id TEXT, player_id TEXT, event_type TEXT NOT NULL,
    outcome TEXT, start_x REAL, start_y REAL, end_x REAL, end_y REAL, qualifiers_json TEXT, raw_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS match_events_fixture_idx ON match_events(fixture_id, sequence)`,
  `CREATE INDEX IF NOT EXISTS match_events_player_idx ON match_events(player_id)`,
];
let playerSchemaReady;

async function ensurePlayerSchema(env) {
  if (!env.DB) throw new Error("Database unavailable");
  if (!playerSchemaReady) {
    playerSchemaReady = (async () => {
      for (const sql of PLAYER_SCHEMA_SQL) await env.DB.prepare(sql).run();
    })().catch((error) => {
      playerSchemaReady = null;
      throw error;
    });
  }
  return playerSchemaReady;
}

async function runStatementBatches(env, statements, size = 40) {
  for (let offset = 0; offset < statements.length; offset += size) {
    const batch = statements.slice(offset, offset + size);
    if (typeof env.DB.batch === "function") await env.DB.batch(batch);
    else await Promise.all(batch.map((statement) => statement.run()));
  }
}

function numberOrNull(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sourceTeamId(source) {
  return source.pathname.match(/\/teams\/(\d+)/)?.[1] || null;
}

function sourceEventId(source) {
  return source.searchParams.get("event") || source.pathname.match(/\/events\/(\d+)/)?.[1] || null;
}

function athleteStats(athlete) {
  const values = {};
  const categories = athlete?.statistics?.splits?.categories || athlete?.statistics?.categories || [];
  for (const category of categories) for (const stat of category.stats || []) values[stat.name] = numberOrNull(stat.value ?? stat.displayValue);
  return values;
}

function rosterPlayerStatements(env, athlete, context, now) {
  const externalId = String(athlete?.id || "");
  if (!externalId) return [];
  const playerId = `espn:${externalId}`;
  const teamId = `espn:${context.teamId}`;
  const periodId = `espn:${context.league}:${context.seasonYear}:${context.teamId}:${externalId}`;
  const seasonStatsId = `${periodId}:season`;
  const stats = athleteStats(athlete);
  const birthPlace = athlete.birthPlace?.city || athlete.birthPlace?.country || null;
  const photo = athlete.headshot?.href || athlete.headshot?.url || athlete.photo?.href || null;
  const heightCm = numberOrNull(athlete.height) == null ? null : Math.round(Number(athlete.height) * 2.54 * 10) / 10;
  const weightKg = numberOrNull(athlete.weight) == null ? null : Math.round(Number(athlete.weight) * 0.45359237 * 10) / 10;
  return [
    env.DB.prepare(`INSERT INTO players (
      id,name_en,name_fa,first_name_en,last_name_en,slug,date_of_birth,birth_place,nationality,citizenship_code,gender,
      height_cm,weight_kg,preferred_foot,primary_position,photo_url,status,created_at,updated_at
    ) VALUES (?1,?2,NULL,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,NULL,?13,?14,?15,?16,?16)
    ON CONFLICT(id) DO UPDATE SET name_en=excluded.name_en,first_name_en=excluded.first_name_en,last_name_en=excluded.last_name_en,
      slug=excluded.slug,date_of_birth=COALESCE(excluded.date_of_birth,players.date_of_birth),birth_place=COALESCE(excluded.birth_place,players.birth_place),
      nationality=COALESCE(excluded.nationality,players.nationality),citizenship_code=COALESCE(excluded.citizenship_code,players.citizenship_code),
      gender=COALESCE(excluded.gender,players.gender),height_cm=COALESCE(excluded.height_cm,players.height_cm),weight_kg=COALESCE(excluded.weight_kg,players.weight_kg),
      primary_position=COALESCE(excluded.primary_position,players.primary_position),photo_url=COALESCE(excluded.photo_url,players.photo_url),
      status=COALESCE(excluded.status,players.status),updated_at=excluded.updated_at`)
      .bind(playerId, athlete.displayName || athlete.fullName || externalId, athlete.firstName || null, athlete.lastName || null, athlete.slug || null,
        athlete.dateOfBirth || null, birthPlace, athlete.citizenship || athlete.nationality || null, athlete.citizenshipCountry?.abbreviation || null,
        athlete.gender || null, heightCm, weightKg, athlete.position?.abbreviation || athlete.position?.displayName || null, photo,
        athlete.status?.type || athlete.status?.name || null, now),
    env.DB.prepare(`INSERT INTO player_provider_ids (id,player_id,provider,external_id,first_seen_at,last_seen_at)
      VALUES (?1,?2,'espn',?3,?4,?4) ON CONFLICT(id) DO UPDATE SET last_seen_at=excluded.last_seen_at`)
      .bind(`espn:${externalId}`, playerId, externalId, now),
    env.DB.prepare(`INSERT INTO player_team_periods (
      id,player_id,team_id,league,season_year,jersey_number,position,valid_from,valid_to,is_current,first_seen_at,last_seen_at
    ) VALUES (?1,?2,?3,?4,?5,?6,?7,NULL,NULL,1,?8,?8)
    ON CONFLICT(id) DO UPDATE SET jersey_number=excluded.jersey_number,position=excluded.position,is_current=1,last_seen_at=excluded.last_seen_at`)
      .bind(periodId, playerId, teamId, context.league, context.seasonYear, athlete.jersey || null,
        athlete.position?.abbreviation || athlete.position?.displayName || null, now),
    env.DB.prepare(`INSERT INTO player_season_stats (
      id,player_id,team_id,provider,league,season_year,appearances,minutes,goals,assists,rating,stats_json,updated_at
    ) VALUES (?1,?2,?3,'espn',?4,?5,?6,?7,?8,?9,?10,?11,?12)
    ON CONFLICT(id) DO UPDATE SET appearances=excluded.appearances,minutes=excluded.minutes,goals=excluded.goals,
      assists=excluded.assists,rating=excluded.rating,stats_json=excluded.stats_json,updated_at=excluded.updated_at`)
      .bind(seasonStatsId, playerId, teamId, context.league, context.seasonYear, stats.appearances ?? null, stats.minutes ?? null,
        stats.totalGoals ?? null, stats.goalAssists ?? null, stats.rating ?? stats.performanceScore ?? null, JSON.stringify(stats), now),
  ];
}

async function ingestRosterPayload(env, source, data) {
  const teamId = sourceTeamId(source);
  if (!teamId || !Array.isArray(data?.athletes)) return;
  await ensurePlayerSchema(env);
  const now = Math.floor(Date.now() / 1000);
  const context = { teamId, league: leagueFromSource(source), seasonYear: Number(data.season?.year) || null };
  const statements = [
    env.DB.prepare(`INSERT INTO teams (id,provider,external_id,league,name_en,name_fa,logo_url,updated_at)
      VALUES (?1,'espn',?2,?3,NULL,NULL,NULL,?4)
      ON CONFLICT(id) DO UPDATE SET league=COALESCE(excluded.league,teams.league),updated_at=excluded.updated_at`)
      .bind(`espn:${teamId}`, teamId, context.league, now),
    ...data.athletes.flatMap((athlete) => rosterPlayerStatements(env, athlete, context, now)),
  ];
  await runStatementBatches(env, statements);
}

async function ingestTeamPayload(env, source, data) {
  const teamId = sourceTeamId(source);
  const team = data?.team;
  if (!teamId || !team) return;
  await ensurePlayerSchema(env);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`INSERT INTO teams (id,provider,external_id,league,name_en,name_fa,logo_url,updated_at)
    VALUES (?1,'espn',?2,?3,?4,NULL,?5,?6)
    ON CONFLICT(id) DO UPDATE SET league=COALESCE(excluded.league,teams.league),name_en=COALESCE(excluded.name_en,teams.name_en),
      logo_url=COALESCE(excluded.logo_url,teams.logo_url),updated_at=excluded.updated_at`)
    .bind(`espn:${teamId}`, teamId, leagueFromSource(source), team.displayName || team.name || null,
      team.logos?.[0]?.href || team.logo || null, now).run();
}

function rosterEntryStats(entry) {
  const values = {};
  for (const stat of entry?.stats || entry?.statistics || []) values[stat.name] = numberOrNull(stat.value ?? stat.displayValue);
  return values;
}

async function ingestMatchPayload(env, source, data) {
  const externalFixtureId = sourceEventId(source);
  const competition = data?.header?.competitions?.[0];
  if (!externalFixtureId || !competition) return;
  await ensurePlayerSchema(env);
  const now = Math.floor(Date.now() / 1000);
  const fixtureId = `espn:${externalFixtureId}`;
  const league = leagueFromSource(source);
  const competitors = competition.competitors || [];
  const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
  const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
  const statements = [
    env.DB.prepare(`INSERT INTO fixtures (id,provider,external_id,league,season_year,round_number,kickoff_at,home_team_id,away_team_id,status,updated_at)
      VALUES (?1,'espn',?2,?3,?4,?5,?6,?7,?8,?9,?10)
      ON CONFLICT(id) DO UPDATE SET round_number=COALESCE(excluded.round_number,fixtures.round_number),kickoff_at=COALESCE(excluded.kickoff_at,fixtures.kickoff_at),
        home_team_id=excluded.home_team_id,away_team_id=excluded.away_team_id,status=excluded.status,updated_at=excluded.updated_at`)
      .bind(fixtureId, externalFixtureId, league, Number(data.header?.season?.year || data.season?.year) || null,
        numberOrNull(competition.week?.number || data.header?.week), competition.date || data.header?.date || null,
        home?.team?.id ? `espn:${home.team.id}` : null, away?.team?.id ? `espn:${away.team.id}` : null,
        competition.status?.type?.name || competition.status?.type?.state || null, now),
  ];
  for (const competitor of competitors) {
    const team = competitor.team || {};
    if (!team.id) continue;
    statements.push(env.DB.prepare(`INSERT INTO teams (id,provider,external_id,league,name_en,name_fa,logo_url,updated_at)
      VALUES (?1,'espn',?2,?3,?4,NULL,?5,?6)
      ON CONFLICT(id) DO UPDATE SET name_en=COALESCE(excluded.name_en,teams.name_en),logo_url=COALESCE(excluded.logo_url,teams.logo_url),updated_at=excluded.updated_at`)
      .bind(`espn:${team.id}`, String(team.id), league, team.displayName || team.name || null, team.logo || team.logos?.[0]?.href || null, now));
  }
  for (const roster of data.rosters || []) {
    const teamExternalId = String(roster.team?.id || "");
    if (!teamExternalId) continue;
    for (const entry of roster.roster || []) {
      const athlete = entry.athlete || {};
      const externalId = String(athlete.id || "");
      if (!externalId) continue;
      const playerId = `espn:${externalId}`;
      const stats = rosterEntryStats(entry);
      const matchStat = (name) => stats[name] ?? null;
      statements.push(...rosterPlayerStatements(env, { ...athlete, jersey: entry.jersey, position: entry.position }, {
        teamId: teamExternalId, league, seasonYear: Number(data.header?.season?.year || data.season?.year) || null,
      }, now).slice(0, 3));
      statements.push(env.DB.prepare(`INSERT INTO player_match_stats (
        id,player_id,fixture_id,team_id,provider,starter,position,minutes,goals,assists,rating,shots_total,shots_on_target,
        passes_total,passes_accurate,key_passes,duels_total,duels_won,dribbles_attempted,dribbles_completed,tackles,
        interceptions,clearances,possession_lost,fouls_committed,fouls_won,yellow_cards,red_cards,xg,xa,stats_json,provider_updated_at,updated_at
      ) VALUES (?1,?2,?3,?4,'espn',?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?31)
      ON CONFLICT(id) DO UPDATE SET starter=excluded.starter,position=excluded.position,minutes=excluded.minutes,goals=excluded.goals,
        assists=excluded.assists,rating=excluded.rating,shots_total=excluded.shots_total,shots_on_target=excluded.shots_on_target,
        passes_total=excluded.passes_total,passes_accurate=excluded.passes_accurate,key_passes=excluded.key_passes,
        duels_total=excluded.duels_total,duels_won=excluded.duels_won,dribbles_attempted=excluded.dribbles_attempted,
        dribbles_completed=excluded.dribbles_completed,tackles=excluded.tackles,interceptions=excluded.interceptions,
        clearances=excluded.clearances,possession_lost=excluded.possession_lost,fouls_committed=excluded.fouls_committed,
        fouls_won=excluded.fouls_won,yellow_cards=excluded.yellow_cards,red_cards=excluded.red_cards,xg=excluded.xg,xa=excluded.xa,
        stats_json=excluded.stats_json,provider_updated_at=excluded.provider_updated_at,updated_at=excluded.updated_at`)
        .bind(`espn:${externalFixtureId}:${externalId}`, playerId, fixtureId, `espn:${teamExternalId}`, entry.starter ? 1 : 0,
          entry.position?.abbreviation || entry.position?.displayName || null, matchStat("minutes"), matchStat("totalGoals"), matchStat("goalAssists"),
          stats.rating ?? stats.performanceScore ?? null, matchStat("totalShots"), matchStat("shotsOnTarget"), matchStat("totalPasses"), matchStat("accuratePasses"),
          matchStat("keyPasses"), matchStat("totalDuels"), matchStat("duelsWon"), matchStat("dribblesAttempted"), matchStat("dribblesCompleted"), matchStat("totalTackles"),
          matchStat("interceptions"), matchStat("totalClearance"), matchStat("possessionLost"), matchStat("foulsCommitted"), matchStat("foulsSuffered"),
          matchStat("yellowCards"), matchStat("redCards"), matchStat("expectedGoals"), matchStat("expectedAssists"), JSON.stringify(stats), now));
    }
  }
  for (const [index, play] of (data.plays || []).entries()) {
    const externalId = String(play.id || index + 1);
    const athleteId = play.participants?.[0]?.athlete?.id;
    const coordinate = play.coordinate || play.coordinates || {};
    const clockSeconds = numberOrNull(play.clock?.value);
    statements.push(env.DB.prepare(`INSERT INTO match_events (
      id,fixture_id,provider,external_id,sequence,period,minute,second,team_id,player_id,event_type,outcome,start_x,start_y,end_x,end_y,qualifiers_json,raw_json,updated_at
    ) VALUES (?1,?2,'espn',?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,NULL,NULL,?14,?15,?16)
    ON CONFLICT(id) DO UPDATE SET outcome=excluded.outcome,qualifiers_json=excluded.qualifiers_json,raw_json=excluded.raw_json,updated_at=excluded.updated_at`)
      .bind(`espn:${externalFixtureId}:event:${externalId}`, fixtureId, externalId, index + 1, numberOrNull(play.period?.number || play.period),
        clockSeconds == null ? numberOrNull(String(play.clock?.displayValue || "").match(/\d+/)?.[0]) : Math.floor(clockSeconds / 60),
        clockSeconds == null ? null : Math.floor(clockSeconds % 60), play.team?.id ? `espn:${play.team.id}` : null,
        athleteId ? `espn:${athleteId}` : null, play.type?.type || play.type?.text || "unknown", play.scoringPlay ? "success" : null,
        numberOrNull(coordinate.x), numberOrNull(coordinate.y), JSON.stringify({ text: play.text || null, participants: play.participants || [] }),
        JSON.stringify(play), now));
  }
  await runStatementBatches(env, statements);
}

async function normalizeSportsPayload(env, source, kind, payload) {
  if (!env.DB || !["roster", "team", "match"].includes(kind)) return;
  const data = typeof payload === "string" ? JSON.parse(payload) : payload;
  if (kind === "roster") return ingestRosterPayload(env, source, data);
  if (kind === "team") return ingestTeamPayload(env, source, data);
  if (kind === "match") return ingestMatchPayload(env, source, data);
}

function jsonResponse(value, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(value), { ...init, headers });
}

function staticResponse(pathname) {
  if (Object.hasOwn(TEXT_ASSETS, pathname)) {
    const type = pathname.endsWith(".js")
      ? "text/javascript; charset=utf-8"
      : pathname.endsWith(".json")
        ? "application/json; charset=utf-8"
        : "text/html; charset=utf-8";
    return new Response(TEXT_ASSETS[pathname], {
      headers: { "content-type": type, "cache-control": pathname === "/" || pathname === "/index.html" ? "no-cache" : "public, max-age=300" },
    });
  }
  if (Object.hasOwn(BINARY_ASSETS, pathname)) {
    const bytes = Uint8Array.from(atob(BINARY_ASSETS[pathname]), (character) => character.charCodeAt(0));
    return new Response(bytes, {
      headers: { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable" },
    });
  }
  return null;
}

function validatedSource(raw) {
  if (!raw) return null;
  try {
    const source = new URL(raw);
    if (source.protocol !== "https:" || source.hostname !== UPSTREAM_HOST) return null;
    if (!ALLOWED_PATHS.some((prefix) => source.pathname.startsWith(prefix))) return null;
    return source;
  } catch {
    return null;
  }
}

function leagueFromSource(source) {
  const match = source.pathname.match(/\/soccer\/([^/]+)/);
  return match?.[1] === "all" ? null : match?.[1] || null;
}

async function readCached(env, sourceUrl) {
  return env.DB.prepare(
    "SELECT source_url, kind, league, payload, fetched_at, expires_at, last_error FROM sports_cache WHERE source_url = ?1",
  ).bind(sourceUrl).first();
}

async function recordError(env, sourceUrl, message) {
  await env.DB.prepare(
    "UPDATE sports_cache SET last_error = ?1 WHERE source_url = ?2",
  ).bind(String(message).slice(0, 500), sourceUrl).run();
}

async function refreshCached(env, source, kind) {
  const sourceUrl = source.toString();
  try {
    const fetchUrl = new URL(sourceUrl);
    fetchUrl.hostname = UPSTREAM_FETCH_HOST;
    const upstream = await fetch(fetchUrl.toString(), { headers: { accept: "application/json" } });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const payload = await upstream.text();
    JSON.parse(payload);
    const fetchedAt = Math.floor(Date.now() / 1000);
    const expiresAt = fetchedAt + CACHE_TTL_SECONDS[kind];
    await env.DB.prepare(
      `INSERT INTO sports_cache (source_url, kind, league, payload, fetched_at, expires_at, last_error)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL)
       ON CONFLICT(source_url) DO UPDATE SET
         kind = excluded.kind,
         league = excluded.league,
         payload = excluded.payload,
         fetched_at = excluded.fetched_at,
         expires_at = excluded.expires_at,
         last_error = NULL`,
    ).bind(sourceUrl, kind, leagueFromSource(source), payload, fetchedAt, expiresAt).run();
    return { payload, fetchedAt, expiresAt };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("sports-data-refresh-failed", JSON.stringify({ sourceUrl, kind, message }));
    await recordError(env, sourceUrl, message).catch(() => {});
    throw error;
  }
}

function cachedPayloadResponse(record, status) {
  return new Response(record.payload, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, max-age=0, must-revalidate",
      "x-nimkat-data-source": "d1",
      "x-nimkat-cache-status": status,
      "x-nimkat-updated-at": String(record.fetched_at),
    },
  });
}

async function sportsDataResponse(request, env, ctx) {
  if (!env.DB) return jsonResponse({ error: "پایگاه داده متصل نیست." }, { status: 503 });
  const requestUrl = new URL(request.url);
  const source = validatedSource(requestUrl.searchParams.get("source"));
  const kind = requestUrl.searchParams.get("kind") || "scoreboard";
  if (!source || !ALLOWED_KINDS.has(kind)) {
    return jsonResponse({ error: "درخواست داده معتبر نیست." }, { status: 400 });
  }

  const sourceUrl = source.toString();
  const now = Math.floor(Date.now() / 1000);
  const cached = await readCached(env, sourceUrl);
  if (cached) {
    ctx.waitUntil(normalizeSportsPayload(env, source, kind, cached.payload).catch((error) => console.error("player-dataset-normalize-failed", error)));
    if (Number(cached.expires_at) <= now) {
      ctx.waitUntil(refreshCached(env, source, kind).catch(() => {}));
      return cachedPayloadResponse(cached, "stale");
    }
    return cachedPayloadResponse(cached, "hit");
  }

  try {
    const fresh = await refreshCached(env, source, kind);
    ctx.waitUntil(normalizeSportsPayload(env, source, kind, fresh.payload).catch((error) => console.error("player-dataset-normalize-failed", error)));
    return cachedPayloadResponse({ payload: fresh.payload, fetched_at: fresh.fetchedAt }, "stored");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse(
      { error: "داده ورزشی فعلاً در دسترس نیست و نسخه ذخیره‌شده‌ای وجود ندارد." },
      { status: 502, headers: { "x-nimkat-ingestion-error": message.slice(0, 180) } },
    );
  }
}

async function playerRecord(env, playerId) {
  return env.DB.prepare(`SELECT id,name_en,name_fa,first_name_en,last_name_en,slug,date_of_birth,birth_place,nationality,
    citizenship_code,gender,height_cm,weight_kg,preferred_foot,primary_position,photo_url,status,created_at,updated_at
    FROM players WHERE id=?1`).bind(playerId).first();
}

async function hydrateMissingPlayer(env, playerId, league, teamId) {
  if (!/^espn:\d+$/.test(playerId) || !/^[a-z0-9.]+$/.test(league || "") || !/^\d+$/.test(teamId || "")) return null;
  const source = new URL(`https://${UPSTREAM_HOST}/apis/site/v2/sports/soccer/${league}/teams/${teamId}/roster`);
  const cached = await readCached(env, source.toString());
  let payload = cached?.payload;
  if (!payload) payload = (await refreshCached(env, source, "roster")).payload;
  await ingestRosterPayload(env, source, JSON.parse(payload));
  return playerRecord(env, playerId);
}

function parseStoredJson(rows, field = "stats_json") {
  return rows.map((row) => {
    if (!row?.[field]) return row;
    try { return { ...row, [field]: JSON.parse(row[field]) }; } catch { return row; }
  });
}

async function playerDataResponse(request, env, rawId) {
  if (!env.DB) return jsonResponse({ error: "پایگاه داده متصل نیست." }, { status: 503 });
  await ensurePlayerSchema(env);
  const requestUrl = new URL(request.url);
  const playerId = decodeURIComponent(rawId || "").replace("~", ":");
  if (!/^[a-z0-9_-]+:\d+$/i.test(playerId)) return jsonResponse({ error: "شناسه بازیکن معتبر نیست." }, { status: 400 });
  let player = await playerRecord(env, playerId);
  if (!player) player = await hydrateMissingPlayer(env, playerId, requestUrl.searchParams.get("league"), requestUrl.searchParams.get("team"));
  if (!player) return jsonResponse({ error: "بازیکن در دیتاست نیمکت پیدا نشد." }, { status: 404 });
  const [providersResult, teamsResult, seasonsResult, matchesResult, weeksResult] = await Promise.all([
    env.DB.prepare(`SELECT provider,external_id,first_seen_at,last_seen_at FROM player_provider_ids WHERE player_id=?1 ORDER BY provider`).bind(playerId).all(),
    env.DB.prepare(`SELECT p.team_id,p.league,p.season_year,p.jersey_number,p.position,p.valid_from,p.valid_to,p.is_current,
      t.name_en AS team_name_en,t.name_fa AS team_name_fa,t.logo_url
      FROM player_team_periods p LEFT JOIN teams t ON t.id=p.team_id WHERE p.player_id=?1 ORDER BY p.is_current DESC,p.season_year DESC`).bind(playerId).all(),
    env.DB.prepare(`SELECT s.*,t.name_en AS team_name_en,t.name_fa AS team_name_fa FROM player_season_stats s
      LEFT JOIN teams t ON t.id=s.team_id WHERE s.player_id=?1 ORDER BY s.season_year DESC,s.league`).bind(playerId).all(),
    env.DB.prepare(`SELECT s.*,f.external_id AS fixture_external_id,f.league,f.season_year,f.round_number,f.kickoff_at,f.home_team_id,f.away_team_id,f.status,
      t.name_en AS team_name_en,t.name_fa AS team_name_fa FROM player_match_stats s
      JOIN fixtures f ON f.id=s.fixture_id LEFT JOIN teams t ON t.id=s.team_id
      WHERE s.player_id=?1 ORDER BY f.kickoff_at DESC LIMIT 40`).bind(playerId).all(),
    env.DB.prepare(`SELECT f.league,f.season_year,f.round_number,COUNT(*) AS matches,SUM(COALESCE(s.minutes,0)) AS minutes,
      SUM(COALESCE(s.goals,0)) AS goals,SUM(COALESCE(s.assists,0)) AS assists,AVG(s.rating) AS rating,
      SUM(COALESCE(s.shots_total,0)) AS shots_total,SUM(COALESCE(s.shots_on_target,0)) AS shots_on_target,
      SUM(COALESCE(s.key_passes,0)) AS key_passes,SUM(COALESCE(s.duels_total,0)) AS duels_total,
      SUM(COALESCE(s.duels_won,0)) AS duels_won,SUM(COALESCE(s.tackles,0)) AS tackles,SUM(COALESCE(s.interceptions,0)) AS interceptions
      FROM player_match_stats s JOIN fixtures f ON f.id=s.fixture_id WHERE s.player_id=?1
      GROUP BY f.league,f.season_year,f.round_number ORDER BY f.season_year DESC,f.round_number DESC`).bind(playerId).all(),
  ]);
  const matches = parseStoredJson(matchesResult.results || []);
  const availableMetrics = [...new Set(matches.flatMap((row) => Object.entries(row.stats_json || {}).filter(([, value]) => value != null).map(([name]) => name)))];
  return jsonResponse({
    player,
    providers: providersResult.results || [],
    teams: teamsResult.results || [],
    seasons: parseStoredJson(seasonsResult.results || []),
    matches,
    weeks: weeksResult.results || [],
    coverage: { provider: "espn", available_metrics: availableMetrics, advanced_metrics_require_licensed_feed: true },
  });
}

async function playerDatasetStatus(env) {
  if (!env.DB) return jsonResponse({ error: "پایگاه داده متصل نیست." }, { status: 503 });
  await ensurePlayerSchema(env);
  const counts = {};
  for (const table of ["players", "player_provider_ids", "player_team_periods", "player_season_stats", "player_match_stats", "match_events"]) {
    const row = await env.DB.prepare(`SELECT COUNT(*) AS count,MAX(updated_at) AS updated_at FROM ${table}`).first().catch(async () => {
      const fallback = await env.DB.prepare(`SELECT COUNT(*) AS count,MAX(last_seen_at) AS updated_at FROM ${table}`).first();
      return fallback;
    });
    counts[table] = { records: Number(row?.count || 0), updated_at: row?.updated_at || null };
  }
  return jsonResponse({ storage: "d1", canonical_dataset: counts });
}

async function syncPlayerDataset(request, env) {
  if (!env.PLAYER_SYNC_TOKEN || request.headers.get("x-nimkat-sync-token") !== env.PLAYER_SYNC_TOKEN) {
    return jsonResponse({ error: "دسترسی غیرمجاز." }, { status: 401 });
  }
  const input = await request.json().catch(() => ({}));
  const league = String(input.league || "");
  const teamIds = Array.isArray(input.team_ids) ? [...new Set(input.team_ids.map(String))].filter((id) => /^\d+$/.test(id)).slice(0, 5) : [];
  if (!/^(eng|esp|ita|ger|fra|ned)\.1$/.test(league) || !teamIds.length) return jsonResponse({ error: "لیگ یا تیم‌ها معتبر نیستند." }, { status: 400 });
  await ensurePlayerSchema(env);
  const results = [];
  for (const teamId of teamIds) {
    const teamSource = new URL(`https://${UPSTREAM_HOST}/apis/site/v2/sports/soccer/${league}/teams/${teamId}`);
    const rosterSource = new URL(`${teamSource}/roster`);
    try {
      const [teamPayload, rosterPayload] = await Promise.all([refreshCached(env, teamSource, "team"), refreshCached(env, rosterSource, "roster")]);
      await ingestTeamPayload(env, teamSource, JSON.parse(teamPayload.payload));
      const rosterData = JSON.parse(rosterPayload.payload);
      await ingestRosterPayload(env, rosterSource, rosterData);
      results.push({ team_id: teamId, players: rosterData.athletes?.length || 0, status: "stored" });
    } catch (error) {
      results.push({ team_id: teamId, players: 0, status: "failed", error: String(error?.message || error).slice(0, 160) });
    }
  }
  return jsonResponse({ league, teams: results });
}

async function dataStatus(env) {
  if (!env.DB) return jsonResponse({ error: "پایگاه داده متصل نیست." }, { status: 503 });
  const summary = await env.DB.prepare(
    "SELECT kind, COUNT(*) AS records, MAX(fetched_at) AS last_updated FROM sports_cache GROUP BY kind ORDER BY kind",
  ).all();
  return jsonResponse({ storage: "d1", datasets: summary.results || [] });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const playerMatch = url.pathname.match(/^\/api\/players\/([^/]+)$/);
    if (request.method === "GET" && playerMatch) {
      return playerDataResponse(request, env, playerMatch[1]);
    }
    if (request.method === "GET" && url.pathname === "/api/player-dataset/status") {
      return playerDatasetStatus(env);
    }
    if (request.method === "POST" && url.pathname === "/api/player-dataset/sync") {
      return syncPlayerDataset(request, env);
    }
    if (request.method === "GET" && url.pathname === "/api/sports-data") {
      return sportsDataResponse(request, env, ctx);
    }
    if (request.method === "GET" && url.pathname === "/api/sports-data/status") {
      return dataStatus(env);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    const asset = staticResponse(url.pathname);
    if (asset) return request.method === "HEAD" ? new Response(null, { status: asset.status, headers: asset.headers }) : asset;
    const app = staticResponse("/");
    return request.method === "HEAD" ? new Response(null, { status: app.status, headers: app.headers }) : app;
  },
};
