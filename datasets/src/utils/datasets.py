import json
import logging
import re
import time

from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING
from urllib.parse import urljoin, urlparse

import requests

from bs4 import BeautifulSoup, Tag


if TYPE_CHECKING:
    from collections.abc import Sequence


METADATA_FILE = "download_manifest.json"


def _load_metadata(data_dir: Path) -> dict:
    """Load download history from manifest. Returns empty dict if not found."""
    metadata_path = data_dir / METADATA_FILE
    if metadata_path.exists():
        try:
            return json.loads(metadata_path.read_text())
        except (OSError, json.JSONDecodeError) as e:
            logging.warning(f"Failed to load metadata: {e}, starting fresh")
    return {}


def _save_metadata(data_dir: Path, metadata: dict):
    """
    Persist download history.
    Writes atomically to avoid corruption caused by race conditions.
    """
    metadata_path = data_dir / METADATA_FILE
    try:
        # Write to temp file first, then rename
        temp_path = metadata_path.with_suffix(".tmp")
        temp_path.write_text(json.dumps(metadata, indent=2))
        temp_path.replace(metadata_path)
    except OSError as e:
        logging.error(f"Failed to save metadata: {e}")


def _record_download(data_dir: Path, url: str, title: str, filename: str):
    """Record a successful download in metadata."""
    metadata = _load_metadata(data_dir)
    metadata[filename] = {
        "url": url,
        "title": title,
        "timestamp": datetime.now().isoformat(),
    }
    _save_metadata(data_dir, metadata)


def _find_cached_file(data_dir: Path, url: str) -> Path | None:
    """Find a previously downloaded file by URL."""
    metadata = _load_metadata(data_dir)
    for record in metadata.values():
        if record["url"] == url:
            filepath = data_dir / record.get("filename", "")
            # Check if 'filename' key exists; older metadata might not have it
            if not filepath.name:
                continue
            if filepath.exists():
                logging.info(f"Found cached file for URL: {filepath.name}")
                return filepath
    return None


def find_tag(
    parent: Tag,
    name: str | None = None,
    class_: str | None = None,
    id_: str | None = None,
) -> Tag | None:
    """Find a single BeautifulSoup tag with optional class or id."""
    kwargs = {}
    if class_ is not None:
        kwargs["class_"] = class_
    if id_ is not None:
        kwargs["id"] = id_
    tag = parent.find(name=name, **kwargs)
    return tag if isinstance(tag, Tag) else None


def get_text(tag: Tag | None) -> str:
    """Return stripped text from a tag or 'unknown' if tag is None."""
    return tag.get_text(strip=True) if tag else "unknown"


def fetch_file(url: str, filepath: Path, max_retries: int = 3) -> bool:
    """Download a file with retry logic."""
    for attempt in range(max_retries):
        try:
            logging.info(f"Downloading {filepath.name} (attempt {attempt + 1})")
            with requests.get(url, timeout=30, stream=True) as r:
                r.raise_for_status()
                filepath.write_bytes(r.content)
            logging.info(f"Downloaded {filepath.name}")
            return True
        except requests.RequestException as e:
            logging.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 + attempt)
    return False


def _fetch_with_fallbacks(url: str, filepath: Path, max_retries: int = 3) -> bool:
    """Attempt to download from primary URL, then fallback to archive.org."""
    # Try primary source
    if fetch_file(url, filepath, max_retries):
        return True

    logging.warning(f"Primary source unavailable, attempting archive.org: {url}")

    # Try archive.org snapshot
    archive_url = urljoin("https://web.archive.org/web/0/", url)
    if fetch_file(archive_url, filepath, max_retries=1):
        logging.info("Successfully fetched from archive.org")
        return True

    logging.error(f"All sources exhausted for: {url}")
    return False


def extract_csv_links(page_url: str) -> list[dict[str, str]]:
    """Extract CSV download links from a datosabiertos.gob.pe dataset page."""
    try:
        response = requests.get(page_url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Failed to fetch page: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    resources_div = find_tag(soup, "div", id_="data-and-resources")
    if not resources_div:
        logging.warning("Could not find resources section on page")
        return []

    items: Sequence[Tag] = [
        li for li in resources_div.find_all("li") if isinstance(li, Tag)
    ]
    links = []
    for item in items:
        download_tag = find_tag(item, "a", class_="data-link")
        format_tag = find_tag(item, "span", class_="format-label")
        title_tag = find_tag(item, "a", class_="heading")

        if not download_tag or not format_tag:
            continue

        url = str(download_tag.get("href") or "")
        file_format = str(format_tag.get("data-original-title") or "").lower()
        title = get_text(title_tag)

        is_csv = "csv" in file_format or url.lower().endswith(".csv")
        if is_csv:
            if url.startswith("/"):
                url = urljoin("https://datosabiertos.gob.pe", url)
            links.append({"title": title, "url": url})

    logging.info(f"Found {len(links)} CSV files on page")
    return links


def sanitize_filename(title: str, url: str) -> str:
    """Generate a safe filename from a title or URL."""
    name = Path(urlparse(url).path).name
    if not name.endswith(".csv"):
        name = re.sub(r"[^\w\s-]", "", title.lower())
        name = re.sub(r"[-\s]+", "_", name) + ".csv"
    return re.sub(r"[^\w\-.]", "_", name)


def download_page_csvs(
    page_url: str, data_dir: Path, force: bool = False
) -> list[Path]:
    """Download all CSV files from a dataset page with fallback and caching."""
    data_dir.mkdir(parents=True, exist_ok=True)
    links = extract_csv_links(page_url)
    if not links:
        logging.warning(f"No CSV files found on {page_url}")
        return []

    logging.info(f"Found {len(links)} CSV file(s)")
    downloaded = []
    for link in links:
        url = link["url"]
        title = link["title"]

        # Check cache first
        if not force:
            cached = _find_cached_file(data_dir, url)
            if cached:
                downloaded.append(cached)
                continue

        # Generate filename before attempting download
        filename = sanitize_filename(title, url)
        filepath = data_dir / filename

        # Attempt download with fallbacks
        if _fetch_with_fallbacks(url, filepath):
            _record_download(data_dir, url, title, filename)
            downloaded.append(filepath)
        else:
            # Last resort: check if file already exists locally
            if filepath.exists():
                logging.info(f"Using existing local file: {filename}")
                downloaded.append(filepath)

    return downloaded


def download_csvs(urls: list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """Download CSV files directly from a list of URLs."""
    data_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []
    for url in urls:
        # Check cache first
        if not force:
            cached = _find_cached_file(data_dir, url)
            if cached:
                downloaded.append(cached)
                continue

        filename = Path(urlparse(url).path).name.replace("%20", "_").replace(" ", "_")
        if not filename.endswith(".csv"):
            filename = f"data_{hash(url) % 10000}.csv"
        filepath = data_dir / filename

        # Attempt download with fallbacks
        if _fetch_with_fallbacks(url, filepath):
            _record_download(data_dir, url, filename, filename)
            downloaded.append(filepath)
        else:
            # Last resort: check if file already exists locally
            if filepath.exists():
                logging.info(f"Using existing local file: {filename}")
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
        if u.lower().endswith(".csv"):
            files = download_csvs([u], data_dir, force)
        else:
            files = download_page_csvs(u, data_dir, force)
        all_files.extend(files)
    return list(set(all_files))
