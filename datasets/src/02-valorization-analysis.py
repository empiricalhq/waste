import marimo

__generated_with = "0.17.4"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""# Análisis de valorización de residuos sólidos orgánicos e inorgánicos"""
    )
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
    mo.md("""## Descarga de datasets de valorización""")
    return


@app.cell
def _(DATA_DIR, downloader, mo):
    # This single page contains links to both organic and inorganic CSVs
    URL = "https://datosabiertos.gob.pe/dataset/valorizaci%C3%B3n-de-residuos-s%C3%B3lidos-nivel-distrital-ministerio-del-ambiente-minam"
    downloaded_files = downloader.download(URL, DATA_DIR)

    if downloaded_files:
        files_md = "Archivos descargados:\n" + "".join(
            f"- `{file.name}`\n" for file in downloaded_files
        )
        mo.md(files_md)
    else:
        mo.md("No se descargaron archivos nuevos. Pueden existir previamente.")

    PATH_ORG = next((f for f in downloaded_files if "org" in f.name.lower()), None)
    PATH_INORG = next((f for f in downloaded_files if "inorg" in f.name.lower()), None)
    return PATH_INORG, PATH_ORG


@app.cell(hide_code=True)
def _(mo):
    mo.md("""## Carga y limpieza de datos""")
    return


@app.cell
def _(PATH_INORG, PATH_ORG, mo, pl):
    if not PATH_ORG or not PATH_INORG:
        mo.md(
            "No se encontraron los archivos de datos. Verifique la descarga."
        ).center()
        df_org_raw, df_inorg_raw = None, None
    else:
        df_org_raw = pl.read_csv(PATH_ORG, separator=";", encoding="latin1")
        df_inorg_raw = pl.read_csv(PATH_INORG, separator=";", encoding="latin1")
        mo.md(
            f"""
        - Orgánicos: {df_org_raw.shape[0]:,} filas cargadas.
        - Inorgánicos: {df_inorg_raw.shape[0]:,} filas cargadas.
        """
        )
    return df_inorg_raw, df_org_raw


@app.function
# Helper function to normalize column names for consistency
def normalize_cols(df):
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
def _(df_inorg_raw, df_org_raw):
    if df_org_raw is not None and df_inorg_raw is not None:
        df_org = normalize_cols(df_org_raw)
        df_inorg = normalize_cols(df_inorg_raw)
    else:
        df_org, df_inorg = None, None
    return df_inorg, df_org


@app.cell(hide_code=True)
def _(mo):
    mo.md("""## Procesamiento y agregación""")
    return


@app.cell
def _(df_inorg, df_org, pl):
    # Dynamically find the valorization columns, which can have inconsistent names
    col_val_org = next((c for c in df_org.columns if "VALORIZADOS" in c), None)
    col_val_inorg = next((c for c in df_inorg.columns if "VALORIZADOS" in c), None)

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

    org_agg = process_df(df_org, col_val_org, "ORG_TON")
    inorg_agg = process_df(df_inorg, col_val_inorg, "INORG_TON")
    return inorg_agg, org_agg


@app.cell
def _(inorg_agg, org_agg, pl):
    if org_agg is not None and inorg_agg is not None:
        df_total = org_agg.join(
            inorg_agg, on=["DEPARTAMENTO", "PROVINCIA", "DISTRITO"], how="outer"
        ).with_columns([pl.all().fill_null(0.0)])
        df_total = df_total.with_columns(
            (pl.col("ORG_TON") + pl.col("INORG_TON")).alias("TOTAL_TON")
        )
    else:
        df_total = None
    return (df_total,)


@app.cell
def _(mo):
    mo.md("""## Visualización: Top 10 distritos por valorización total""")
    return


@app.cell
def _(df_total, mo, pl, px):
    if df_total is not None:
        top10 = (
            df_total.sort("TOTAL_TON", descending=True)
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
