import marimo

__generated_with = "0.15.2"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo
    import polars as pl
    import datetime as dt
    from pathlib import Path
    import altair as alt

    BASE_DIR = Path(__file__).resolve().parent.parent
    FILES_DIR = BASE_DIR / "files"

    path_df = []

    for csv_file in FILES_DIR.glob("*.csv"):
        if ' ' in csv_file.name:
            new_name = csv_file.name.replace(' ', '_')
            new_path = FILES_DIR / new_name
            csv_file.rename(new_path)
            path_df.append(new_path)
            print(path_df)
        else:
            path_df.append(csv_file)
            print(path_df)
 

    return alt, mo, path_df, pl


@app.cell
def _(path_df, pl):
    # Construye las rutas completas a los archivos CSV
    df1 = pl.read_csv(
        path_df[0], 
        encoding="latin1",
        separator=";",
        truncate_ragged_lines=True  # Trunca filas con columnas extra
    )

    df2 = pl.read_csv(
        path_df[1], 
        encoding="latin1",
        separator=";",
        truncate_ragged_lines=True
    )
    return df1, df2


@app.cell
def _(df1):
    df1.head()
    return


@app.cell
def _(df2):
    df2.head()
    return


@app.cell
def _(alt, df2, mo, pl):
    # Todo en Polars - más eficiente
    df_time2 = (df2
        .group_by('ANIO')
        .agg([
            pl.col('GENERACION_MUN_TANIO').sum().alias('Total_Toneladas'),
            pl.col('POB_TOTAL_INEI').sum().alias('Total_Poblacion')
        ])
        .with_columns(
            (pl.col('Total_Toneladas') * 1000 / pl.col('Total_Poblacion')).alias('KG_per_capita')
        )
        .sort('ANIO')
    )

    # Directo a altair sin conversión
    mo.ui.altair_chart(
        alt.Chart(df_time2).mark_line(
            point=True,
            strokeWidth=2,
            color='steelblue'
        ).encode(
            x=alt.X('ANIO:O', title='Año'),
            y=alt.Y('Total_Toneladas:Q', title='Toneladas'),
            tooltip=[
                'ANIO:O',
                'Total_Toneladas:Q', 
                'KG_per_capita:Q'
            ]
        ).properties(
            title='Evolución de Residuos (2000-2024)',
            width=700, height=350
        )
    )
    return


@app.cell
def _(alt, df2, mo, pl):
    año_actual = df2.select(pl.col('ANIO').max()).item()

    df_ranking = (df2
        .filter(pl.col('ANIO') == año_actual)
        .select(['DISTRITO', 'PROVINCIA', 'DEPARTAMENTO', 'GENERACION_MUN_TANIO'])
        .sort('GENERACION_MUN_TANIO', descending=True)
        .head(10)
        .with_columns(
            pl.concat_str([
                pl.col('DISTRITO'), 
                pl.lit(' ('), 
                pl.col('PROVINCIA'), 
                pl.lit(')')
            ]).alias('Municipio')
        )
    )

    # Con selección interactiva
    selection = alt.selection_single(on='mouseover', empty='all')

    mo.ui.altair_chart(
        alt.Chart(df_ranking).add_selection(
            selection
        ).mark_bar().encode(
            x=alt.X('GENERACION_MUN_TANIO:Q', title='Toneladas'),
            y=alt.Y('Municipio:N', sort='-x', title='Municipio'),
            color=alt.condition(
                selection,
                alt.Color('GENERACION_MUN_TANIO:Q', scale=alt.Scale(scheme='reds')),
                alt.value('lightgray')
            ),
            stroke=alt.condition(selection, alt.value('black'), alt.value('transparent')),
            strokeWidth=alt.condition(selection, alt.value(2), alt.value(0)),
            tooltip=['Municipio', 'GENERACION_MUN_TANIO', 'DEPARTAMENTO']
        ).properties(
            title=f'Top 10 Municipios ({año_actual}) - Hover para destacar',
            width=600, 
            height=400
        )
    )
    return


@app.cell
def _(df2, mo, pl):
    df_percapita = (df2
        .group_by('ANIO')
        .agg([
            pl.col('GENERACION_MUN_TANIO').sum().alias('Total_Toneladas'),
            pl.col('POB_TOTAL_INEI').sum().alias('Total_Poblacion')
        ])
        .with_columns(
            (pl.col('Total_Toneladas') * 1000 / pl.col('Total_Poblacion')).alias('KG_per_capita')
        )
        .sort('ANIO')
    )

    ultimo_valor = df_percapita.select(pl.col('KG_per_capita').last()).item()
    ultimo_año = df_percapita.select(pl.col('ANIO').last()).item()

    mo.md(f"## Generación per cápita ({ultimo_año}): {ultimo_valor:.1f} kg/persona/año")
    return


if __name__ == "__main__":
    app.run()
