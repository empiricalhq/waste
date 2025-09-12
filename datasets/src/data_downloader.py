import logging
import re
import time

from pathlib import Path
from typing import TYPE_CHECKING
from urllib.parse import urljoin, urlparse

import requests

from bs4 import BeautifulSoup
from utils import find_tag


if TYPE_CHECKING:
    from collections.abc import Iterator


def _download_file(url: str, filepath: Path, max_retries: int = 3) -> bool:
    """Download a single file with retry logic"""
    for attempt in range(max_retries):
        try:
            logging.info(f"Downloading {filepath.name}... (attempt {attempt + 1})")

            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()

            with open(filepath, "wb") as f:
                chunks: Iterator[bytes] = response.iter_content(chunk_size=8192)
                for chunk in chunks:
                    _ = f.write(chunk)

            logging.info(f"Downloaded {filepath.name}")
            return True

        except requests.RequestException as e:
            logging.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 + attempt)

    return False


def _get_csv_downloads_from_page(page_url: str) -> list[dict[str, str]]:
    """Extract CSV download links from a datosabiertos.gob.pe page"""
    try:
        response = requests.get(page_url, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Find the resources section safely
    resources_div = find_tag(soup, "div", id_="data-and-resources")
    if not resources_div:
        return []

    csv_resources = []
    resource_items = resources_div.find_all("li")

    for item in resource_items:
        # Find the download link safely
        download_tag = find_tag(item, "a", class_="data-link")
        format_tag = find_tag(item, "span", class_="format-label")
        title_tag = find_tag(item, "a", class_="heading")

        if not all([download_tag, format_tag]):
            continue

        download_url = download_tag.get("href", "")
        file_format = format_tag.get("data-original-title", "").lower()
        title = title_tag.get_text(strip=True) if title_tag else "unknown"

        # Check if it's a CSV (by format tag or file extension)
        is_csv = "csv" in file_format or download_url.lower().endswith(".csv")

        if is_csv:
            # Make URL absolute if needed
            if download_url.startswith("/"):
                download_url = urljoin("https://datosabiertos.gob.pe", download_url)

            csv_resources.append({"title": title, "url": download_url})

    return csv_resources


def _clean_filename(title: str, url: str) -> str:
    """Generate a clean filename from title and URL"""
    # Try to extract filename from URL first
    parsed = urlparse(url)
    url_filename = Path(parsed.path).name

    if url_filename and url_filename.endswith(".csv"):
        # Clean up the URL filename
        filename = url_filename.replace("%20", "_").replace(" ", "_")
        return re.sub(r"[^\w\-_.]", "", filename)

    # Fallback to title-based filename
    clean_title = re.sub(r"[^\w\s-]", "", title.lower())
    clean_title = re.sub(r"[-\s]+", "_", clean_title)
    return f"{clean_title}.csv"


def download_from_page(
    page_url: str, data_dir: Path, force: bool = False
) -> list[Path]:
    """
    Download all CSV files from a datosabiertos.gob.pe dataset page.

    Args:
        page_url: URL of the dataset page
        data_dir: Directory to save files
        force: Re-download even if files exist

    Returns:
        list of paths to downloaded CSV files
    """
    data_dir.mkdir(exist_ok=True)

    # Get CSV resources from the page
    csv_resources = _get_csv_downloads_from_page(page_url)

    if not csv_resources:
        logging.warning(f"✗ No CSV files found on {page_url}")
        return []

    logging.info(f"Found {len(csv_resources)} CSV file(s)")

    downloaded_files = []

    for resource in csv_resources:
        filename = _clean_filename(resource["title"], resource["url"])
        filepath = data_dir / filename

        # Skip if exists and not forcing
        if filepath.exists() and not force:
            logging.info(f"{filename} already exists")
            downloaded_files.append(filepath)
            continue

        # Download the file
        if _download_file(resource["url"], filepath):
            downloaded_files.append(filepath)
        else:
            pass

    return downloaded_files


def download_datasets(
    page_urls: list[str], data_dir: Path, force: bool = False
) -> list[Path]:
    """
    Download CSV files from multiple dataset pages.

    Args:
        page_urls: list of dataset page URLs
        data_dir: Directory to save files
        force: Re-download even if files exist

    Returns:
        list of paths to all downloaded CSV files
    """
    all_files = []

    for url in page_urls:
        logging.info(f"\n Processing dataset: {url}")
        files = download_from_page(url, data_dir, force)
        all_files.extend(files)

    return all_files


def download_direct(
    csv_urls: list[str], data_dir: Path, force: bool = False
) -> list[Path]:
    """
    Download CSV files directly from URLs.
    Fallback for other use cases with direct CSV links.

    Args:
        csv_urls: list of direct CSV URLs
        data_dir: Directory to save files
        force: Re-download even if files exist

    Returns:
        list of paths to downloaded CSV files
    """
    data_dir.mkdir(exist_ok=True)
    downloaded_files = []

    for url in csv_urls:
        # Generate filename from URL
        parsed = urlparse(url)
        filename = Path(parsed.path).name

        if not filename or not filename.endswith(".csv"):
            filename = f"data_{hash(url) % 10000}.csv"

        filename = filename.replace("%20", "_").replace(" ", "_")
        filepath = data_dir / filename

        # Skip if exists and not forcing
        if filepath.exists() and not force:
            downloaded_files.append(filepath)
            continue

        # Download the file
        if _download_file(url, filepath):
            downloaded_files.append(filepath)
        else:
            pass

    return downloaded_files


# Convenience function for single URL (works with both page URLs and direct CSV URLs)
def download_dataset(url: str, data_dir: Path, force: bool = False) -> list[Path]:
    """
    Smart download: detects if URL is a dataset page or direct CSV link.

    Args:
        url: Dataset page URL or direct CSV URL
        data_dir: Directory to save files
        force: Re-download even if files exist

    Returns:
        list of paths to downloaded CSV files
    """
    if url.endswith(".csv"):
        return download_direct([url], data_dir, force)
    else:
        return download_from_page(url, data_dir, force)
