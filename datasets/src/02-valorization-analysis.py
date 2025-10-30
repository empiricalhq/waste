import marimo


__generated_with = "0.17.4"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"# Análisis de valorización de residuos sólidos orgánicos e inorgánicos")
    return


@app.cell
def _():
    import logging

    from pathlib import Path

    import data_utils as downloader
    import plotly.express as px
    import polars as pl

    PROJECT_ROOT = Path.cwd().parent
    DATA_DIR = PROJECT_ROOT / "data"

    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )
    return DATA_DIR, downloader, pl, px


@app.cell(hide_code=True)
def _(mo):
    mo.md("## Descarga de datasets de valorización")
    return


@app.cell
def _(DATA_DIR, downloader, mo):
    valorization_URL = "https://datosabiertos.gob.pe/dataset/valorizaci%C3%B3n-de-residuos-s%C3%B3lidos-nivel-distrital-ministerio-del-ambiente-minam"
    downloaded_files = downloader.download(valorization_URL, DATA_DIR)

    if downloaded_files:
        files_md = "Archivos descargados:\n" + "".join(
            f"- `{file.name}`\n" for file in downloaded_files
        )
        mo.md(files_md)
    else:
        mo.md("No se descargaron archivos nuevos. Pueden existir previamente.")

    valorization_org_path = next(
        (f for f in downloaded_files if "org" in f.name.lower()), None
    )
    valorization_inorg_path = next(
        (f for f in downloaded_files if "inorg" in f.name.lower()), None
    )
    return valorization_inorg_path, valorization_org_path


@app.cell(hide_code=True)
def _(mo):
    mo.md("## Carga y limpieza de datos")
    return


@app.cell
def _(valorization_inorg_path, valorization_org_path, mo, pl):
    if not valorization_org_path or not valorization_inorg_path:
        mo.md(
            "No se encontraron los archivos de datos. Verifique la descarga."
        ).center()
        valorization_org_raw, valorization_inorg_raw = None, None
    else:
        valorization_org_raw = pl.read_csv(
            valorization_org_path, separator=";", encoding="latin1"
        )
        valorization_inorg_raw = pl.read_csv(
            valorization_inorg_path, separator=";", encoding="latin1"
        )
        mo.md(
            f"- Orgánicos: {valorization_org_raw.shape[0]:,} filas cargadas.\n"
            f"- Inorgánicos: {valorization_inorg_raw.shape[0]:,} filas cargadas."
        )
    return valorization_inorg_raw, valorization_org_raw


@app.function
def normalize_cols(df):
    """Normaliza nombres de columnas a mayúsculas sin tildes ni espacios."""
    new_columns = {
        col: col.strip()
        .upper()
        .replace(" ", "_")
        .replace("Á", "A")
        .replace("É", "E")
        .replace("Í", "I")
        .replace("Ó", "O")
        .replace("Ú", "U")
        for col in df.columns
    }
    return df.rename(new_columns)


@app.cell
def _(valorization_inorg_raw, valorization_org_raw, pl):
    if valorization_org_raw is not None and valorization_inorg_raw is not None:
        valorization_org = normalize_cols(valorization_org_raw)
        valorization_inorg = normalize_cols(valorization_inorg_raw)
    else:
        valorization_org, valorization_inorg = None, None
    return valorization_inorg, valorization_org


@app.cell(hide_code=True)
def _(mo):
    mo.md("## Procesamiento y agregación")
    return


@app.cell
def _(valorization_inorg, valorization_org, pl):
    # Buscar dinámicamente las columnas de valorización
    valorization_org_col = next(
        (c for c in valorization_org.columns if "VALORIZADOS" in c.upper()), None
    )
    valorization_inorg_col = next(
        (c for c in valorization_inorg.columns if "VALORIZADOS" in c.upper()), None
    )

    def process_df(df, val_col, new_col_name):
        if df is None or not val_col:
            return None
        return (
            df.with_columns(
                pl.col(val_col)
                .cast(str)
                .str.replace_all(r"[^\d.]", "")
                .cast(pl.Float64, strict=False)
                .fill_null(0.0)
                .alias(new_col_name)
            )
            .group_by(["DEPARTAMENTO", "PROVINCIA", "DISTRITO"])
            .agg(pl.col(new_col_name).sum())
        )

    valorization_org_agg = process_df(valorization_org, valorization_org_col, "ORG_TON")
    valorization_inorg_agg = process_df(
        valorization_inorg, valorization_inorg_col, "INORG_TON"
    )

    return valorization_inorg_agg, valorization_org_agg


@app.cell
def _(valorization_inorg_agg, valorization_org_agg, pl):
    if valorization_org_agg is not None and valorization_inorg_agg is not None:
        valorization_total = valorization_org_agg.join(
            valorization_inorg_agg,
            on=["DEPARTAMENTO", "PROVINCIA", "DISTRITO"],
            how="outer",
        ).with_columns([pl.all().fill_null(0.0)])
        valorization_total = valorization_total.with_columns(
            (pl.col("ORG_TON") + pl.col("INORG_TON")).alias("TOTAL_TON")
        )
    else:
        valorization_total = None
    return (valorization_total,)


@app.cell(hide_code=True)
def _(mo):
    mo.md("## Visualización: Top 10 distritos por valorización total")
    return


@app.cell
def _(valorization_total, mo, pl, px):
    if valorization_total is not None:
        top10 = (
            valorization_total.sort("TOTAL_TON", descending=True)
            .head(10)
            .with_columns(
                pl.concat_str(
                    [
                        pl.col("DISTRITO"),
                        pl.lit(" ("),
                        pl.col("PROVINCIA"),
                        pl.lit(")"),
                    ]
                ).alias("ETIQUETA")
            )
        )

        fig = px.bar(
            top10.to_pandas(),
            x="ETIQUETA",
            y=["ORG_TON", "INORG_TON"],
            barmode="stack",
            text_auto=".2s",
            title="Top 10 distritos por toneladas totales valorizadas",
            labels={"value": "Toneladas", "variable": "Tipo de residuo"},
        )
        fig.update_layout(xaxis_title="Distrito", yaxis_title="Toneladas valorizadas")
        mo.ui.plotly(fig)
    return


if __name__ == "__main__":
    app.run()
