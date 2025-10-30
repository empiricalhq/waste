import marimo


__generated_with = "0.17.4"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Visualizaciones geográficas de Perú

    Este notebook muestra mapas departamentales, distritales y un mapa de calor de la población de Lima por manzana.
    """)
    return


@app.cell
def _():
    from pathlib import Path

    import geopandas as gpd
    import matplotlib.pyplot as plt

    # definitions
    PROJECT_ROOT = Path.cwd()
    DATA_DIR = PROJECT_ROOT / "data"
    return DATA_DIR, gpd, plt


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""### Mapa departamental de Perú""")
    return


@app.cell
def _(DATA_DIR, gpd):
    geojson_path = DATA_DIR / "geojson" / "departamental.geojson"
    mapa_departamental_peru = gpd.read_file(geojson_path)
    return (mapa_departamental_peru,)


@app.cell
def _(mapa_departamental_peru, mo, plt):
    fig, ax = plt.subplots(1, 1, figsize=(8, 8))
    mapa_departamental_peru.plot(ax=ax, edgecolor="gray", cmap="Pastel1")

    # set up the figure
    ax.set_title("Mapa departamental del Perú")
    ax.set_ylabel("Latitud")
    ax.set_xlabel("Longitud")

    # plot
    plt.tight_layout()
    mo.mpl.interactive(fig)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""### Mapa distrital de Perú""")
    return


@app.cell
def _(DATA_DIR, gpd):
    geojson_path2 = DATA_DIR / "geojson" / "distrital.geojson"
    mapa_distrital = gpd.read_file(geojson_path2)
    return (mapa_distrital,)


@app.cell
def _(mapa_distrital, mo, plt):
    fig, ax = plt.subplots(1, 1, figsize=(8, 8))

    mapa_distrital.plot(ax=ax, edgecolor="gray", linewidth=0.2, cmap="Pastel2")

    # set up the figure
    ax.set_title("Mapa distrital del Perú")
    ax.set_ylabel("Latitud")
    ax.set_xlabel("Longitud")

    # plot
    plt.tight_layout()
    mo.mpl.interactive(fig)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Mapa de población por manzana en Lima

    Datos de [geogpsperu](https://drive.google.com/file/d/1qqVdEiCWofxUhPPgSHU0Le82FLUaA7-H/view).
    """)
    return


@app.cell
def _(DATA_DIR, gpd):
    # This cell loads and cleans the attribute data from the DBF file.
    dbf_path = DATA_DIR / "lima" / "manzana.dbf"
    df = gpd.read_file(dbf_path)
    df = df.drop(columns="geometry", errors="ignore")
    df.columns = df.columns.str.strip()

    cols_to_drop = [
        "contacto",
        "whatsapp",
        "descargar",
        "ARCHIVO",
        "IDPROV",
        "NOMBDEP",
        "NOMBPROV",
        "AREA",
        "CODCCPP",
        "LLAVE_MZS",
    ]
    df_attrs = df.drop(columns=cols_to_drop, errors="ignore")
    return (df_attrs,)


@app.cell
def _(DATA_DIR, df_attrs, gpd):
    # This cell loads the shapefile and merges it with the attribute data.
    shp_path = DATA_DIR / "lima" / "manzana.shp"
    gdf = gpd.read_file(shp_path)
    gdf.columns = gdf.columns.str.strip()
    gdf = gdf.drop(columns=["T_TOTAL"], errors="ignore")

    merged_gdf = gdf.merge(df_attrs[["Mz", "T_TOTAL"]], on="Mz", how="left")
    return (merged_gdf,)


@app.cell
def _(merged_gdf, mo, plt):
    fig, ax = plt.subplots(1, 1, figsize=(12, 12))
    merged_gdf.plot(
        column="T_TOTAL",
        ax=ax,
        legend=True,
        cmap="viridis",
        edgecolor="white",
        linewidth=0.3,
        missing_kwds={"color": "lightgrey"},
    )

    # set up the figure
    ax.set_title("Distribución de la población por manzana en Lima", fontsize=14)
    ax.set_axis_off()
    plt.tight_layout()

    # plot
    mo.mpl.interactive(fig)
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
