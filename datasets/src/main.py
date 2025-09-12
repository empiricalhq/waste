import marimo


__generated_with = "0.15.3"
app = marimo.App(width="full")


@app.cell
def _(mo):
    mo.md(r"""# Análisis de datasets""")
    return


@app.cell
def _():
    import logging

    from pathlib import Path

    import altair as alt
    import geopandas as gpd
    import marimo as mo
    import matplotlib.pyplot as plt
    import polars as pl

    from data_downloader import download_datasets

    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = BASE_DIR / "data"
    return (
        BASE_DIR,
        DATA_DIR,
        alt,
        download_datasets,
        gpd,
        logging,
        mo,
        pl,
        plt,
    )


@app.cell
def _(DATA_DIR, download_datasets, mo):
    datasets = [
        "https://datosabiertos.gob.pe/dataset/generaci%C3%B3n-anual-de-residuos-s%C3%B3lidos-domiciliarios-y-municipales-ministerio-del-ambiente",
        "https://datosabiertos.gob.pe/dataset/residuos-municipales-generados-anualmente",
    ]

    all_files = download_datasets(datasets, DATA_DIR)
    mo.md("Datasets:")
    for file in all_files:
        mo.md(f"- {file}")

    dataset_paths = {
        "residuos_municipales": all_files[1] if len(all_files) > 1 else None,
        "generacion_residuos": all_files[0] if len(all_files) > 0 else None,
    }
    return (dataset_paths,)


@app.cell
def _(dataset_paths, pl):
    # Construye las rutas completas a los archivos CSV
    df1 = pl.read_csv(
        dataset_paths["residuos_municipales"],
        encoding="latin1",
        separator=";",
        truncate_ragged_lines=True,
    )

    df2 = pl.read_csv(
        dataset_paths["generacion_residuos"],
        encoding="latin1",
        separator=";",
        truncate_ragged_lines=True,
    )
    return df1, df2


@app.cell
def _(mo):
    mo.md(r"""## Mapas""")
    return


@app.cell
def _(BASE_DIR, logging):
    GEOJSON_DIR = BASE_DIR / "geojson"
    geojson_df = []

    for geojson_file in GEOJSON_DIR.glob("*.geojson"):
        geojson_df.append(geojson_file)
        logging.info({geojson_file})
    return (geojson_df,)


@app.cell
def _(geojson_df, gpd):
    mapa_departamental_peru = gpd.read_file(geojson_df[0])
    mapa_departamental_peru.head()
    return (mapa_departamental_peru,)


@app.cell
def _(mapa_departamental_peru, mo, plt):
    mapa_departamental_peru.plot(figsize=(5, 5), edgecolor="gray", cmap="Pastel1")
    plt.ylabel("Latitude")
    plt.xlabel("Longitude")
    plt.title("Mapa del Perú")
    mo.mpl.interactive(plt.gcf())
    return


@app.cell
def _(geojson_df, gpd):
    mapa_distrital = gpd.read_file(geojson_df[1])
    return (mapa_distrital,)


@app.cell
def _(mapa_distrital, mo, plt):
    mapa_distrital.plot(figsize=(5, 5), edgecolor="gray", cmap="Pastel1")
    plt.ylabel("Latitude")
    plt.xlabel("Longitude")
    plt.title("Mapa distrital del Perú")
    mo.mpl.interactive(plt.gcf())
    return


@app.cell
def _(mapa_distrital, mo, plt):
    mapa_distrital[mapa_distrital.NOMBDEP == "LIMA"].plot(
        figsize=(5, 5), edgecolor="gray", cmap="Pastel1"
    )
    plt.ylabel("Latitude")
    plt.xlabel("Longitude")
    plt.title("Mapa distrital de la provincia de Lima")
    mo.mpl.interactive(plt.gcf())
    return


@app.cell
def _(mapa_distrital, mo, plt):
    mapa_distrital[mapa_distrital.NOMBPROV == "LIMA"].plot(
        figsize=(5, 5), edgecolor="gray", cmap="Pastel1"
    )
    plt.ylabel("Latitude")
    plt.xlabel("Longitude")
    plt.title("Mapa distrital de Lima Metropolitana")
    mo.mpl.interactive(plt.gcf())
    return


@app.cell
def _(mo):
    mo.md(r"""## Dataset: Residuos municipales generados anualmente unificado""")
    return


@app.cell
def _(df1):
    df1.head()
    return


@app.cell
def _(mo):
    mo.md(
        r"""## Dataset: Generacion anual de residuos sólidos domiciliarios y municipales"""
    )
    return


@app.cell
def _(df2):
    df2.head()
    return


@app.cell
def _(mo):
    mo.md(r"""### Residuos municipales por departamento""")
    return


@app.cell
def _(df2, pl):
    df2.group_by("DEPARTAMENTO").agg(
        pl.col("GENERACION_PER_CAPITA_DOM").mean().alias("gpc_dom_mean")
    )
    return


@app.cell
def _(df2, pl):
    df2.group_by(["ANIO", "DEPARTAMENTO"]).agg(
        pl.col("GENERACION_MUN_TANIO").sum().alias("residuos_mun_ton")
    ).sort(["ANIO", "DEPARTAMENTO"])
    return


@app.cell
def _(df2, mo):
    year = mo.ui.dropdown(
        options=sorted(df2["ANIO"].unique().to_list()),
        value=2020,
        label="Selecciona un año",
    )
    _ = year
    return (year,)


@app.cell
def _(df2, pl, year):
    data = df2.filter(pl.col("ANIO") == year.value)
    return (data,)


@app.cell
def _(data, mo, pl, plt):
    grouped = (
        data.group_by("DEPARTAMENTO")
        .agg(pl.col("GENERACION_MUN_TANIO").sum().alias("residuos_ton"))
        .sort("residuos_ton", descending=True)
    )

    labels = grouped["DEPARTAMENTO"]

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(labels, grouped["residuos_ton"])
    ax.set_ylabel("Toneladas de residuos municipales")
    ax.set_xticks(labels)
    plt.xticks(rotation=90)
    plt.tight_layout()

    mo.as_html(fig)
    return


@app.cell
def _(mo):
    mo.md(r"""### Evolución de residuos""")
    return


@app.cell
def _(alt, df2, mo, pl):
    df_time2 = (
        df2.group_by("ANIO")
        .agg(
            [
                pl.col("GENERACION_MUN_TANIO").sum().alias("Total_Toneladas"),
                pl.col("POB_TOTAL_INEI").sum().alias("Total_Poblacion"),
            ]
        )
        .with_columns(
            (pl.col("Total_Toneladas") * 1000 / pl.col("Total_Poblacion")).alias(
                "KG_per_capita"
            )
        )
        .sort("ANIO")
    )

    # Directo a altair sin conversión
    mo.ui.altair_chart(
        alt.Chart(df_time2)
        .mark_line(point=True, strokeWidth=2, color="steelblue")
        .encode(
            x=alt.X("ANIO:O", title="Año"),
            y=alt.Y("Total_Toneladas:Q", title="Toneladas"),
            tooltip=["ANIO:O", "Total_Toneladas:Q", "KG_per_capita:Q"],
        )
        .properties(title="Evolución de Residuos (2000-2024)", width=700, height=350)
    )
    return


@app.cell
def _(alt, df2, mo, pl):
    año_actual = df2.select(pl.col("ANIO").max()).item()

    df_ranking = (
        df2.filter(pl.col("ANIO") == año_actual)
        .select(["DISTRITO", "PROVINCIA", "DEPARTAMENTO", "GENERACION_MUN_TANIO"])
        .sort("GENERACION_MUN_TANIO", descending=True)
        .head(10)
        .with_columns(
            pl.concat_str(
                [pl.col("DISTRITO"), pl.lit(" ("), pl.col("PROVINCIA"), pl.lit(")")]
            ).alias("Municipio")
        )
    )

    # Con selección interactiva
    selection = alt.selection_point(on="mouseover", empty="all")

    mo.ui.altair_chart(
        alt.Chart(df_ranking)
        .add_params(selection)
        .mark_bar()
        .encode(
            x=alt.X("GENERACION_MUN_TANIO:Q", title="Toneladas"),
            y=alt.Y("Municipio:N", sort="-x", title="Municipio"),
            color=alt.condition(
                selection,
                alt.Color("GENERACION_MUN_TANIO:Q", scale=alt.Scale(scheme="reds")),
                alt.value("lightgray"),
            ),
            stroke=alt.condition(
                selection, alt.value("black"), alt.value("transparent")
            ),
            strokeWidth=alt.condition(selection, alt.value(2), alt.value(0)),
            tooltip=["Municipio", "GENERACION_MUN_TANIO", "DEPARTAMENTO"],
        )
        .properties(
            title=f"Top 10 Municipios ({año_actual}) - Hover para destacar",
            width=600,
            height=400,
        )
    )
    return


@app.cell
def _(df2, mo, pl):
    df_percapita = (
        df2.group_by("ANIO")
        .agg(
            [
                pl.col("GENERACION_MUN_TANIO").sum().alias("Total_Toneladas"),
                pl.col("POB_TOTAL_INEI").sum().alias("Total_Poblacion"),
            ]
        )
        .with_columns(
            (pl.col("Total_Toneladas") * 1000 / pl.col("Total_Poblacion")).alias(
                "KG_per_capita"
            )
        )
        .sort("ANIO")
    )

    ultimo_valor = df_percapita.select(pl.col("KG_per_capita").last()).item()
    ultimo_año = df_percapita.select(pl.col("ANIO").last()).item()

    mo.md(
        f"### Generación per cápita ({ultimo_año}): {ultimo_valor:.1f} kg/persona/año"
    )
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
