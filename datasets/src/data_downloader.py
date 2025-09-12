import logging

from pathlib import Path
from urllib.parse import urlparse

from _helpers import extract_csv_links, fetch_file, sanitize_filename


def download_page_csvs(
    page_url: str, data_dir: Path, force: bool = False
) -> list[Path]:
    """Download all CSV files from a dataset page"""
    data_dir.mkdir(exist_ok=True)
    links = extract_csv_links(page_url)

    if not links:
        logging.warning(f"No CSV files found on {page_url}")
        return []

    logging.info(f"Found {len(links)} CSV file(s)")

    downloaded = []

    for link in links:
        filename = sanitize_filename(link["title"], link["url"])
        filepath = data_dir / filename

        if filepath.exists() and not force:
            logging.info(f"{filename} already exists")
            downloaded.append(filepath)
            continue

        if fetch_file(link["url"], filepath):
            downloaded.append(filepath)

    return downloaded


def download_csvs(urls: list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """Download CSV files directly from URLs"""
    data_dir.mkdir(exist_ok=True)
    downloaded = []

    for url in urls:
        filename = Path(urlparse(url).path).name
        if not filename.endswith(".csv"):
            filename = f"data_{hash(url) % 10000}.csv"
        filename = filename.replace("%20", "_").replace(" ", "_")
        filepath = data_dir / filename

        if filepath.exists() and not force:
            downloaded.append(filepath)
            continue

        if fetch_file(url, filepath):
            downloaded.append(filepath)

    return downloaded


def download(url: str | list[str], data_dir: Path, force: bool = False) -> list[Path]:
    """
    Smart download: detects if URL is a dataset page or direct CSV link.

    Accepts a single URL or a list of URLs.
    """
    url_list = [url] if isinstance(url, str) else url

    all_files = []

    for u in url_list:
        if u.endswith(".csv"):
            files = download_csvs([u], data_dir, force)
        else:
            files = download_page_csvs(u, data_dir, force)
        all_files.extend(files)

    return all_files
