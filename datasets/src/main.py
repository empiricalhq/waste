import marimo

__generated_with = "0.15.2"
app = marimo.App()


@app.cell
def _():
    import marimo as mo
    import polars as pl
    import datetime as dt

    df = pl.DataFrame(
        {
            "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
            "birthdate": [
                dt.date(1997, 1, 10),
                dt.date(1985, 2, 15),
                dt.date(1983, 3, 22),
                dt.date(1981, 4, 30),
            ],
            "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
            "height": [1.56, 1.77, 1.65, 1.75],  # (m)
        }
    )

    print(df)
    return (df,)


@app.cell
def _(df):
    df['weight'].sum()
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
