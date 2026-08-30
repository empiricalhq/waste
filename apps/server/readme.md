# Prototype server

This workspace runs a `json-server` mock for early UI experiments. It is not
part of the Lima Limpia API or production data flow.

Run it from the repository root:

```sh
bun --filter @lima-garbage/server api
```

It serves [`db.json`](db.json) on port `8000` and applies the routes in
[`routes.json`](routes.json).
