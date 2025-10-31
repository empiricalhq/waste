from pathlib import PurePath

import marimo as mo


def resolve_data_path(*parts) -> PurePath:
    """
    Return a string path to a data file under 'public', compatible with local and WASM environments.
    """
    base = mo.notebook_location() or (_ for _ in ()).throw(
        RuntimeError("Notebook location could not be determined")
    )
    return base / "public" / PurePath(*parts)
