import assert from "node:assert/strict";

const { default: worker } = await import("../dist/server/index.js");
const records = new Map();
const executedSql = [];
const env = {
  DB: {
    prepare(sql) {
      return {
        sql,
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async first() {
          return records.get(this.values[0]) || null;
        },
        async run() {
          const placeholders = [...sql.matchAll(/\?(\d+)/g)].map((match) => Number(match[1]));
          const expected = placeholders.length ? Math.max(...placeholders) : 0;
          assert.equal(this.values.length, expected, `Bind count mismatch: ${sql.slice(0, 90)}`);
          executedSql.push(sql);
          if (sql.startsWith("INSERT INTO sports_cache")) {
            const [source_url, kind, league, payload, fetched_at, expires_at] = this.values;
            records.set(source_url, { source_url, kind, league, payload, fetched_at, expires_at, last_error: null });
          }
          return { success: true };
        },
        async all() {
          return { results: [] };
        },
      };
    },
  },
};
const pending = [];
const ctx = { waitUntil(promise) { pending.push(promise); } };

const home = await worker.fetch(new Request("https://nimkat.test/"), env, ctx);
assert.equal(home.status, 200);
const homepage = await home.text();
assert.match(homepage, /نیمکت/);
assert.match(homepage, /limit=1000/);
assert.match(homepage, /function matchScorePair/);
assert.match(homepage, /id="leagueWeekSelect"/);
assert.match(homepage, /function groupLeagueRounds/);
assert.match(homepage, /function seasonMonthKeys/);
assert.doesNotMatch(homepage, /home-away-badge/);
assert.match(homepage, /function leagueFixtureGroups/);
assert.match(homepage, /standing-row \$\{zone\}/);
assert.match(homepage, /class="league-panel-meta"/);
assert.match(homepage, /class="league-panel-head"[^>]*>.*class="standings-filter"/);
assert.match(homepage, /function domesticStandingZones/);
assert.match(homepage, /function qualificationLegend/);
assert.match(homepage, /\.legend-dot\.ucl/);
assert.match(homepage, /\.legend-dot\.uel/);
assert.match(homepage, /\.legend-dot\.uecl/);
assert.match(homepage, /--league-logo/);
assert.match(homepage, /function tournamentLogo/);
assert.match(homepage, /setLeagueWatermark\(selectedLeague\)/);
assert.doesNotMatch(homepage, /\.fixtures-panel::before/);
assert.doesNotMatch(homepage, /class="league-center-heading"/);
assert.doesNotMatch(homepage, /لیگ‌های معتبر و رقابت‌های اروپایی/);
assert.match(homepage, /class="league-select" id="leagueSelect"/);
assert.doesNotMatch(homepage, /class="league-center-header"/);
assert.doesNotMatch(homepage, /داده رسمی ESPN/);
assert.match(homepage, /class="league-panel-copy"><label class="league-title-filter"><select class="league-select" id="leagueSelect"/);
assert.doesNotMatch(homepage, /faNumber\(Math\.max\(1,weekNumber\)\)\} ·/);
assert.match(homepage, /\.league-title-filter::after/);
assert.match(homepage, /class="week-navigation"[^>]*><label class="week-select-wrap"><select class="week-select"[^>]*>.*class="week-arrows"/);
assert.doesNotMatch(homepage, /\.standings-filter,\.week-navigation/);
assert.match(homepage, /\.league-title-filter \{[^}]*width:178px/);
assert.match(homepage, /\.week-select-wrap \{[^}]*width:84px/);
assert.match(homepage, /\.week-select-wrap::after/);
assert.doesNotMatch(homepage, /\.week-select \{ flex:1/);
assert.match(homepage, /\.league-select \{[^}]*font-size:11px/);
assert.match(homepage, /\.week-select \{[^}]*font-size:11px/);
assert.match(homepage, /id="standingsScenarioToggle"/);
assert.match(homepage, /id="standingsScenario"/);
assert.match(homepage, /function customStandingsFromRounds/);
assert.match(homepage, /function renderStandingsScenario/);
assert.match(homepage, /data-scenario-team/);
assert.match(homepage, /data-scenario-round/);
assert.match(homepage, /state\.teams\.clear\(\)/);
assert.match(homepage, /data-scenario-preset=\"teams-top6\"/);
assert.match(homepage, /data-scenario-preset=\"rounds-played\"/);
assert.match(homepage, /filter\(entry=>state\.teams\.has/);
assert.match(homepage, /if\(!state\.rounds\.has\(index\+1\)\)return/);
assert.doesNotMatch(homepage, /هفته‌هایی که از محاسبه حذف شوند/);
assert.match(homepage, /id="playerView"/);
assert.match(homepage, /function renderPlayerPage/);
assert.match(homepage, /function playerHref/);
assert.match(homepage, /NIMKAT_PLAYER_API='\/api\/players'/);
assert.match(homepage, /پاس کلیدی/);
assert.match(homepage, /function persianPlayerName/);
assert.match(homepage, /api\/v1\/json\/123\/searchplayers/);
assert.match(homepage, /آوانویسی خودکار/);

const workerSource = await (await import("node:fs/promises")).readFile(new URL("../worker/runtime.js", import.meta.url), "utf8");
assert.match(workerSource, /CREATE TABLE IF NOT EXISTS players/);
assert.match(workerSource, /CREATE TABLE IF NOT EXISTS player_match_stats/);
assert.match(workerSource, /CREATE TABLE IF NOT EXISTS match_events/);
assert.match(workerSource, /CREATE TABLE IF NOT EXISTS entity_localizations/);
assert.match(workerSource, /CREATE TABLE IF NOT EXISTS player_media/);
assert.match(workerSource, /async function ingestRosterPayload/);
assert.match(workerSource, /async function ingestMatchPayload/);
assert.match(workerSource, /async function hydratePlayerMedia/);
assert.match(workerSource, /async function localizePlayerDataset/);
assert.match(workerSource, /advanced_metrics_require_licensed_feed/);

let upstreamRequests = 0;
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input) => {
  upstreamRequests += 1;
  const url = String(input);
  const payload = url.includes("/roster") ? {
    season: { year: 2026 },
    athletes: [{ id: "10", firstName: "Test", lastName: "Player", displayName: "Test Player", dateOfBirth: "2000-01-01T00:00Z", height: 72, weight: 170, citizenship: "Testland", jersey: "9", position: { abbreviation: "F" }, statistics: { splits: { categories: [{ stats: [{ name: "appearances", value: 2 }, { name: "totalGoals", value: 1 }] }] } } }],
  } : url.includes("/summary") ? {
    header: { season: { year: 2026 }, competitions: [{ id: "fixture-2", date: "2026-09-21T18:00:00Z", week: { number: 5 }, status: { type: { name: "STATUS_FINAL" } }, competitors: [{ homeAway: "home", team: { id: "1", displayName: "Home" } }, { homeAway: "away", team: { id: "2", displayName: "Away" } }] }] },
    rosters: [{ team: { id: "1" }, roster: [{ starter: true, jersey: "9", position: { abbreviation: "F" }, athlete: { id: "10", displayName: "Test Player" }, stats: [{ name: "totalGoals", value: 1 }, { name: "goalAssists", value: 1 }] }] }],
    plays: [{ id: "play-1", period: { number: 1 }, clock: { value: 120 }, team: { id: "1" }, type: { type: "goal" }, participants: [{ athlete: { id: "10" } }], text: "Goal" }],
  } : { events: [{ id: "fixture-1" }] };
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
  });
};

const endpoint = "https://nimkat.test/api/sports-data?kind=scoreboard&source=" + encodeURIComponent("https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=20260921");
const first = await worker.fetch(new Request(endpoint), env, ctx);
const second = await worker.fetch(new Request(endpoint), env, ctx);
assert.equal(first.headers.get("x-nimkat-cache-status"), "stored");
assert.equal(second.headers.get("x-nimkat-cache-status"), "hit");
assert.equal(upstreamRequests, 1);
assert.deepEqual(await second.json(), { events: [{ id: "fixture-1" }] });

const rosterEndpoint = "https://nimkat.test/api/sports-data?kind=roster&source=" + encodeURIComponent("https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/1/roster");
assert.equal((await worker.fetch(new Request(rosterEndpoint), env, ctx)).status, 200);
await Promise.all(pending.splice(0));
assert.ok(executedSql.some((sql) => sql.includes("INSERT INTO players")));
assert.ok(executedSql.some((sql) => sql.includes("INSERT INTO player_season_stats")));
assert.ok(executedSql.some((sql) => sql.includes("INSERT INTO entity_localizations")));

const matchEndpoint = "https://nimkat.test/api/sports-data?kind=match&source=" + encodeURIComponent("https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/summary?event=fixture-2");
assert.equal((await worker.fetch(new Request(matchEndpoint), env, ctx)).status, 200);
await Promise.all(pending.splice(0));
assert.ok(executedSql.some((sql) => sql.includes("INSERT INTO player_match_stats")));
assert.ok(executedSql.some((sql) => sql.includes("INSERT INTO match_events")));
globalThis.fetch = nativeFetch;

const playerSql = [];
const playerEnv = {
  DB: {
    prepare(sql) {
      return {
        values: [],
        bind(...values) { this.values = values; return this; },
        async run() {
          const placeholders = [...sql.matchAll(/\?(\d+)/g)].map((match) => Number(match[1]));
          const expected = placeholders.length ? Math.max(...placeholders) : 0;
          assert.equal(this.values.length, expected, `Player bind count mismatch: ${sql.slice(0, 110)}`);
          playerSql.push(sql);
          return { success: true };
        },
        async first() {
          if (sql.includes("FROM players p LEFT JOIN entity_localizations")) return {
            id: "espn:124091", name_en: "Bruno Fernandes", name_fa: "برونو فرناندز", name_fa_verified: 1,
            primary_position: "M", created_at: 1, updated_at: 1,
          };
          if (sql.includes("FROM player_media WHERE id=")) return {
            id: "media", player_id: "espn:124091", team_id: "espn:360", kind: "team_portrait", url: null,
            source: "thesportsdb", status: "missing", captured_at: Math.floor(Date.now() / 1000), metadata_json: "{}",
          };
          return null;
        },
        async all() {
          if (sql.includes("FROM player_team_periods")) return { results: [{ team_id: "espn:360", league: "eng.1", season_year: 2026, is_current: 1, team_name_en: "Manchester United" }] };
          return { results: [] };
        },
      };
    },
  },
};
const playerResponse = await worker.fetch(new Request("https://nimkat.test/api/players/espn~124091?league=eng.1&team=360"), playerEnv, ctx);
assert.equal(playerResponse.status, 200);
const playerPayload = await playerResponse.json();
assert.equal(playerPayload.coverage.open_data.provider, "statsbomb-open");
assert.ok(playerPayload.coverage.open_data.matches >= 4);
assert.ok(playerSql.some((sql) => sql.includes("'statsbomb-open'")));

console.log("Worker, static assets, and D1 cache flow passed.");
