# [pkg]: @lima-garbage/api

`better-auth` uses specific API paths. Using incorrect paths will result in 404
errors.

The base path `/api/auth` is configured in the Hono server. The library defines
the endpoint segments.

| Action                 | Method | Endpoint                           |
| ---------------------- | ------ | ---------------------------------- |
| Login (email/pass)     | `POST` | `/api/auth/sign-in/email`          |
| Logout                 | `POST` | `/api/auth/sign-out`               |
| Sign up (email/pass)   | `POST` | `/api/auth/sign-up/email`          |
| Change password        | `POST` | `/api/auth/change-password`        |
| Get session            | `GET`  | `/api/auth/get-session`            |
| Request password reset | `POST` | `/api/auth/request-password-reset` |

**To find a path, check the type definitions:**

1.  Open the type file:
    `node_modules/better-auth/dist/shared/better-auth.[hash].d.ts`
2.  Search for the method name (e.g., `signInEmail`, `signOut`).

## Deno deploy

Use this configuration:

```
Install command:  deno i
Build command:    -
Entrypoint:       src/index.ts
Args:             -
```

Based on [.env.example](.env.example), set the required environment variables:
`DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`.
