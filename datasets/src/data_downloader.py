import requests
from pathlib import Path
import hashlib
import time


class DataDownloader:
    """Downloads and caches datasets from datosabiertos.gob.pe"""

    data_dir: Path
    datasets: dict[str, dict[str, str]]

    def __init__(self, data_dir: Path | None = None):
        self.data_dir = data_dir or Path("data")
        self.data_dir.mkdir(exist_ok=True)

        self.datasets = {
            "residuos_municipales": {
                "url": "https://datosabiertos.gob.pe/sites/default/files/Residuos%20municipales%20generados%20anualmente%20unificado.csv",
                "filename": "residuos_municipales_unificado.csv",
            },
            "generacion_residuos": {
                "url": "https://datosabiertos.gob.pe/sites/default/files/Generacion%20anual%20de%20residuos%20solidos%20domiciliarios%20y%20municipales.csv",
                "filename": "generacion_residuos_domiciliarios.csv",
            },
        }

    def _get_file_hash(self, filepath: Path) -> str:
        """Get MD5 hash of file for cache validation"""
        if not filepath.exists():
            return ""

        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def _download_file(self, url: str, filepath: Path) -> bool:
        """Download a single file with retry logic"""
        max_retries = 3

        for attempt in range(max_retries):
            try:
                print(f"Downloading {filepath.name}... (attempt {attempt + 1})")

                response = requests.get(url, timeout=30, stream=True)
                response.raise_for_status()

                with open(filepath, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            _ = f.write(chunk)

                print(f"Downloaded {filepath.name}")
                return True

            except requests.RequestException as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2**attempt)

        return False

    def download_dataset(self, dataset_key: str, force: bool = False) -> Path:
        """Download a specific dataset"""
        if dataset_key not in self.datasets:
            raise ValueError(f"Unknown dataset: {dataset_key}")

        config = self.datasets[dataset_key]
        filepath = self.data_dir / config["filename"]

        # skip if file exists and not forcing
        if filepath.exists() and not force:
            print(
                f"✓ {config['filename']} already exists (use force=True to re-download)"
            )
            return filepath

        # download the file
        if self._download_file(config["url"], filepath):
            return filepath
        else:
            raise RuntimeError(f"Failed to download {dataset_key}")

    def download_all(self, force: bool = False) -> list[Path]:
        downloaded_files: list[Path] = []

        for dataset_key in self.datasets:
            try:
                filepath = self.download_dataset(dataset_key, force=force)
                downloaded_files.append(filepath)
            except Exception as e:
                print(f"Failed to download {dataset_key}: {e}")

        return downloaded_files

    def list_datasets(self) -> dict[str, str]:
        """list available datasets with their descriptions"""
        return {
            "residuos_municipales": "Residuos municipales generados anualmente unificado",
            "generacion_residuos": "Generación anual de residuos sólidos domiciliarios y municipales",
        }

    def get_file_paths(self) -> dict[str, Path]:
        """Get paths to all dataset files (whether they exist or not)"""
        return {
            key: self.data_dir / config["filename"]
            for key, config in self.datasets.items()
        }


def ensure_data(data_dir: Path = Path("data"), force: bool = False) -> dict[str, Path]:
    """
    Ensure all datasets are downloaded and return their paths.
    Simple function for notebook usage.
    """
    downloader = DataDownloader(data_dir)
    downloader.download_all(force=force)
    return downloader.get_file_paths()


def get_dataset_path(dataset_key: str, data_dir: Path = Path("data")) -> Path:
    """Get path to a specific dataset, downloading if needed"""
    downloader = DataDownloader(data_dir)
    return downloader.download_dataset(dataset_key)
