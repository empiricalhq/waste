import marimo


__generated_with = "0.17.4"
app = marimo.App(width="full")


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Análisis de generación de residuos sólidos en Perú

    Autor: Pedro Rojas
    """)
    return


@app.cell
def _():
    import logging

    from pathlib import Path

    import altair as alt
    import marimo as mo
    import polars as pl

    import data_utils as downloader

    # Notebooks are run via `mise run dev` from the datasets directory.
    # The working directory is the datasets root.
    PROJECT_ROOT = Path.cwd()
    DATA_DIR = PROJECT_ROOT / "data"

    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )
    return DATA_DIR, alt, downloader, mo, pl


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Descarga de datasets

    Descarga de datos sobre la generación de residuos desde [datosabiertos.gob.pe](datosabiertos.gob.pe). Los archivos se guardan en "datasets/data".
    """)
    return


@app.cell
def _(DATA_DIR, downloader, mo):
    generation_datasets_urls = [
        "https://datosabiertos.gob.pe/dataset/generaci%C3%B3n-anual-de-residuos-s%C3%B3lidos-domiciliarios-y-municipales-ministerio-del-ambiente",
        "https://datosabiertos.gob.pe/dataset/residuos-municipales-generados-anualmente",
    ]

    generation_all_files = downloader.download(generation_datasets_urls, DATA_DIR)

    if generation_all_files:
        files_md = "Archivos descargados:\\n" + "".join(
            f"- `{file.name}`\\n" for file in generation_all_files
        )
        mo.md(files_md)
    else:
        mo.md(
            "No se descargaron archivos nuevos. Puede que ya se hayan descargado en pases anteriores."
        )

    generation_dataset_paths = {
        "generacion_residuos": next(
            (f for f in generation_all_files if "generacion_anual" in f.name), None
        )
    }
    return (generation_dataset_paths,)


@app.cell
def _(generation_dataset_paths, pl):
    # Cargar el dataset principal en un dataframe de Polars.
    df_generacion = (
        pl.read_csv(
            generation_dataset_paths["generacion_residuos"],
            encoding="latin1",
            separator=";",
            truncate_ragged_lines=True,
        )
        if generation_dataset_paths["generacion_residuos"]
        else None
    )
    return (df_generacion,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Dataset #1: Generación anual de residuos sólidos""")
    return


@app.cell(hide_code=True)
def _(df_generacion):
    df_generacion.head() if df_generacion is not None else "El dataset no pudo ser cargado."
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Evolución de la generación total de residuos

    Análisis de la cantidad total de residuos municipales generados a nivel nacional.
    """)
    return


@app.cell
def _(alt, df_generacion, mo, pl):
    if df_generacion is not None:
        df_time = (
            df_generacion.group_by("ANIO")
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

        line_chart = (
            alt.Chart(df_time)
            .mark_line(point=True, strokeWidth=2, color="steelblue")
            .encode(
                x=alt.X("ANIO:O", title="Año"),
                y=alt.Y("Total_Toneladas:Q", title="Toneladas"),
                tooltip=[
                    alt.Tooltip("ANIO:O", title="Año"),
                    alt.Tooltip("Total_Toneladas:Q", title="Toneladas", format=","),
                    alt.Tooltip("KG_per_capita:Q", title="Kg per cápita", format=".1f"),
                ],
            )
            .properties(
                title="Evolución anual de residuos municipales generados",
                width="container",
            )
        )
        mo.ui.altair_chart(line_chart)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Top 10 municipios con mayor generación de residuos

    Ranking de los municipios que más residuos generaron en el último año registrado.
    """)
    return


@app.cell
def _(alt, df_generacion, mo, pl):
    if df_generacion is not None:
        ultimo_año = df_generacion.select(pl.col("ANIO").max()).item()

        df_ranking = (
            df_generacion.filter(pl.col("ANIO") == ultimo_año)
            .select(["DISTRITO", "PROVINCIA", "DEPARTAMENTO", "GENERACION_MUN_TANIO"])
            .sort("GENERACION_MUN_TANIO", descending=True)
            .head(10)
            .with_columns(
                pl.concat_str(
                    [
                        pl.col("DISTRITO"),
                        pl.lit(" ("),
                        pl.col("PROVINCIA"),
                        pl.lit(")"),
                    ]
                ).alias("Municipio")
            )
        )

        selection = alt.selection_point(on="mouseover", empty="all")

        bar_chart = (
            alt.Chart(df_ranking)
            .add_params(selection)
            .mark_bar()
            .encode(
                x=alt.X("GENERACION_MUN_TANIO:Q", title="Toneladas generadas"),
                y=alt.Y("Municipio:N", sort="-x", title="Municipio"),
                color=alt.condition(
                    selection,
                    alt.Color(
                        "GENERACION_MUN_TANIO:Q", scale=alt.Scale(scheme="viridis")
                    ),
                    alt.value("lightgray"),
                ),
                tooltip=["Municipio", "DEPARTAMENTO", "GENERACION_MUN_TANIO"],
            )
            .properties(
                title=f"Top 10 municipios por generación de residuos ({ultimo_año})",
                width="container",
            )
        )
        mo.ui.altair_chart(bar_chart)
    return


if __name__ == "__main__":
    app.run()
