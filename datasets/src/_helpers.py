import logging
import re
import time

from pathlib import Path
from typing import TYPE_CHECKING
from urllib.parse import urljoin, urlparse

import requests

from bs4 import BeautifulSoup, Tag
from utils import find_tag, get_text


if TYPE_CHECKING:
    from collections.abc import Sequence


def fetch_file(url: str, filepath: Path, max_retries: int = 3) -> bool:
    """Download a file with retry logic."""
    for attempt in range(max_retries):
        try:
            logging.info(f"Downloading {filepath.name} (attempt {attempt + 1})")
            with requests.get(url, timeout=30, stream=True) as r:
                r.raise_for_status()
                _ = filepath.write_bytes(r.content)
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
    """Generate a safe filename from title or URL."""
    name = Path(urlparse(url).path).name
    if not name.endswith(".csv"):
        name = re.sub(r"[^\w\s-]", "", title.lower())
        name = re.sub(r"[-\s]+", "_", name) + ".csv"
    return re.sub(r"[^\w\-.]", "_", name)
