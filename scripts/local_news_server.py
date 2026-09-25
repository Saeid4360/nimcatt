#!/usr/bin/env python3
"""Serve the local newsroom and its archive API."""

from __future__ import annotations

import argparse
import json
import ssl
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit, urlunsplit


PROJECT = Path(__file__).resolve().parents[1]
DIST = PROJECT / "dist"
REFRESH_SECONDS = 15 * 60
refresh_lock = threading.Lock()
refreshing = False
last_error = ""
sports_cache: dict[str, tuple[float, bytes]] = {}
sports_cache_lock = threading.Lock()
SPORTS_CACHE_TTL = {
    "scoreboard": 120,
    "match": 120,
    "standings": 1800,
    "schedule": 3600,
    "team": 21600,
    "roster": 21600,
}
SPORTS_PATH_PREFIXES = (
    "/apis/site/v2/sports/soccer/",
    "/apis/v2/sports/soccer/",
)
SPORTS_SSL_CONTEXT = ssl.create_default_context()
SYSTEM_CERTIFICATES = Path("/etc/ssl/cert.pem")
if SYSTEM_CERTIFICATES.exists():
    SPORTS_SSL_CONTEXT.load_verify_locations(cafile=str(SYSTEM_CERTIFICATES))


def read_json(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return fallback


def generated_at(meta: dict) -> float:
    try:
        value = datetime.fromisoformat(str(meta.get("generatedAt", "")).replace("Z", "+00:00"))
        return value.replace(tzinfo=value.tzinfo or timezone.utc).timestamp()
    except ValueError:
        return 0


def refresh_news() -> None:
    global refreshing, last_error
    try:
        command = [sys.executable, "scripts/sports_news_scraper.py", "--max-items", "800", "--workers", "20", "--timeout", "12"]
        result = subprocess.run(command, cwd=PROJECT, capture_output=True, text=True, timeout=420)
        (PROJECT / "var/local_news_refresh.log").write_text(result.stdout + "\n" + result.stderr, encoding="utf-8")
        last_error = "" if result.returncode == 0 else f"refresh exited with {result.returncode}"
    except (OSError, subprocess.TimeoutExpired) as exc:
        last_error = str(exc)
    finally:
        with refresh_lock:
            refreshing = False


def start_refresh() -> None:
    global refreshing
    with refresh_lock:
        if refreshing:
            return
        refreshing = True
    threading.Thread(target=refresh_news, daemon=True, name="news-refresh").start()


def validated_sports_source(raw: str) -> str | None:
    parsed = urlsplit(raw)
    if parsed.scheme != "https" or parsed.hostname != "site.api.espn.com":
        return None
    if not any(parsed.path.startswith(prefix) for prefix in SPORTS_PATH_PREFIXES):
        return None
    return urlunsplit(("https", "site.web.api.espn.com", parsed.path, parsed.query, ""))


def sports_payload(source: str, kind: str) -> tuple[bytes, str]:
    now = time.time()
    with sports_cache_lock:
        cached = sports_cache.get(source)
        if cached and cached[0] > now:
            return cached[1], "hit"

    request = urllib.request.Request(
        source,
        headers={"Accept": "application/json", "User-Agent": "NimkatLocal/1.0"},
    )
    with urllib.request.urlopen(request, timeout=18, context=SPORTS_SSL_CONTEXT) as response:
        payload = response.read()
    json.loads(payload)
    with sports_cache_lock:
        sports_cache[source] = (now + SPORTS_CACHE_TTL[kind], payload)
    return payload, "stored"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):  # noqa: N802
        parsed = urlsplit(self.path)
        if parsed.path == "/api/sports-data":
            query = parse_qs(parsed.query)
            kind = query.get("kind", ["scoreboard"])[0]
            source = validated_sports_source(query.get("source", [""])[0])
            if not source or kind not in SPORTS_CACHE_TTL:
                self.send_json({"error": "درخواست داده ورزشی معتبر نیست."}, HTTPStatus.BAD_REQUEST)
                return
            try:
                payload, cache_status = sports_payload(source, kind)
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(payload)))
                self.send_header("X-Nimkat-Cache-Status", cache_status)
                self.end_headers()
                self.wfile.write(payload)
            except (OSError, ValueError, json.JSONDecodeError, urllib.error.URLError) as exc:
                self.send_json(
                    {"error": "داده ورزشی فعلاً در دسترس نیست.", "detail": str(exc)[:180]},
                    HTTPStatus.BAD_GATEWAY,
                )
            return
        if parsed.path == "/api/news-feed":
            query = parse_qs(parsed.query)
            news = read_json(PROJECT / "var/news_archive.json", [])
            meta = read_json(DIST / "data/status.json", {"sources": []})
            stale = datetime.now(timezone.utc).timestamp() - generated_at(meta) >= REFRESH_SECONDS
            if stale or query.get("refresh", ["0"])[0] == "1":
                start_refresh()
            try:
                limit = min(800, max(12, int(query.get("limit", ["120"])[0])))
                offset = max(0, int(query.get("offset", ["0"])[0]))
            except ValueError:
                limit, offset = 120, 0
            rows = news[offset:offset + limit]
            self.send_json({
                "news": rows,
                "meta": {**meta, "count": len(news), "returned": len(rows), "offset": offset},
                "pagination": {"offset": offset, "limit": limit, "total": len(news), "hasMore": offset + len(rows) < len(news)},
                "cacheStatus": "refreshing" if refreshing else "stale" if stale else "hit",
                "error": last_error or None,
            })
            return
        if parsed.path == "/api/health":
            self.send_json({"ok": True, "refreshing": refreshing, "error": last_error or None})
            return
        super().do_GET()

    def send_json(self, value, status=HTTPStatus.OK):
        body = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Nimkat newsroom: http://{args.host}:{args.port}/editorial-desk.html#reader", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
