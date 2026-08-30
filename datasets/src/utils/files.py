from pathlib import PurePath

import marimo as mo


def resolve_data_path(*parts) -> PurePath:
    """Return a path under the notebook's public data directory."""
    base = mo.notebook_location() or (_ for _ in ()).throw(
        RuntimeError("Notebook location could not be determined")
    )
    return base / "public" / PurePath(*parts)
