import logging
import re
import time

from pathlib import Path
from typing import TYPE_CHECKING
from urllib.parse import urljoin, urlparse

import requests

from bs4 import BeautifulSoup, Tag


if TYPE_CHECKING:
    from collections.abc import Sequence


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


# File fetching and sanitizing
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


def extract_csv_links(page_url: str) -> list[dict[str, str]]:
    """Extract CSV download links from a datosabiertos.gob.pe dataset page."""
    try:
        response = requests.get(page_url, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    resources_div = find_tag(soup, "div", id_="data-and-resources")
    if not resources_div:
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
    return links


def sanitize_filename(title: str, url: str) -> str:
    """Generate a safe filename from a title or URL."""
    name = Path(urlparse(url).path).name
    if not name.endswith(".csv"):
        name = re.sub(r"[^\w\s-]", "", title.lower())
        name = re.sub(r"[-\s]+", "_", name) + ".csv"
    return re.sub(r"[^\w\-.]", "_", name)


# High-level download API
def download_page_csvs(
    page_url: str, data_dir: Path, force: bool = False
) -> list[Path]:
    """Download all CSV files from a dataset page."""
    data_dir.mkdir(parents=True, exist_ok=True)
    links = extract_csv_links(page_url)
    if not links:
        logging.warning(f"No CSV files found on {page_url}")
        return []

    logging.info(f"Found {len(links)} CSV file(s) on page.")
    downloaded = []
    for link in links:
        filename = sanitize_filename(link["title"], link["url"])
        filepath = data_dir / filename
        if filepath.exists() and not force:
            logging.info(f"{filename} already exists, skipping.")
            downloaded.append(filepath)
            continue
        if fetch_file(link["url"], filepath):
            downloaded.append(filepath)
    return downloaded


def download_csvs(urls: list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """Download CSV files directly from a list of URLs."""
    data_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []
    for url in urls:
        filename = Path(urlparse(url).path).name.replace("%20", "_").replace(" ", "_")
        if not filename.endswith(".csv"):
            filename = f"data_{hash(url) % 10000}.csv"
        filepath = data_dir / filename
        if filepath.exists() and not force:
            logging.info(f"{filename} already exists, skipping.")
            downloaded.append(filepath)
            continue
        if fetch_file(url, filepath):
            downloaded.append(filepath)
    return downloaded


def download(url: str | list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """
    Download files from a URL or list of URLs.

    It handles both direct links to CSV files and dataset pages from
    datosabiertos.gob.pe, from which it extracts all CSV links.
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
