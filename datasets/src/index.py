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
    import json
    from pathlib import Path

    import altair as alt
    import folium
    import marimo as mo
    import polars as pl
    import matplotlib.pyplot as plt
    import re

    from data_downloader import download

    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = BASE_DIR / "data"
    return BASE_DIR, DATA_DIR, alt, download, folium, json, mo, pl, plt


@app.cell
def _(DATA_DIR, download, mo):
    datasets = [
        "https://datosabiertos.gob.pe/dataset/generaci%C3%B3n-anual-de-residuos-s%C3%B3lidos-domiciliarios-y-municipales-ministerio-del-ambiente",
        "https://datosabiertos.gob.pe/dataset/residuos-municipales-generados-anualmente",
        "https://datosabiertos.gob.pe/dataset/composici%C3%B3n-de-residuos-s%C3%B3lidos-domiciliarios",
        "https://datosabiertos.gob.pe/dataset/valorizaci%C3%B3n-de-residuos-s%C3%B3lidos-nivel-distrital-ministerio-del-ambiente-minam"
    ]

    all_files = download(datasets, DATA_DIR)

    dataset_paths = {
        "residuos_municipales": all_files[1] if len(all_files) > 1 else None,
        "generacion_residuos": all_files[0] if len(all_files) > 0 else None,
        "valorizacion_inorganicos": all_files[3] if len(all_files) > 3 else None,
        "valorizacion_organicos": all_files[4] if len(all_files) > 4 else None
    }

    # printear los archivos
    files_md = ""
    for file in all_files:
        files_md += f"- {file}\n"

    mo.md(files_md)
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


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Mapas""")
    return


@app.cell
def _(BASE_DIR, folium, json, mo):
    GEOJSON_DIR = BASE_DIR / "geojson"
    departamental_path = GEOJSON_DIR / "peru_departamental_simple.geojson"
    distrital_path = GEOJSON_DIR / "peru_distrital_simple.geojson"

    with open(departamental_path, 'r', encoding='utf-8') as f:
        geojson_departamental = json.load(f)

    with open(distrital_path, 'r', encoding='utf-8') as f:
        geojson_distrital = json.load(f)

    mapa_dept = folium.Map(location=[-9.19, -75.01], zoom_start=5)
    folium.GeoJson(geojson_departamental, name='Departamentos').add_to(mapa_dept)

    lima_features = [
        feature for feature in geojson_distrital['features']
        if feature['properties']['NOMBPROV'] == 'LIMA'
    ]
    geojson_lima = {'type': 'FeatureCollection', 'features': lima_features}
    mapa_lima = folium.Map(location=[-12.0464, -77.0428], zoom_start=10)
    folium.GeoJson(
        geojson_lima,
        name='Distritos de Lima',
        tooltip=folium.GeoJsonTooltip(fields=['NOMBDIST'], aliases=['Distrito:'])
    ).add_to(mapa_lima)

    mo.vstack([
        mo.md("### Mapa Departamental del Perú"),
        mapa_dept,
        mo.md("### Mapa Distrital de Lima Metropolitana"),
        mapa_lima
    ])

    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""## Dataset: Residuos municipales generados anualmente unificado""")
    return


@app.cell
def _(df1):
    df1.head()
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


@app.cell(hide_code=True)
def _(mo):
    mo.md(r""" """)
    return


@app.cell
def _(mo):
    mo.md(r"""# Análisis de Valorización de Resuidos Orgánicos e Inorgánicos""")
    return


@app.cell
def _(dataset_paths, pl):
    df_organicos = pl.read_csv(
        dataset_paths["valorizacion_organicos"],
        encoding="utf-8-sig",
        separator=";",
        decimal_comma=False,
        infer_schema_length=0
    )
    return (df_organicos,)


@app.cell
def _(df_organicos):
    df_organicos
    return


@app.cell
def _():
    int_cols_organicos = ["FECHA_CORTE", "N_SEC", "POB_TOTAL", "POB_URBANA", "POB_RURAL", "PERIODO"]
    float_cols_organicos = ["QRESIDUOS_MUN", "QRESIDUOS _VAL_ORGAN"]
    return float_cols_organicos, int_cols_organicos


@app.cell
def _(df_organicos, float_cols_organicos, int_cols_organicos, pl):
    df_organicos_clean = df_organicos.with_columns([
        df_organicos[c].str.replace_all(",", "").cast(pl.Int64) for c in int_cols_organicos
    ] + [
        df_organicos[c].str.replace_all(",", "").cast(pl.Float64) for c in float_cols_organicos
    ])
    return (df_organicos_clean,)


@app.cell
def _(dataset_paths, pl):
    df_inorganicos = pl.read_csv(
        dataset_paths["valorizacion_inorganicos"],
        encoding="utf-8-sig",
        separator=";",
        decimal_comma=False,
        infer_schema_length=0
    )
    return (df_inorganicos,)


@app.cell
def _(df_organicos_clean):
    df_organicos_clean
    return


@app.cell
def _(df_inorganicos):
    df_inorganicos
    return


@app.cell
def _():
    int_cols_inorganicos = ["FECHA_CORTE", "N_SEC", "POB_TOTAL", "POB_URBANA", "POB_RURAL", "PERIODO"]
    float_cols_inorganicos = ["QRESIDUOS_MUN", "QRESIDUOS _VAL_INORGAN"]
    return float_cols_inorganicos, int_cols_inorganicos


@app.cell
def _(df_inorganicos, float_cols_inorganicos, int_cols_inorganicos, pl):
    df_inorganicos_clean = df_inorganicos.with_columns([
        df_inorganicos[c].str.replace_all(",", "").cast(pl.Int64) for c in int_cols_inorganicos
    ] + [
        df_inorganicos[c].str.replace_all(",", "").cast(pl.Float64) for c in float_cols_inorganicos
    ])
    return (df_inorganicos_clean,)


@app.cell
def _(df_inorganicos_clean):
    df_inorganicos_clean
    return


@app.cell
def _(mo):
    mo.md(r"""## Top de Valorización""")
    return


@app.cell
def _(df_inorganicos_clean, df_organicos_clean, mo, pl):
    # Obtener todos los años únicos de ambos dataframes para poblar el selector
    years_organicos = df_organicos_clean["PERIODO"].unique().sort()
    years_inorganicos = df_inorganicos_clean["PERIODO"].unique().sort()
    all_years = pl.concat([years_organicos, years_inorganicos]).unique().sort(descending=True).to_list()

    # Crear el selector de año, con el año más reciente por defecto
    selected_year = mo.ui.dropdown(
        options=all_years,
        value=all_years[0] if all_years else None,
        label="Selecciona un año para el ranking:"
    )

    # Mostrar el selector en la notebook
    selected_year
    return (selected_year,)


@app.cell
def _(df_inorganicos_clean, df_organicos_clean, mo, pl, selected_year):
    # Detener la ejecución si no se ha seleccionado un año
    mo.stop(selected_year.value is None, mo.md("Por favor, selecciona un año."))

    # 1. Filtrar ambos dataframes por el año seleccionado
    df_organicos_filtered = df_organicos_clean.filter(pl.col("PERIODO") == selected_year.value)
    df_inorganicos_filtered = df_inorganicos_clean.filter(pl.col("PERIODO") == selected_year.value)

    # 2. Agregar la valorización por distrito (sobre los datos ya filtrados por año)
    organicos_agg = df_organicos_filtered.group_by("DISTRITO").agg(
        pl.col("QRESIDUOS _VAL_ORGAN").sum().alias("Total_Organicos_Anual")
    )
    inorganicos_agg = df_inorganicos_filtered.group_by("DISTRITO").agg(
        pl.col("QRESIDUOS _VAL_INORGAN").sum().alias("Total_Inorganicos_Anual")
    )

    # 3. Unir los dos DataFrames agregados
    df_unido_anual = organicos_agg.join(
        inorganicos_agg, on="DISTRITO", how="full"
    )

    # 4. Rellenar nulos y calcular el total
    df_top_distritos_anual = (
        df_unido_anual.fill_null(0)
        .with_columns(
            (pl.col("Total_Organicos_Anual") + pl.col("Total_Inorganicos_Anual")).alias(
                "Total_Valorizado_Anual"
            )
        )
        .sort("Total_Valorizado_Anual", descending=True)
    )

    # 5. Mostrar el top 10 con un título dinámico
    mo.vstack([
        mo.md(f"### Top 10 Distritos con Mayor Valorización en {selected_year.value}"),
        df_top_distritos_anual.head(10)
    ])
    return (df_top_distritos_anual,)


@app.cell
def _(alt, df_top_distritos_anual, mo, selected_year):
    # Tomamos el top 10 del DataFrame calculado en la celda anterior
    df_chart = df_top_distritos_anual.head(10)

    # Creamos el gráfico de barras horizontales
    bar_chart = alt.Chart(df_chart).mark_bar().encode(
        # Eje X: La cantidad total valorizada. :Q indica que es cuantitativo.
        x=alt.X('Total_Valorizado_Anual:Q', title='Total Valorizado (Toneladas/Año)'),
    
        # Eje Y: El nombre del distrito. :N indica que es nominal (categórico).
        # 'sort=-x' ordena las barras de mayor a menor.
        y=alt.Y('DISTRITO:N', title='Distrito', sort='-x'),
    
        # Color: Coloreamos las barras según la cantidad para un mejor efecto visual.
        color=alt.Color('Total_Valorizado_Anual:Q', 
                        scale=alt.Scale(scheme='viridis'), 
                        legend=None), # Ocultamos la leyenda de color, es redundante.
    
        # Tooltip: Información que aparece al pasar el cursor sobre una barra.
        tooltip=[
            alt.Tooltip('DISTRITO', title='Distrito'),
            alt.Tooltip('Total_Valorizado_Anual:Q', title='Total Valorizado', format=',.2f'),
            alt.Tooltip('Total_Organicos_Anual:Q', title='Orgánicos', format=',.2f'),
            alt.Tooltip('Total_Inorganicos_Anual:Q', title='Inorgánicos', format=',.2f')
        ]
    ).properties(
        # Título dinámico que cambia con el año seleccionado.
        title=f"Top 10 Distritos por Residuos Valorizados en {selected_year.value}",
        width=700,
        height=400
    )

    # Usamos mo.ui.altair_chart para mostrar el gráfico en marimo
    mo.ui.altair_chart(bar_chart)
    return


@app.cell
def _(alt, df_inorganicos_clean, df_organicos_clean, mo, pl):
    # 1. Agregar la valorización total de orgánicos por distrito
    organicos_agg_total = df_organicos_clean.group_by("DISTRITO").agg(
        pl.col("QRESIDUOS _VAL_ORGAN").sum().alias("Orgánicos")
    )

    # 2. Agregar la valorización total de inorgánicos por distrito
    inorganicos_agg_total = df_inorganicos_clean.group_by("DISTRITO").agg(
        pl.col("QRESIDUOS _VAL_INORGAN").sum().alias("Inorgánicos")
    )

    # 3. Unir los dos DataFrames agregados
    df_unido_total = organicos_agg_total.join(
        inorganicos_agg_total, on="DISTRITO", how="full"
    ).fill_null(0)

    # 4. Calcular el total y obtener el top 15
    df_top_historico = (
        df_unido_total.with_columns(
            (pl.col("Orgánicos") + pl.col("Inorgánicos")).alias("Total_Valorizado")
        )
        .sort("Total_Valorizado", descending=True)
        .head(15)
    )

    # 5. Reestructurar (unpivot) los datos para el gráfico apilado (CORREGIDO)
    df_top_historico_long = df_top_historico.unpivot(
        index=["DISTRITO", "Total_Valorizado"], # <-- 'id_vars' ahora es 'index'
        on=["Orgánicos", "Inorgánicos"],       # <-- 'value_vars' ahora es 'on'
        variable_name="Tipo_Residuo",
        value_name="Toneladas"
    )

    # 6. Crear el gráfico de barras apiladas
    stacked_bar_chart = alt.Chart(df_top_historico_long).mark_bar().encode(
        x=alt.X('Toneladas:Q', title='Total Valorizado (Toneladas)'),
        y=alt.Y('DISTRITO:N', title='Distrito', 
                sort=alt.EncodingSortField(field="Total_Valorizado", op="sum", order='descending')),
        color=alt.Color('Tipo_Residuo:N', title='Tipo de Residuo',
                        scale=alt.Scale(scheme='tableau10')),
        tooltip=[
            alt.Tooltip('DISTRITO', title='Distrito'),
            alt.Tooltip('Tipo_Residuo', title='Tipo'),
            alt.Tooltip('Toneladas:Q', title='Toneladas', format=',.2f')
        ]
    ).properties(
        title="Top 15 Distritos por Valorización Total (Histórico)",
        width=700,
        height=500
    )

    mo.ui.altair_chart(stacked_bar_chart)
    return


@app.cell
def _(df2, df_inorganicos_clean, df_organicos_clean, mo, pl):
    # 1. Calcular el total de residuos generados por año del df2
    generacion_anual = df2.group_by("ANIO").agg(
        pl.col("GENERACION_MUN_TANIO").sum().alias("Total_Generado")
    )

    # 2. Calcular el total de residuos valorizados (orgánicos + inorgánicos) por año
    valorizacion_organicos_anual = df_organicos_clean.group_by("PERIODO").agg(
        pl.col("QRESIDUOS _VAL_ORGAN").sum().alias("Total_Organicos")
    )
    valorizacion_inorganicos_anual = df_inorganicos_clean.group_by("PERIODO").agg(
        pl.col("QRESIDUOS _VAL_INORGAN").sum().alias("Total_Inorganicos")
    )

    # Unir los datos de valorización y sumar para obtener el total
    valorizacion_anual = valorizacion_organicos_anual.join(
        valorizacion_inorganicos_anual, on="PERIODO", how="full"
    ).fill_null(0).with_columns(
        (pl.col("Total_Organicos") + pl.col("Total_Inorganicos")).alias("Total_Valorizado")
    ).select(["PERIODO", "Total_Valorizado"])

    # 3. Unir los dataframes de generación y valorización
    # Renombramos 'PERIODO' a 'ANIO' para que la unión sea directa
    df_evolucion = generacion_anual.join(
        valorizacion_anual.rename({"PERIODO": "ANIO"}), on="ANIO", how="left"
    ).fill_null(0).sort("ANIO")

    mo.vstack([
        mo.md(r"### Tabla de Evolución Anual (Generado vs. Valorizado)"),
        df_evolucion
    ])
    return (df_evolucion,)


@app.cell
def _(alt, df_evolucion, mo):
    # Reestructuramos los datos a formato "largo" para Altair
    df_evolucion_long = df_evolucion.unpivot(
        index="ANIO",
        on=["Total_Generado", "Total_Valorizado"],
        variable_name="Tipo",
        value_name="Toneladas"
    )

    # Creamos el gráfico de líneas múltiples
    line_chart_comparativo = alt.Chart(df_evolucion_long).mark_line(point=True).encode(
        x=alt.X("ANIO:O", title="Año"),
        y=alt.Y("Toneladas:Q", title="Toneladas Anuales"),
        color=alt.Color("Tipo:N", title="Métrica", scale=alt.Scale(scheme='set1')),
        tooltip=["ANIO", "Tipo", alt.Tooltip("Toneladas:Q", format=",.0f")]
    ).properties(
        title="Evolución de Residuos Generados vs. Valorizados",
        width=700,
        height=400
    )

    mo.ui.altair_chart(line_chart_comparativo)
    return


@app.cell
def _(alt, df_evolucion, mo, pl):
    # Calcular la tasa de valorización
    df_tasa = df_evolucion.with_columns(
        (
            (pl.col("Total_Valorizado") / pl.col("Total_Generado")) * 100
        ).alias("Tasa_Valorizacion_Pct")
    ).fill_nan(0) # Rellenar posibles NaN si hubo división por cero

    # Crear el gráfico de área para la tasa
    area_chart_tasa = alt.Chart(df_tasa).mark_area(
        line={'color':'darkgreen'},
        color=alt.Gradient(
            gradient='linear',
            stops=[alt.GradientStop(color='white', offset=0),
                   alt.GradientStop(color='darkgreen', offset=1)],
            x1=1, x2=1, y1=1, y2=0
        )
    ).encode(
        x=alt.X("ANIO:O", title="Año"),
        y=alt.Y("Tasa_Valorizacion_Pct:Q", title="Tasa de Valorización (%)"),
        tooltip=["ANIO", alt.Tooltip("Tasa_Valorizacion_Pct:Q", format=".2f")]
    ).properties(
        title="Evolución de la Tasa de Valorización Anual",
        width=700,
        height=400
    )

    mo.ui.altair_chart(area_chart_tasa)
    return


@app.cell
def _(alt, df_evolucion, mo, pl):
    # Calcular el crecimiento anual usando la función shift()
    df_crecimiento = df_evolucion.with_columns(
        (
            (pl.col("Total_Valorizado") - pl.col("Total_Valorizado").shift(1)) / pl.col("Total_Valorizado").shift(1) * 100
        ).alias("Crecimiento_Anual_Pct")
    ).fill_nan(0)

    # Crear el gráfico de barras para el crecimiento
    bar_chart_crecimiento = alt.Chart(df_crecimiento).mark_bar().encode(
        x=alt.X("ANIO:O", title="Año"),
        y=alt.Y("Crecimiento_Anual_Pct:Q", title="Crecimiento Anual (%)"),
        # Colorear las barras: verde para crecimiento, rojo para decrecimiento
        color=alt.condition(
            alt.datum.Crecimiento_Anual_Pct > 0,
            alt.value("mediumseagreen"),  # Color para valores positivos
            alt.value("indianred")     # Color para valores negativos
        ),
        tooltip=["ANIO", alt.Tooltip("Crecimiento_Anual_Pct:Q", format=".2f")]
    ).properties(
        title="Tasa de Crecimiento Anual de la Valorización",
        width=700,
        height=400
    )

    mo.ui.altair_chart(bar_chart_crecimiento)
    return


@app.cell
def _():
    return


@app.cell
def _(alt, df_eficiencia_calculada, mo):
    # Gráfico para la Tasa de Valorización
    top_tasa_valorizacion = df_eficiencia_calculada.sort("Tasa_Valorizacion_Pct", descending=True).head(20)
    chart_tasa = alt.Chart(top_tasa_valorizacion).mark_bar().encode(
        x=alt.X("Tasa_Valorizacion_Pct:Q", title="Tasa de Valorización (%)"),
        y=alt.Y("DISTRITO:N", title="Distrito", sort="-x"),
        color=alt.Color("Tasa_Valorizacion_Pct:Q", scale=alt.Scale(scheme='tealblues'), legend=None),
        tooltip=[
            alt.Tooltip("DISTRITO", title="Distrito"),
            alt.Tooltip("Tasa_Valorizacion_Pct:Q", title="Tasa de Valorización", format=".2f"),
            alt.Tooltip("Total_Valorizado:Q", title="Total Valorizado (Ton)", format=","),
            alt.Tooltip("Total_Generado:Q", title="Total Generado (Ton)", format=","),
        ]
    ).properties(
        title="Top 20 Distritos por Tasa de Valorización (%)"
    )

    # Gráfico para la Valorización Per Cápita
    top_per_capita = df_eficiencia_calculada.sort("Valorizacion_Per_Capita_KG", descending=True).head(20)
    chart_per_capita = alt.Chart(top_per_capita).mark_bar().encode(
        x=alt.X("Valorizacion_Per_Capita_KG:Q", title="Valorización (kg por habitante)"),
        y=alt.Y("DISTRITO:N", title="Distrito", sort="-x"),
        color=alt.Color("Valorizacion_Per_Capita_KG:Q", scale=alt.Scale(scheme='oranges'), legend=None),
        tooltip=[
            alt.Tooltip("DISTRITO", title="Distrito"),
            alt.Tooltip("Valorizacion_Per_Capita_KG:Q", title="Valorización per Cápita (kg)", format=".2f"),
            alt.Tooltip("Total_Valorizado:Q", title="Total Valorizado (Ton)", format=","),
            alt.Tooltip("POB_TOTAL_INEI:Q", title="Población", format=","),
        ]
    ).properties(
        title="Top 20 Distritos por Valorización Per Cápita (kg/habitante)"
    )

    # Mostrar ambos gráficos en pestañas
    mo.tabs({
        "Tasa de Valorización (%)": chart_tasa,
        "Valorización Per Cápita (kg)": chart_per_capita
    })
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
