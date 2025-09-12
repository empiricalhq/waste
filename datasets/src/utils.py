from bs4 import Tag


def find_tag(
    parent: Tag,
    name: str | None = None,
    class_: str | None = None,
    id_: str | None = None,
) -> Tag | None:
    kwargs = {}
    if class_ is not None:
        kwargs["class_"] = class_
    if id_ is not None:
        kwargs["id"] = id_

    tag = parent.find(name=name, **kwargs)
    return tag if isinstance(tag, Tag) else None


def get_text(tag: Tag | None) -> str:
    """Return stripped text or empty string if tag is None."""
    return tag.get_text(strip=True) if tag else "unknown"
