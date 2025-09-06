# [pkg]: @lima-garbage/api

> **Base URL**: `/api`\
> **Authentication**: session cookie obtained from `POST /auth/sign-in/email`.

You have to send the cookie on every protected call.

Errors:

- 401 – no or invalid session
- 403 – valid session, wrong role
- 400 – malformed body / params
- 404 – resource does not exist

## Endpoints

### /api/auth

Managed by `better-auth` library. All endpoints use `/api/auth` base path.

| Action                 | Method | Endpoint                           |
| ---------------------- | ------ | ---------------------------------- |
| Login (email/pass)     | `POST` | `/api/auth/sign-in/email`          |
| Logout                 | `POST` | `/api/auth/sign-out`               |
| Sign up (email/pass)   | `POST` | `/api/auth/sign-up/email`          |
| Change password        | `POST` | `/api/auth/change-password`        |
| Get session            | `GET`  | `/api/auth/get-session`            |
| Request password reset | `POST` | `/api/auth/request-password-reset` |

**Need a path that is not listed?** Open
`node_modules/better-auth/dist/shared/better-auth.*.d.ts` and grep the method
name (e.g. `signInEmail`).

### /api/admin

Requires admin or supervisor role.

**Drivers**:

- GET /admin/drivers - List all drivers
- POST /admin/drivers - Create a new driver

  Response:

  ```json
  {
    "name": "...",
    "email": "...",
    "password": "..."
  }
  ```

- PUT /admin/drivers/:id - Update driver details
- DELETE /admin/drivers/:id - Deactivate driver

**Trucks**:

- GET /admin/trucks - List all trucks with locations
- POST /admin/trucks

  Response:

  ```json
  {
    "name": "...",
    "license_plate": "..."
  }
  ```

- PUT /admin/trucks/:id - Update truck details
- DELETE /admin/trucks/:id - Remove truck

**Routes**:

- GET /admin/routes - List all routes
- POST /admin/routes - Create new route

  Response:

  ```json
  {
    "name": "...",
    "description": "...",
    "start_lat": "...",
    "start_lng": "...",
    "estimated_duration_minutes": "...",
    "waypoints": [
      {
        "lat": "...",
        "lng": "...",
        "sequence_order": "..."
      }
    ]
  }
  ```

- PUT /admin/routes/:id - Update route details
- DELETE /admin/routes/:id - Delete route
- GET /admin/routes/:id/waypoints - Get route waypoints

**Assignments**:

- GET /admin/assignments - List assignments (filterable)
- POST /admin/routes/assign - Assign route to driver/truck

  Response:

  ```json
  {
    "route_id": "...",
    "truck_id": "...",
    "driver_id": "...",
    "assigned_date": "YYYY-MM-DD"
  }
  ```

**Monitoring**:

- GET /admin/alerts - Get unread alerts
- GET /admin/issues - Get open issues
- POST /admin/dispatch/messages - Send message to driver

  Response:

  ```json
  {
    "recipient_id": "...",
    "content": "..."
  }
  ```

### /api/driver

Requires driver role.

**Route**:

- GET /driver/route/current - Get current/next route details
- POST /driver/assignments/:id/start - Start route
- POST /driver/assignments/:id/complete - Complete route
- POST /driver/assignments/:id/cancel - Cancel route

**Live operations**:

- POST /driver/location - Update location

  Response:

  ```json
  {"lat": ..., "lng": ..., "speed": ..., "heading": ...}
  ```

- POST /driver/issues - Report issue

  Response:

  ```json
  {"type": "road_blocked", "notes": "...", "lat": ..., "lng": ...}
  ```

- GET /driver/dispatch/messages - Get messages

### /api/citizen

Requires citizen role.

Core features:

- GET /citizen/truck/status - Get nearest truck status
- PUT /citizen/profile/location - Set home location

  Response:

  ```json
  {"lat": ..., "lng": ...}
  ```

**Engagement**:

- POST /citizen/push-token - Register push notifications

  Response:

  ```json
  {
    "token": "...",
    "device_type": "android"|"ios"
  }
  ```

- POST /citizen/issues - Report issue

  Response:

  ```json
  {
    "type": "illegal_dumping",
    "description": "...",
    "photo_url": "...",
    "lat": ...,
    "lng": ...
  }
  ```

- POST /citizen/education/progress - Save quiz results

  Response:

  ```json
  {
    "content_id": "plastics-quiz",
    "score": 8
  }
  ```

## Deno deploy

For a standard project:

```
Install command:  deno i
Build command:    -
Entrypoint:       src/index.ts
Args:             -
```

For a monorepo, install dependencies from the `apps/api` folder and copy them to
the root:

```
# ignore monorepo structure and copy to root
Install command:  mv package.json _package.json.bak && cp -r apps/api/* ./ && deno install
Build command:    -
Entrypoint:       apps/api/src/index.ts
Args:             -
```

Based on [.env.example](.env.example), set the required environment variables:
`DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`.
