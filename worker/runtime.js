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
    if (Number(cached.expires_at) <= now) {
      ctx.waitUntil(refreshCached(env, source, kind).catch(() => {}));
      return cachedPayloadResponse(cached, "stale");
    }
    return cachedPayloadResponse(cached, "hit");
  }

  try {
    const fresh = await refreshCached(env, source, kind);
    return cachedPayloadResponse({ payload: fresh.payload, fetched_at: fresh.fetchedAt }, "stored");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse(
      { error: "داده ورزشی فعلاً در دسترس نیست و نسخه ذخیره‌شده‌ای وجود ندارد." },
      { status: 502, headers: { "x-nimkat-ingestion-error": message.slice(0, 180) } },
    );
  }
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
