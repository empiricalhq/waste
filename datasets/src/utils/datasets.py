import json
import logging
import re

from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests

from bs4 import BeautifulSoup, Tag


METADATA_FILE = "manifest.json"


def _load_metadata(data_dir: Path) -> dict:
    """Return cached download manifest or {} if missing/corrupt."""
    metadata_path = data_dir / METADATA_FILE
    if metadata_path.exists():
        try:
            return json.loads(metadata_path.read_text())
        except (OSError, json.JSONDecodeError) as e:
            logging.warning(f"Failed to load metadata: {e}, starting fresh")
    return {}


def _save_metadata(data_dir: Path, metadata: dict):
    """Atomic write of manifest to prevent corruption on concurrent runs."""
    metadata_path = data_dir / METADATA_FILE
    try:
        temp_path = metadata_path.with_suffix(".tmp")
        temp_path.write_text(json.dumps(metadata, indent=2))
        temp_path.replace(metadata_path)
    except OSError as e:
        logging.error(f"Cannot save manifest: {e}")


def _record_download(
    data_dir: Path, url: str, title: str, filename: str, source: str = "live"
):
    """Append entry to manifest."""
    metadata = _load_metadata(data_dir)
    metadata[filename] = {
        "url": url,
        "title": title,
        "timestamp": datetime.now().isoformat(),
        "source": source,
    }
    _save_metadata(data_dir, metadata)


def _find_cached_file(data_dir: Path, url: str) -> Path | None:
    """Return cached Path for URL if still on disk."""
    metadata = _load_metadata(data_dir)
    for filename, record in metadata.items():
        if record.get("url") == url:
            path = data_dir / filename
            if path.exists():
                return path
    return None


def fetch_with_fallbacks(
    url: str, *, stream: bool = False, timeout: int = 30
) -> requests.Response | None:
    """GET url to fetch content, fallback to archive.org on failure."""
    try:
        r = requests.get(url, timeout=timeout, stream=stream)
        r.raise_for_status()
        return r
    except requests.RequestException as e:
        logging.warning(f"Primary fetch failed for {url}: {e}")

    archive_url = urljoin("https://web.archive.org/web/0/", url)
    try:
        r = requests.get(archive_url, timeout=timeout, stream=stream)
        r.raise_for_status()
        return r
    except requests.RequestException as e:
        logging.error(f"Archive fallback failed for {url}: {e}")
        return None


def find_tag(
    parent: Tag,
    name: str | None = None,
    class_: str | None = None,
    id_: str | None = None,
) -> Tag | None:
    """Single BeautifulSoup tag lookup helper."""
    kwargs = {}
    if class_ is not None:
        kwargs["class_"] = class_
    if id_ is not None:
        kwargs["id"] = id_
    tag = parent.find(name=name, **kwargs)
    return tag if isinstance(tag, Tag) else None


def get_text(tag: Tag | None) -> str:
    """Stripped text or 'unknown'."""
    return tag.get_text(strip=True) if tag else "unknown"


def extract_csv_links(page_url: str) -> list[dict[str, str]]:
    """Scrape CSV links from datosabiertos.gob.pe dataset page."""
    resp = fetch_with_fallbacks(page_url)
    if not resp:
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    resources_div = find_tag(soup, "div", id_="data-and-resources")
    if not resources_div:
        logging.warning("No resources section found")
        return []

    links = []
    for li in resources_div.find_all("li"):
        if not isinstance(li, Tag):
            continue
        download_tag = find_tag(li, "a", class_="data-link")
        format_tag = find_tag(li, "span", class_="format-label")
        title_tag = find_tag(li, "a", class_="heading")

        if not download_tag or not format_tag:
            continue

        url = str(download_tag.get("href") or "")
        file_format = str(format_tag.get("data-original-title") or "").lower()
        title = get_text(title_tag)

        if "csv" in file_format or url.lower().endswith(".csv"):
            if url.startswith("/"):
                url = urljoin("https://datosabiertos.gob.pe", url)
            links.append({"title": title, "url": url})

    logging.info(f"Found {len(links)} CSV files")
    return links


def sanitize_filename(title: str, url: str) -> str:
    """Create filesystem-safe name ending in .csv."""
    name = Path(urlparse(url).path).name
    if not name.endswith(".csv"):
        name = re.sub(r"[^\w\s-]", "", title.lower())
        name = re.sub(r"[-\s]+", "_", name) + ".csv"
    return re.sub(r"[^\w\-.]", "_", name)


def download_page_csvs(
    page_url: str, data_dir: Path, force: bool = False
) -> list[Path]:
    """Download every CSV linked from a datosabiertos dataset page."""
    data_dir.mkdir(parents=True, exist_ok=True)
    links = extract_csv_links(page_url)
    if not links:
        logging.warning(f"No CSV files on {page_url}")
        return []

    downloaded = []
    for link in links:
        url = link["url"]
        title = link["title"]
        filename = sanitize_filename(title, url)
        filepath = data_dir / filename

        site_down = not fetch_with_fallbacks("https://datosabiertos.gob.pe")

        if site_down:
            cached = _find_cached_file(data_dir, url)
            if cached:
                logging.info(f"Site down, using cached {cached.name}")
                downloaded.append(cached)
                continue

        if force or not filepath.exists():
            resp = fetch_with_fallbacks(url, stream=True)
            if resp:
                try:
                    filepath.write_bytes(resp.content)
                    source = "archive" if "web.archive.org" in resp.url else "live"
                    _record_download(data_dir, url, title, filename, source)
                    downloaded.append(filepath)
                except OSError as e:
                    logging.error(f"Save failed for {filename}: {e}")
            elif filepath.exists():
                downloaded.append(filepath)
    return downloaded


def download_csvs(urls: list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """Download CSVs from direct URLs."""
    data_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []
    for url in urls:
        filename = Path(urlparse(url).path).name or f"data_{hash(url) % 10000}.csv"
        filepath = data_dir / filename

        site_down = not fetch_with_fallbacks("https://datosabiertos.gob.pe")
        if site_down:
            cached = _find_cached_file(data_dir, url)
            if cached:
                logging.info(f"Site down, using cached {cached.name}")
                downloaded.append(cached)
                continue

        if force or not filepath.exists():
            resp = fetch_with_fallbacks(url, stream=True)
            if resp:
                try:
                    filepath.write_bytes(resp.content)
                    source = "archive" if "web.archive.org" in resp.url else "live"
                    _record_download(data_dir, url, filename, filename, source)
                    downloaded.append(filepath)
                except OSError as e:
                    logging.error(f"Save failed for {filename}: {e}")
            elif filepath.exists():
                downloaded.append(filepath)
    return downloaded


def download(url: str | list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """
    Download files from a URL or list of URLs.

    Handles both direct links to CSV files and dataset pages from
    datosabiertos.gob.pe. Automatically falls back to archive.org if the
    primary source is unavailable, and uses cached files from previous runs.

    Args:
        url: Single URL string or list of URL strings.
        data_dir: Directory to store downloaded files and manifest.
        force: If True, re-download even if cached. Default False.

    Returns:
        List of file paths that were downloaded or retrieved from cache.
    """
    url_list = [url] if isinstance(url, str) else url
    all_files = []
    for u in url_list:
        files = (
            download_csvs([u], data_dir, force)
            if u.lower().endswith(".csv")
            else download_page_csvs(u, data_dir, force)
        )
        all_files.extend(files)
    return list(set(all_files))
