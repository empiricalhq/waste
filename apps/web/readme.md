# Web dashboard

`apps/web` is the Next.js dashboard for staff users. It reads data through the
API from server components and server actions. The browser does not connect to
the API or database directly.

## Run locally

Copy [`env.example`](env.example) to the environment used by Next.js and set
`API_BASE_URL` to the API origin:

```sh
cp apps/web/env.example apps/web/.env.local
bun --filter @lima-garbage/web dev
```

The app runs on `http://localhost:3000` by default.

## Build

```sh
bun --filter @lima-garbage/web build
bun --filter @lima-garbage/web start
```

The Cloudflare Pages build uses [`build-pages.sh`](build-pages.sh). It removes
the root workspace manifest and lockfile before installing the Pages adapter.
Run it only in a throwaway checkout.

## Access control

The web app checks the user's role in the route proxy and in each server action.
The API repeats the check and remains the security boundary. Staff access uses
the active organization member role.
