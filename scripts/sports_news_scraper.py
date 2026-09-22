#!/usr/bin/env python3
"""RSS-first football news collector for the Football Nama static MVP.

The collector reads publisher-provided feeds, normalizes and de-duplicates items,
optionally translates them through the OpenAI Responses API, and writes a small
JavaScript data file that also works when index.html is opened via file://.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
)
CA_FILE = os.environ.get("SSL_CERT_FILE") or ("/etc/ssl/cert.pem" if Path("/etc/ssl/cert.pem").exists() else None)
SSL_CONTEXT = ssl.create_default_context(cafile=CA_FILE)
TRANSFER_WORDS = {
    "transfer", "signing", "signed", "signs", "deal", "loan", "contract", "bid",
    "wechsel", "transfermarkt", "vertrag", "leihe", "angebot",
    "fichaje", "fichado", "traspaso", "cesión", "contrato",
    "mercato", "trasferimento", "prestito", "contratto",
    "transfert", "prêt", "contrat", "huur",
}
ANALYSIS_WORDS = {
    "analysis", "tactics", "explained", "opinion", "talking points",
    "analyse", "taktik", "kommentar",
    "análisis", "táctica", "analisi", "tattica", "tactique",
    "voorbeschouwing", "tactiek", "scouting", "data analysis",
}
NON_FOOTBALL_WORDS = {
    "cricket", "wicket", "test match", "county championship", "rugby",
    "formula 1", "grand prix", "tennis", "boxing", "golf", "leicestershire",
    "nfl", "fcs", "fcs football", "college football", "baseball", "basketball", "nba",
    "ice hockey", "cycling", "motogp", "horse racing", "six nations",
    "basketball", "baloncesto", "básquet", "pallacanestro", "basketbal",
    "tenis", "tennis", "pádel", "padel", "golf", "ciclismo", "wielrennen",
    "formule 1", "formel 1", "formula uno", "motociclismo", "rugby",
    "hockey", "handball", "handbal", "atletismo", "athlétisme", "leichtathletik",
}
ENTITY_TAGS = {
    "arsenal": "آرسنال", "chelsea": "چلسی", "liverpool": "لیورپول",
    "manchester city": "منچسترسیتی", "man city": "منچسترسیتی",
    "manchester united": "منچستریونایتد", "man utd": "منچستریونایتد",
    "tottenham": "تاتنهام", "newcastle": "نیوکاسل", "aston villa": "استون ویلا",
    "bayern": "بایرن مونیخ", "dortmund": "دورتموند", "leverkusen": "لورکوزن",
    "bundesliga": "بوندس‌لیگا", "premier league": "لیگ برتر انگلیس",
    "champions league": "لیگ قهرمانان", "real madrid": "رئال مادرید",
    "barcelona": "بارسلونا", "inter": "اینتر", "milan": "میلان",
    "juventus": "یوونتوس", "psg": "پاری‌سن‌ژرمن",
    "lionel messi": "لیونل مسی", "messi": "لیونل مسی",
    "cristiano ronaldo": "کریستیانو رونالدو", "ronaldo": "کریستیانو رونالدو",
}


class FirstImageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.src = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.src or tag.lower() != "img":
            return
        values = dict(attrs)
        self.src = values.get("src") or values.get("data-src") or ""


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def clean_text(value: str | None, limit: int = 520) -> str:
    if not value:
        return ""
    value = re.sub(r"<script\b[^>]*>.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style\b[^>]*>.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value[:limit].rstrip()


def first_image(fragment: str | None) -> str:
    if not fragment:
        return ""
    parser = FirstImageParser()
    try:
        parser.feed(fragment)
    except Exception:
        return ""
    return parser.src


def parse_date(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    try:
        result = parsedate_to_datetime(value)
        if result.tzinfo is None:
            result = result.replace(tzinfo=timezone.utc)
        return result.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        pass
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except (TypeError, ValueError):
        return datetime.now(timezone.utc)


def normalized_url(value: str) -> str:
    try:
        parsed = urllib.parse.urlsplit(value)
        query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        query = [(k, v) for k, v in query if not k.lower().startswith(("utm_", "cmp", "fbclid"))]
        return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urllib.parse.urlencode(query), ""))
    except ValueError:
        return value


def fetch(url: str, timeout: int, user_agent: str = USER_AGENT) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": user_agent, "Accept": "application/rss+xml, application/json, application/xml, text/xml;q=0.9, */*;q=0.5"},
    )
    with urllib.request.urlopen(request, timeout=timeout, context=SSL_CONTEXT) as response:
        return response.read()


def child_text(node: ET.Element, names: set[str]) -> str:
    for child in node.iter():
        if local_name(child.tag) in names and child.text:
            return child.text.strip()
    return ""


def extract_link(node: ET.Element) -> str:
    for child in node.iter():
        if local_name(child.tag) != "link":
            continue
        href = child.attrib.get("href")
        rel = child.attrib.get("rel", "alternate")
        if href and rel in ("alternate", ""):
            return href.strip()
        if child.text and child.text.strip().startswith("http"):
            return child.text.strip()
    return child_text(node, {"guid", "id"})


def extract_image(node: ET.Element, description_html: str) -> str:
    for child in node.iter():
        name = local_name(child.tag)
        url = child.attrib.get("url") or child.attrib.get("href") or ""
        media_type = child.attrib.get("type", "")
        if name == "thumbnail" and url:
            return url
        if name in {"content", "enclosure"} and url and (media_type.startswith("image/") or re.search(r"\.(?:jpe?g|png|webp)(?:\?|$)", url, re.I)):
            return url
    return first_image(description_html)


def has_term(text: str, term: str) -> bool:
    return re.search(rf"(?<![\w-]){re.escape(term)}(?![\w-])", text, re.I) is not None


def is_football_item(title: str, summary: str) -> bool:
    text = f"{title} {summary}".casefold()
    return not any(has_term(text, word) for word in NON_FOOTBALL_WORDS)


def is_source_item_allowed(source_id: str, url: str) -> bool:
    """Apply narrow publisher-specific rules when a feed mixes several sports."""
    if source_id == "sky-football":
        try:
            return "/football/" in urllib.parse.urlsplit(url).path.casefold()
        except ValueError:
            return False
    if source_id == "rmc-football" and "_dn-" in url.casefold():
        return False
    return True


def classify(title: str, summary: str, source_type: str = "") -> str:
    if source_type == "analysis":
        return "analysis"
    text = f"{title} {summary}".casefold()
    if any(has_term(text, word) for word in TRANSFER_WORDS):
        return "transfer"
    if any(has_term(text, word) for word in ANALYSIS_WORDS):
        return "analysis"
    return "news"


def detect_tags(title: str, summary: str, category: str, country_label: str) -> list[str]:
    text = f"{title} {summary}".casefold()
    tags: list[str] = []
    for needle, label in ENTITY_TAGS.items():
        if has_term(text, needle) and label not in tags:
            tags.append(label)
    category_label = {"transfer": "نقل‌وانتقالات", "analysis": "تحلیل", "news": "اخبار فوتبال"}[category]
    for value in (category_label, country_label):
        if value not in tags:
            tags.append(value)
    return tags[:5]


def relative_time(published: datetime, now: datetime) -> str:
    seconds = max(0, int((now - published).total_seconds()))
    if seconds < 3600:
        value, unit = max(1, seconds // 60), "دقیقه"
    elif seconds < 86400:
        value, unit = seconds // 3600, "ساعت"
    else:
        value, unit = seconds // 86400, "روز"
    digits = str(value).translate(str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹"))
    return f"{digits} {unit} پیش"


def parse_feed(source: dict[str, Any], payload: bytes, limit: int, max_age: timedelta) -> list[dict[str, Any]]:
    root = ET.fromstring(payload)
    entries = [node for node in root.iter() if local_name(node.tag) in {"item", "entry"}]
    now = datetime.now(timezone.utc)
    items: list[dict[str, Any]] = []
    for node in entries[: max(limit * 3, limit)]:
        title = clean_text(child_text(node, {"title"}), 240)
        link = normalized_url(extract_link(node))
        raw_summary = child_text(node, {"description", "summary", "encoded", "content"})
        summary = clean_text(raw_summary, 520)
        if not is_football_item(title, summary):
            continue
        if not is_source_item_allowed(source.get("id", ""), link):
            continue
        published = parse_date(child_text(node, {"pubdate", "published", "updated", "date"}))
        if not title or not link or now - published > max_age:
            continue
        category = classify(title, summary, source.get("source_type", ""))
        stable_id = hashlib.sha1(link.encode("utf-8")).hexdigest()[:12]
        provider_only = bool(source.get("provider_only"))
        items.append({
            "id": f"live-{stable_id}",
            "country": source["country"],
            "flag": f"{source['flag']} {source['country_label']}",
            "cat": category,
            "eyebrow": f"{source['country_label']} · دریافت خودکار",
            "title": title,
            "summary": summary or "برای خواندن جزئیات، منبع اصلی را باز کنید.",
            "why": "این عنوان و خلاصه بدون تغییر از ESPN ارائه شده است." if provider_only else "این خبر مستقیماً از فید رسمی رسانه دریافت شده و پیش از انتشار نهایی باید در تحریریه بازبینی شود.",
            "source": source["name"],
            "sourceId": source["id"],
            "sourceType": source.get("source_type", "major"),
            "sourceTypeLabel": source.get("source_type_label", "رسانه معتبر"),
            "icon": source["icon"],
            "lang": source["language_label"],
            "time": relative_time(published, now),
            "publishedAt": published.isoformat(),
            "cred": "ارائه‌شده توسط ESPN" if provider_only else "در انتظار ترجمه",
            "credClass": "trusted" if provider_only else "rumor",
            "tags": detect_tags(title, summary, category, source["country_label"]),
            "image": extract_image(node, raw_summary),
            "url": link,
            "needsTranslation": not provider_only,
            "providerOnly": provider_only,
        })
        if len(items) >= limit:
            break
    return items


def parse_espn_json(source: dict[str, Any], payload: bytes, limit: int, max_age: timedelta) -> list[dict[str, Any]]:
    data = json.loads(payload.decode("utf-8"))
    articles = data.get("articles", [])
    now = datetime.now(timezone.utc)
    items: list[dict[str, Any]] = []
    for article in articles:
        title = clean_text(article.get("headline"), 240)
        summary = clean_text(article.get("description"), 520)
        link = normalized_url(article.get("links", {}).get("web", {}).get("href", ""))
        published = parse_date(article.get("published") or article.get("lastModified"))
        if not title or not link or now - published > max_age or not is_football_item(title, summary):
            continue
        category = classify(title, summary, source.get("source_type", ""))
        images = article.get("images") or []
        image = next((row.get("url", "") for row in images if isinstance(row, dict) and row.get("url")), "")
        stable_id = hashlib.sha1(link.encode("utf-8")).hexdigest()[:12]
        items.append({
            "id": f"live-{stable_id}",
            "country": source["country"],
            "flag": f"{source['flag']} {source['country_label']}",
            "cat": category,
            "eyebrow": f"{source['country_label']} · ESPN",
            "title": title,
            "summary": summary or "Open the original ESPN story for details.",
            "why": "این عنوان و خلاصه بدون تغییر توسط ESPN ارائه شده است.",
            "source": source["name"],
            "sourceId": source["id"],
            "sourceType": source.get("source_type", "major"),
            "sourceTypeLabel": source.get("source_type_label", "رسانه معتبر"),
            "icon": source["icon"],
            "lang": source["language_label"],
            "time": relative_time(published, now),
            "publishedAt": published.isoformat(),
            "cred": "ارائه‌شده توسط ESPN",
            "credClass": "trusted",
            "tags": detect_tags(title, summary, category, source["country_label"]),
            "image": image,
            "url": link,
            "needsTranslation": False,
            "providerOnly": True,
        })
        if len(items) >= limit:
            break
    return items


def response_text(data: dict[str, Any]) -> str:
    if isinstance(data.get("output_text"), str):
        return data["output_text"]
    for item in data.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                return content["text"]
    return ""


def translate_batch(items: list[dict[str, Any]], api_key: str, model: str, timeout: int) -> dict[str, dict[str, Any]]:
    compact = [{"id": item["id"], "title": item["title"], "summary": item["summary"], "language": item["lang"]} for item in items]
    prompt = (
        "You are the Persian editor of a football news site. Translate the supplied headlines and summaries "
        "into neutral, fluent Persian. Do not invent facts. Keep names accurate. Return ONLY a JSON array. "
        "Each object must contain id, title, summary, why, and tags (2 to 5 short Persian strings). "
        "The why field is one concise sentence explaining why the news matters. Input:\n" +
        json.dumps(compact, ensure_ascii=False)
    )
    body = json.dumps({"model": model, "reasoning": {"effort": "none"}, "input": prompt}).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=body,
        method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(request, timeout=max(timeout, 60), context=SSL_CONTEXT) as response:
        data = json.loads(response.read().decode("utf-8"))
    text = response_text(data).strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.I)
    translated = json.loads(text)
    if not isinstance(translated, list):
        raise ValueError("translation response is not a JSON array")
    return {row["id"]: row for row in translated if isinstance(row, dict) and row.get("id")}


def apply_translations(items: list[dict[str, Any]], cache: dict[str, Any], api_key: str, model: str, timeout: int) -> None:
    pending: list[dict[str, Any]] = []
    cache_keys: dict[str, str] = {}
    for item in items:
        if item.get("providerOnly"):
            continue
        key = hashlib.sha1(f"{model}\n{item['title']}\n{item['summary']}".encode("utf-8")).hexdigest()
        cache_keys[item["id"]] = key
        cached = cache.get(key)
        if cached:
            item.update(cached)
            item["needsTranslation"] = False
            item["cred"] = "گزارش منبع"
            item["credClass"] = "trusted"
        else:
            pending.append(item)
    for start in range(0, len(pending), 8):
        batch = pending[start : start + 8]
        translated = translate_batch(batch, api_key, model, timeout)
        for item in batch:
            result = translated.get(item["id"])
            if not result:
                continue
            update = {
                "title": clean_text(str(result.get("title", item["title"])), 240),
                "summary": clean_text(str(result.get("summary", item["summary"])), 520),
                "why": clean_text(str(result.get("why", item["why"])), 320),
                "tags": [clean_text(str(tag), 42) for tag in result.get("tags", item["tags"])][:5],
            }
            item.update(update)
            item["needsTranslation"] = False
            item["cred"] = "گزارش منبع"
            item["credClass"] = "trusted"
            cache[cache_keys[item["id"]]] = update


def read_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return fallback


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def main() -> int:
    project = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Collect football news into the Football Nama MVP")
    parser.add_argument("--config", type=Path, default=project / "config/sources.json")
    parser.add_argument("--output", type=Path, default=project / "dist/data/news.js")
    parser.add_argument("--status", type=Path, default=project / "dist/data/status.json")
    parser.add_argument("--archive", type=Path, default=project / "var/news_archive.json")
    parser.add_argument("--cache", type=Path, default=project / "var/translation_cache.json")
    parser.add_argument("--limit-per-source", type=int, default=20)
    parser.add_argument("--max-items", type=int, default=280)
    parser.add_argument("--max-age-hours", type=int, default=96)
    parser.add_argument("--fresh", action="store_true", help="Rebuild without merging the previous archive")
    parser.add_argument("--timeout", type=int, default=25)
    parser.add_argument("--translate", action="store_true", help="Translate with OPENAI_API_KEY")
    parser.add_argument("--model", default=os.environ.get("OPENAI_TRANSLATION_MODEL", "gpt-5.6-luna"))
    args = parser.parse_args()

    sources = read_json(args.config, [])
    if not sources:
        print(f"No sources found in {args.config}", file=sys.stderr)
        return 2

    collected: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []
    for source in sources:
        try:
            max_age = timedelta(hours=int(source.get("max_age_hours", args.max_age_hours)))
            payload = fetch(source["feed_url"], args.timeout, source.get("user_agent", USER_AGENT))
            if source.get("format") == "espn_json":
                items = parse_espn_json(source, payload, args.limit_per_source, max_age)
            else:
                items = parse_feed(source, payload, args.limit_per_source, max_age)
            collected.extend(items)
            results.append({
                "source": source["name"],
                "ok": True,
                "items": len(items),
                "sourceType": source.get("source_type", "major"),
                "sourceTypeLabel": source.get("source_type_label", "رسانه معتبر"),
                "country": source.get("country_label", "بین‌المللی"),
            })
            print(f"[ok] {source['name']}: {len(items)} items")
        except (urllib.error.URLError, TimeoutError, ET.ParseError, KeyError, ValueError) as exc:
            results.append({
                "source": source.get("name", "unknown"),
                "ok": False,
                "error": str(exc)[:180],
                "sourceType": source.get("source_type", "major"),
                "sourceTypeLabel": source.get("source_type_label", "رسانه معتبر"),
                "country": source.get("country_label", "بین‌المللی"),
            })
            print(f"[error] {source.get('name', 'unknown')}: {exc}", file=sys.stderr)

    existing = [] if args.fresh else read_json(args.archive, [])
    by_key: dict[str, dict[str, Any]] = {}
    for item in collected + existing:
        if not is_football_item(item.get("title", ""), item.get("summary", "")):
            continue
        if not is_source_item_allowed(item.get("sourceId", ""), item.get("url", "")):
            continue
        key = normalized_url(item.get("url", "")) or re.sub(r"\W+", "", item.get("title", "").casefold())
        if key and key not in by_key:
            by_key[key] = item
    items = sorted(by_key.values(), key=lambda row: row.get("publishedAt", ""), reverse=True)[: args.max_items]

    if args.translate:
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            print("--translate requires OPENAI_API_KEY in the environment", file=sys.stderr)
            return 3
        cache = read_json(args.cache, {})
        try:
            apply_translations(items, cache, api_key, args.model, args.timeout)
            atomic_write(args.cache, json.dumps(cache, ensure_ascii=False, indent=2))
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            print(f"[translation warning] {exc}; untranslated items were still saved", file=sys.stderr)

    generated_at = datetime.now(timezone.utc).isoformat()
    atomic_write(args.archive, json.dumps(items, ensure_ascii=False, indent=2))
    js = "window.LIVE_NEWS = " + json.dumps(items, ensure_ascii=False, separators=(",", ":")) + ";\n"
    js += "window.LIVE_NEWS_META = " + json.dumps({"generatedAt": generated_at, "count": len(items), "sources": results}, ensure_ascii=False, separators=(",", ":")) + ";\n"
    atomic_write(args.output, js)
    atomic_write(args.status, json.dumps({"generatedAt": generated_at, "count": len(items), "sources": results}, ensure_ascii=False, indent=2))
    print(f"Saved {len(items)} unique items to {args.output}")
    return 0 if any(result["ok"] for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
