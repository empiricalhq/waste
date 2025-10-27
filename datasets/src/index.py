import marimo

__generated_with = "0.15.2"
app = marimo.App(width="full")


@app.cell(hide_code=True)
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

    from data_downloader import download
    import re
    import io

    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = BASE_DIR / "data"
    return BASE_DIR, DATA_DIR, alt, download, gpd, io, logging, mo, pl, plt, re


@app.cell
def _(DATA_DIR, download, mo):
    datasets = [
        "https://datosabiertos.gob.pe/dataset/generaci%C3%B3n-anual-de-residuos-s%C3%B3lidos-domiciliarios-y-municipales-ministerio-del-ambiente",
        "https://datosabiertos.gob.pe/dataset/residuos-municipales-generados-anualmente",
        "https://datosabiertos.gob.pe/dataset/composici%C3%B3n-de-residuos-s%C3%B3lidos-domiciliarios"
    ]

    all_files = download(datasets, DATA_DIR)

    dataset_paths = {
        "residuos_municipales": all_files[1] if len(all_files) > 1 else None,
        "generacion_residuos": all_files[0] if len(all_files) > 0 else None,
    }

    # printear los archivos
    files_md = ""
    for file in all_files:
        files_md += f"- {file}\n"

    mo.md(files_md)
    return (dataset_paths,)


@app.cell
def _(dataset_paths):
    dataset_paths
    return


@app.cell
def _(io, pl, re):
    def load_residuos_municipales(path: str) -> pl.DataFrame:
        """
        Limpia y carga el dataset de residuos municipales del MINAM.
        Repara comas y separadores, codificación y tipos numéricos.
        """
        #Leer texto crudo (reparar encoding y errores)
        with open(path, "r", encoding="windows-1252", errors="ignore") as f:
            lines = f.readlines()

        #Reparar patrones numéricos deformados como "0 48;" → "0,48;"
        fixed_lines = []
        for line in lines:
            # Reparar números con espacio entre entero y decimal
            line = re.sub(r"(\d)\s+(\d{2})(;)", r"\1,\2\3", line)
            # Reparar casos tipo "4857 5;" → "4857,5;"
            line = re.sub(r"(\d{3,})\s+(\d)(;)", r"\1,\2\3", line)
            # Normalizar múltiples separadores
            line = re.sub(r";{2,}", ";", line)
            fixed_lines.append(line)

        cleaned_text = "".join(fixed_lines)

        #Leer con Polars
        df = pl.read_csv(
            io.StringIO(cleaned_text),
            separator=";",
            encoding="windows-1252",
            null_values=["", "NA", "ND", "No disponible"],
            infer_schema_length=5000,
        )

        #Limpiar nombres de columnas
        df = df.rename({c: c.strip().replace(" ", "_").upper() for c in df.columns})

        #Convertir columnas numéricas (decimales y reales)
        numeric_cols = ["GPC_DOM", "QRESIDUOS_DOM", "QRESIDUOS_NO_DOM", "QRESIDUOS_MUN"]
        for c in numeric_cols:
            if c in df.columns:
                df = df.with_columns(
                    pl.col(c).str.replace(",", ".").cast(pl.Float64, strict=False)
                )

        #Convertir columnas enteras si aplica
        int_cols = ["FECHA_CORTE", "N_SEC", "UBIGEO", "POB_TOTAL", "POB_URBANA", "POB_RURAL", "PERIODO"]
        for c in int_cols:
            if c in df.columns:
                df = df.with_columns(pl.col(c).cast(pl.Int64, strict=False))

        return df
    return (load_residuos_municipales,)


@app.cell
def _(dataset_paths, pl):
    # Construye las rutas completas a los archivos CSV
    df2 = pl.read_csv(
        dataset_paths["generacion_residuos"],
        encoding="latin1",
        separator=";",
        truncate_ragged_lines=True,
    )
    return (df2,)


@app.cell(hide_code=True)
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
    plt.ylabel("Latitud")
    plt.xlabel("Longitud")
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
    plt.ylabel("Latitud")
    plt.xlabel("Longitud")
    plt.title("Mapa distrital del Perú")
    mo.mpl.interactive(plt.gcf())
    return


@app.cell
def _(mapa_distrital, mo, plt):
    mapa_distrital[mapa_distrital.NOMBDEP == "LIMA"].plot(
        figsize=(5, 5), edgecolor="gray", cmap="Pastel1"
    )
    plt.ylabel("Latitud")
    plt.xlabel("Longitud")
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


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Dataset: Residuos municipales generados anualmente unificado""")
    return


@app.cell
def _(dataset_paths, load_residuos_municipales):
    df_residuos = load_residuos_municipales(dataset_paths["residuos_municipales"])
    return (df_residuos,)


@app.cell
def _(df_residuos):
    df_residuos.head()
    return


@app.cell
def _(df_residuos, pl):
    lima = df_residuos.filter(pl.col("DEPARTAMENTO") == "LIMA")
    return (lima,)


@app.cell
def _(lima, mo):
    periodos = sorted(lima["PERIODO"].unique().to_list())

    # Crear el control tipo slider
    periodo_slider = mo.ui.slider(
        start=min(periodos),
        stop=max(periodos),
        step=1,
        label="Selecciona el periodo (año)",
        value=max(periodos)  # valor inicial (último año disponible)
    )

    # Mostrar el slider en la interfaz
    periodo_slider
    return (periodo_slider,)


@app.cell
def _(lima, periodo_slider, pl):
    top_total_res_muni = (
        lima
        .filter(pl.col("PERIODO")==periodo_slider.value)
        .select(["DISTRITO", "QRESIDUOS_MUN","PERIODO"])
    )
    top_total_res_muni
    return


@app.cell
def _(lima, periodo_slider, pl):
    top_total_res_domiciliarios = (
        lima
        .filter(pl.col("PERIODO")==periodo_slider.value)
        .select(["DISTRITO", "QRESIDUOS_DOM","PERIODO"])
    )
    top_total_res_domiciliarios
    return


@app.cell
def _(lima, periodo_slider, pl):
    # Domiciliario KILOGRAMO/HABITANTE/DIA
    res_domiciliario = (
        lima
        .filter(pl.col("PERIODO")==periodo_slider.value)
        .select(["DISTRITO","GPC_DOM","PERIODO"])
    )
    res_domiciliario
    return (res_domiciliario,)


@app.cell
def _(periodo_slider, pl, plt, res_domiciliario):
    df_plot = (
        res_domiciliario
        .with_columns(pl.col("GPC_DOM").cast(pl.Float64, strict=False))
        .sort("GPC_DOM", descending=True)
        .head(10)
    )

    # Extraer listas directamente desde Polars
    distritos = df_plot["DISTRITO"].to_list()
    valores = df_plot["GPC_DOM"].to_list()

    # Crear gráfico con matplotlib
    plt.figure(figsize=(10, 5))
    plt.barh(distritos, valores, color="#2E7D32")
    plt.title(f"Top 10 distritos por generación domiciliaria ({periodo_slider.value})")
    plt.xlabel("Kg/hab/día")
    plt.ylabel("Distrito")
    plt.gca().invert_yaxis()
    plt.grid(alpha=0.3)
    plt.show()
    return


@app.cell
def _(lima, periodo_slider, pl, plt):
    total_periodo = (
        lima
        .filter(pl.col("PERIODO") == periodo_slider.value)
        .select([
            pl.col("QRESIDUOS_DOM").cast(pl.Float64, strict=False).sum().alias("TOTAL_DOMICILIARIO"),
            pl.col("QRESIDUOS_MUN").cast(pl.Float64, strict=False).sum().alias("TOTAL_MUNICIPAL"),
        ])
    )

    # Extraer valores
    total_dom = total_periodo[0, "TOTAL_DOMICILIARIO"]
    total_mun = total_periodo[0, "TOTAL_MUNICIPAL"]

    # Graficar barras
    plt.figure(figsize=(6, 4))
    plt.bar(["Domiciliario", "Municipal"], [total_dom/1e6, total_mun/1e6], color=["#81C784", "#2E7D32"])
    plt.title(f"Totales de residuos en Lima ({periodo_slider.value})")
    plt.ylabel("Toneladas (en millones)")
    plt.tight_layout()
    plt.show()
    return


@app.cell
def _(lima, pl):
    kpi_lima_df = (
        lima.with_columns([
            (pl.col("QRESIDUOS_MUN") / pl.col("POB_TOTAL")).alias("KG_MUN_PER_CAPITA_DIA"),
            (pl.col("QRESIDUOS_DOM") / pl.col("POB_TOTAL")).alias("KG_DOM_PER_CAPITA_DIA"),
            (pl.col("QRESIDUOS_DOM") / pl.col("QRESIDUOS_MUN")).alias("RATIO_DOM_MUN"),
        ])
        .select(["DISTRITO","PROVINCIA","PERIODO","POB_TOTAL","GPC_DOM",
                 "QRESIDUOS_MUN","QRESIDUOS_DOM","KG_MUN_PER_CAPITA_DIA",
                 "KG_DOM_PER_CAPITA_DIA","RATIO_DOM_MUN"])
    )
    kpi_lima_df
    return (kpi_lima_df,)


@app.cell
def _(kpi_lima_df, pl):
    desc_lima_df = (
        kpi_lima_df
        .group_by("PERIODO")
        .agg([
            pl.len().alias("N_distritos"),
            pl.col("KG_MUN_PER_CAPITA_DIA").mean().alias("kg_mun_pc_media"),
            pl.col("KG_MUN_PER_CAPITA_DIA").median().alias("kg_mun_pc_mediana"),
            pl.col("KG_MUN_PER_CAPITA_DIA").std().alias("kg_mun_pc_sd"),
            pl.col("KG_MUN_PER_CAPITA_DIA").quantile(0.25).alias("q1"),
            pl.col("KG_MUN_PER_CAPITA_DIA").quantile(0.75).alias("q3"),
        ])
        .with_columns((pl.col("q3")-pl.col("q1")).alias("IQR"))
        .sort("PERIODO")
    )
    desc_lima_df
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Dataset: Generacion anual de residuos sólidos domiciliarios y municipales""")
    return


@app.cell
def _(df2):
    df2.head()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""### Residuos municipales por departamento""")
    return


@app.cell(hide_code=True)
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

    base = alt.Chart(df_time2).encode(
        x=alt.X("ANIO:O", title="Año"),
        y=alt.Y("Total_Toneladas:Q", title="Toneladas"),
        tooltip=[
            alt.Tooltip("ANIO:O", title="Año"),
            alt.Tooltip("Total_Toneladas:Q", title="Toneladas"),
            alt.Tooltip("KG_per_capita:Q", title="Kg per capita"),
        ],
    )

    line_chart = base.mark_line(
        point=True, strokeWidth=2, color="steelblue"
    ).properties(title="Evolución de Residuos (2000-2024)", width=700, height=350)

    mo.ui.altair_chart(line_chart)
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


if __name__ == "__main__":
    app.run()
