import assert from "node:assert/strict";

const { default: worker } = await import("../dist/server/index.js");
const records = new Map();
const env = {
  DB: {
    prepare(sql) {
      return {
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async first() {
          return records.get(this.values[0]) || null;
        },
        async run() {
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
const ctx = { waitUntil() {} };

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

let upstreamRequests = 0;
const nativeFetch = globalThis.fetch;
globalThis.fetch = async () => {
  upstreamRequests += 1;
  return new Response(JSON.stringify({ events: [{ id: "fixture-1" }] }), {
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
globalThis.fetch = nativeFetch;

console.log("Worker, static assets, and D1 cache flow passed.");
