from bs4 import Tag


def find_tag(
    parent: Tag,
    name: str | None = None,
    class_: str | None = None,
    id_: str | None = None,
) -> Tag | None:
    """Safely find a tag in BeautifulSoup object."""
    if class_ is not None and id_ is not None:
        result = parent.find(name=name, class_=class_, id=id_)
    elif class_ is not None:
        result = parent.find(name=name, class_=class_)
    elif id_ is not None:
        result = parent.find(name=name, id=id_)
    else:
        result = parent.find(name=name)

    return result if isinstance(result, Tag) else None
