#!/usr/bin/env python3
"""Serve the local newsroom and its archive API."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import threading
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


PROJECT = Path(__file__).resolve().parents[1]
DIST = PROJECT / "dist"
REFRESH_SECONDS = 15 * 60
refresh_lock = threading.Lock()
refreshing = False
last_error = ""


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


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):  # noqa: N802
        parsed = urlsplit(self.path)
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
