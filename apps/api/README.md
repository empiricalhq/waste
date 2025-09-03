# [pkg]: @lima-garbage/api

`better-auth` uses specific API paths. Using incorrect paths will result in 404 errors.

The base path `/api/auth` is configured in the Hono server. The library defines the endpoint segments.

| Action                 | Method | Endpoint                           |
| ---------------------- | ------ | ---------------------------------- |
| Login (Email/Pass)     | `POST` | `/api/auth/sign-in/email`          |
| Logout                 | `POST` | `/api/auth/sign-out`               |
| Sign Up (Email/Pass)   | `POST` | `/api/auth/sign-up/email`          |
| Change Password        | `POST` | `/api/auth/change-password`        |
| Get Session            | `GET`  | `/api/auth/get-session`            |
| Request Password Reset | `POST` | `/api/auth/request-password-reset` |

**To find a path, check the type definitions:**

1.  Open the type file: `node_modules/better-auth/dist/shared/better-auth.[hash].d.ts`
2.  Search for the method name (e.g., `signInEmail`, `signOut`).
