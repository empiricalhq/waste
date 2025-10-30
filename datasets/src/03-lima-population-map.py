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
    mapa_departamental_path = DATA_DIR / "geojson" / "departamental.geojson"
    mapa_departamental_peru = gpd.read_file(mapa_departamental_path)
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
    mapa_distrital_path = DATA_DIR / "geojson" / "distrital.geojson"
    mapa_distrital = gpd.read_file(mapa_distrital_path)
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
def _(DATA_DIR, df, gpd):
    # This cell loads and cleans the attribute data from the DBF file.
    manzana_dbf_path = DATA_DIR / "lima" / "manzana.dbf"
    df_attrs = gpd.read_file(manzana_dbf_path)
    df_attrs = df_attrs.drop(columns="geometry", errors="ignore")
    df_attrs.columns = df_attrs.columns.str.strip()

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
    return


@app.cell
def _(DATA_DIR, gpd, manzana_attrs):
    # This cell loads the shapefile and merges it with the attribute data.
    manzana_shp_path = DATA_DIR / "lima" / "manzana.shp"
    manzana_gdf = gpd.read_file(manzana_shp_path)
    manzana_gdf.columns = manzana_gdf.columns.str.strip()
    manzana_gdf = manzana_gdf.drop(columns=["T_TOTAL"], errors="ignore")

    manzana_merged_gdf = manzana_gdf.merge(
        manzana_attrs[["Mz", "T_TOTAL"]], on="Mz", how="left"
    )
    return (manzana_merged_gdf,)


@app.cell
def _(manzana_merged_gdf, mo, plt):
    fig, ax = plt.subplots(1, 1, figsize=(12, 12))
    manzana_merged_gdf.plot(
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
