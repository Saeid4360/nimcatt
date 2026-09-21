import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const RAW_ROOT = "https://raw.githubusercontent.com/statsbomb/open-data/master/data";
const TARGETS = [
  { competitionId: 55, seasonId: 282, competition: "جام ملت‌های اروپا", seasonYear: 2024, league: "uefa.euro" },
];
const outputPath = resolve(import.meta.dirname, "../dist/data/statsbomb-open-players.json");

async function json(url) {
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "Nimkat open-data builder" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function seconds(value) {
  const match = String(value || "").match(/^(\d+):(\d+)/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

function blankStats() {
  return {
    minutes: 0, goals: 0, assists: 0, shots_total: 0, shots_on_target: 0, xg: 0, xa: 0,
    passes_total: 0, passes_accurate: 0, key_passes: 0, duels_total: 0, duels_won: 0,
    dribbles_attempted: 0, dribbles_completed: 0, tackles: 0, tackles_won: 0,
    interceptions: 0, clearances: 0, blocks: 0, recoveries: 0, pressures: 0, carries: 0,
    possession_lost: 0, fouls_committed: 0, fouls_won: 0, yellow_cards: 0, red_cards: 0,
  };
}

function won(value) {
  return /won|success|complete/i.test(String(value || ""));
}

function card(stats, value) {
  if (/red/i.test(String(value || ""))) stats.red_cards += 1;
  else if (/yellow/i.test(String(value || ""))) stats.yellow_cards += 1;
}

function round(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

const output = {
  version: 1,
  provider: "statsbomb-open",
  attribution: "StatsBomb Open Data",
  source_url: "https://github.com/statsbomb/open-data",
  license_url: "https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf",
  generated_at: new Date().toISOString(),
  competitions: [],
  teams: {},
  fixtures: {},
  players: {},
};

for (const target of TARGETS) {
  const matches = await json(`${RAW_ROOT}/matches/${target.competitionId}/${target.seasonId}.json`);
  output.competitions.push({ ...target, matches: matches.length });
  let completed = 0;
  for (const match of matches) {
    const matchId = String(match.match_id);
    const [lineups, events] = await Promise.all([
      json(`${RAW_ROOT}/lineups/${matchId}.json`),
      json(`${RAW_ROOT}/events/${matchId}.json`),
    ]);
    const homeId = String(match.home_team?.home_team_id || "");
    const awayId = String(match.away_team?.away_team_id || "");
    if (homeId) output.teams[homeId] = match.home_team?.home_team_name || homeId;
    if (awayId) output.teams[awayId] = match.away_team?.away_team_name || awayId;
    output.fixtures[matchId] = {
      competition: target.competition,
      league: target.league,
      season_year: target.seasonYear,
      round_number: match.match_week || null,
      stage: match.competition_stage?.name || null,
      kickoff_at: `${match.match_date}T${match.kick_off || "00:00:00"}`,
      status: "complete",
      home_team_id: homeId,
      away_team_id: awayId,
      home_score: match.home_score,
      away_score: match.away_score,
    };
    const matchStats = new Map();
    const playerMeta = new Map();
    const finalSecond = Math.max(90 * 60, ...events.map((event) => Number(event.minute || 0) * 60 + Number(event.second || 0)));
    for (const lineup of lineups) {
      const teamId = String(lineup.team_id || "");
      if (teamId) output.teams[teamId] = lineup.team_name || output.teams[teamId] || teamId;
      for (const player of lineup.lineup || []) {
        const playerId = String(player.player_id || "");
        if (!playerId) continue;
        const positions = player.positions || [];
        const substitutionOn = positions.find((position) => position.start_reason === "Substitution");
        const substitutionOff = positions.find((position) => position.end_reason === "Substitution");
        const started = positions.some((position) => position.start_reason === "Starting XI" || position.from === "00:00");
        const playedFrom = started ? 0 : substitutionOn ? seconds(substitutionOn.from) : positions.length ? Math.min(...positions.map((position) => seconds(position.from))) : finalSecond;
        const playedTo = substitutionOff?.to ? seconds(substitutionOff.to) : positions.length ? finalSecond : playedFrom;
        const playedSeconds = Math.max(0, playedTo - playedFrom);
        const stats = blankStats();
        stats.minutes = Math.round(playedSeconds / 60);
        matchStats.set(playerId, stats);
        playerMeta.set(playerId, {
          name: player.player_name || playerId,
          nickname: player.player_nickname || null,
          team_id: teamId,
          jersey_number: player.jersey_number ?? null,
          starter: started,
          position: positions[0]?.position || null,
        });
      }
    }
    const passByEvent = new Map();
    const shotByKeyPass = new Map();
    for (const event of events) {
      const playerId = String(event.player?.id || "");
      if (!playerId) continue;
      if (!matchStats.has(playerId)) matchStats.set(playerId, blankStats());
      if (!playerMeta.has(playerId)) playerMeta.set(playerId, {
        name: event.player?.name || playerId, nickname: null, team_id: String(event.team?.id || ""),
        jersey_number: null, starter: false, position: event.position?.name || null,
      });
      const stats = matchStats.get(playerId);
      const type = event.type?.name || "";
      if (type === "Pass") {
        stats.passes_total += 1;
        if (!event.pass?.outcome) stats.passes_accurate += 1;
        if (event.pass?.shot_assist || event.pass?.goal_assist) stats.key_passes += 1;
        if (event.pass?.goal_assist) stats.assists += 1;
        passByEvent.set(String(event.id), playerId);
      } else if (type === "Shot") {
        stats.shots_total += 1;
        const outcome = event.shot?.outcome?.name || "";
        if (/goal|saved/i.test(outcome)) stats.shots_on_target += 1;
        if (outcome === "Goal") stats.goals += 1;
        stats.xg += Number(event.shot?.statsbomb_xg || 0);
        if (event.shot?.key_pass_id) shotByKeyPass.set(String(event.shot.key_pass_id), Number(event.shot?.statsbomb_xg || 0));
      } else if (type === "Duel") {
        stats.duels_total += 1;
        if (won(event.duel?.outcome?.name)) stats.duels_won += 1;
        if (event.duel?.type?.name === "Tackle") {
          stats.tackles += 1;
          if (won(event.duel?.outcome?.name)) stats.tackles_won += 1;
        }
      } else if (type === "Dribble") {
        stats.dribbles_attempted += 1;
        if (/complete/i.test(event.dribble?.outcome?.name || "")) stats.dribbles_completed += 1;
      } else if (type === "Interception") stats.interceptions += 1;
      else if (type === "Clearance") stats.clearances += 1;
      else if (type === "Block") stats.blocks += 1;
      else if (type === "Ball Recovery") stats.recoveries += 1;
      else if (type === "Pressure") stats.pressures += 1;
      else if (type === "Carry") stats.carries += 1;
      else if (type === "Miscontrol" || type === "Dispossessed") stats.possession_lost += 1;
      else if (type === "Foul Committed") {
        stats.fouls_committed += 1;
        card(stats, event.foul_committed?.card?.name);
      } else if (type === "Foul Won") stats.fouls_won += 1;
      else if (type === "Bad Behaviour") card(stats, event.bad_behaviour?.card?.name);
    }
    for (const [eventId, xg] of shotByKeyPass) {
      const passerId = passByEvent.get(eventId);
      if (passerId && matchStats.has(passerId)) matchStats.get(passerId).xa += xg;
    }
    for (const [playerId, stats] of matchStats) {
      const meta = playerMeta.get(playerId);
      if (!meta) continue;
      for (const key of ["xg", "xa"]) stats[key] = round(stats[key]);
      const current = output.players[playerId] || {
        external_id: playerId,
        name: meta.name,
        nickname: meta.nickname,
        aliases: [...new Set([meta.name, meta.nickname].filter(Boolean))],
        matches: {},
      };
      current.matches[matchId] = { team_id: meta.team_id, jersey_number: meta.jersey_number, starter: meta.starter, position: meta.position, ...stats };
      output.players[playerId] = current;
    }
    completed += 1;
    process.stdout.write(`\rStatsBomb ${target.competition}: ${completed}/${matches.length}`);
  }
  process.stdout.write("\n");
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(output));
console.log(`Wrote ${outputPath} (${Object.keys(output.players).length} players, ${Object.keys(output.fixtures).length} matches)`);
