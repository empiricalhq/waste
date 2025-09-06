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

### `/api/auth`

Managed by `better-auth` library. Base path: `/api/auth`

| Method | Endpoint                           | Description                  | Request body |
| ------ | ---------------------------------- | ---------------------------- | ------------ |
| `POST` | `/api/auth/sign-in/email`          | Login with email/password    | -            |
| `POST` | `/api/auth/sign-out`               | Logout user                  | -            |
| `POST` | `/api/auth/sign-up/email`          | Register with email/password | -            |
| `POST` | `/api/auth/change-password`        | Change user password         | -            |
| `GET`  | `/api/auth/get-session`            | Get current session          | -            |
| `POST` | `/api/auth/request-password-reset` | Request password reset       | -            |

<!-- prettier-ignore-start -->
> [!TIP]
> Need a path that’s not listed? Check
> `node_modules/better-auth/dist/shared/better-auth.*.d.ts` and grep the method
> name (e.g. `signInEmail`).
<!-- prettier-ignore-end -->

### /api/admin

Requires admin or supervisor role.

**Drivers**:

| Method   | Endpoint                 | Description           | Request body                                                                                   |
| -------- | ------------------------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| `GET`    | `/api/admin/drivers`     | List all drivers      | -                                                                                              |
| `POST`   | `/api/admin/drivers`     | Create a new driver   | <pre lang="json">{&#13; "name": "...",&#13; "email": "...",&#13; "password": "..."&#13;}</pre> |
| `PUT`    | `/api/admin/drivers/:id` | Update driver details | -                                                                                              |
| `DELETE` | `/api/admin/drivers/:id` | Deactivate driver     | -                                                                                              |

**Trucks**:

| Method   | Endpoint                | Description                    | Request body                                                                   |
| -------- | ----------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `GET`    | `/api/admin/trucks`     | List all trucks with locations | -                                                                              |
| `POST`   | `/api/admin/trucks`     | Create a new truck             | <pre lang="json">{&#13; "name": "...",&#13; "license_plate": "..."&#13;}</pre> |
| `PUT`    | `/api/admin/trucks/:id` | Update truck details           | -                                                                              |
| `DELETE` | `/api/admin/trucks/:id` | Remove truck                   | -                                                                              |

**Routes**:

| Method   | Endpoint                      | Description          | Request body | Response                                                                                                                                                                                                               |
| -------- | ----------------------------- | -------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/admin/routes`               | List all routes      | —            | <pre lang="json">{ "name": "...", "description": "...", "start_lat": "...", "start_lng": "...", "estimated_duration_minutes": "...", "waypoints": \[ { "lat": "...", "lng": "...", "sequence_order": "..." } ] }</pre> |
| `POST`   | `/admin/routes`               | Create new route     | —            | same as above                                                                                                                                                                                                          |
| `PUT`    | `/admin/routes/:id`           | Update route details | —            | —                                                                                                                                                                                                                      |
| `DELETE` | `/admin/routes/:id`           | Delete route         | —            | —                                                                                                                                                                                                                      |
| `GET`    | `/admin/routes/:id/waypoints` | Get route waypoints  | —            | —                                                                                                                                                                                                                      |

**Assignments**:

| Method | Endpoint               | Description                   | Request body                                                                                           | Response |
| ------ | ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| `GET`  | `/admin/assignments`   | List assignments (filterable) | —                                                                                                      | —        |
| `POST` | `/admin/routes/assign` | Assign route to driver/truck  | <pre lang="json">{ "route_id": 1, "truck_id": 2, "driver_id": 3, "assigned_date": "2025-09-06" }</pre> | —        |

Note: `assigned_date` format = `YYYY-MM-DD`.

**Monitoring**:

| Method | Endpoint                   | Description         | Request body                                                   | Response |
| ------ | -------------------------- | ------------------- | -------------------------------------------------------------- | -------- |
| `GET`  | `/admin/alerts`            | Get unread alerts   | —                                                              | —        |
| `GET`  | `/admin/issues`            | Get open issues     | —                                                              | —        |
| `POST` | `/admin/dispatch/messages` | Send message driver | <pre lang="json">{ "recipient_id": 1, "content": "..." }</pre> | —        |

### /api/driver

Requires **driver** role.

#### Routes

| Method | Endpoint                           | Description       | Request body | Response |
| ------ | ---------------------------------- | ----------------- | ------------ | -------- |
| `GET`  | `/driver/route/current`            | Get current route | —            | —        |
| `POST` | `/driver/assignments/:id/start`    | Start route       | —            | —        |
| `POST` | `/driver/assignments/:id/complete` | Complete route    | —            | —        |
| `POST` | `/driver/assignments/:id/cancel`   | Cancel route      | —            | —        |

#### Live operations

| Method | Endpoint                    | Description     | Request body | Response                                                                              |
| ------ | --------------------------- | --------------- | ------------ | ------------------------------------------------------------------------------------- |
| `POST` | `/driver/location`          | Update location | —            | <pre lang="json">{ "lat": 0, "lng": 0, "speed": 0, "heading": 0 }</pre>               |
| `POST` | `/driver/issues`            | Report issue    | —            | <pre lang="json">{ "type": "road_blocked", "notes": "...", "lat": 0, "lng": 0 }</pre> |
| `GET`  | `/driver/dispatch/messages` | Get messages    | —            | —                                                                                     |

---

### `/api/citizen`

Requires **citizen** role.

#### Core features

| Method | Endpoint                    | Description       | Request body                                  | Response |
| ------ | --------------------------- | ----------------- | --------------------------------------------- | -------- |
| `GET`  | `/citizen/truck/status`     | Get nearest truck | —                                             | —        |
| `PUT`  | `/citizen/profile/location` | Set home location | <pre lang="json">{ "lat": 0, "lng": 0 }</pre> | —        |

#### Engagement

| Method | Endpoint                      | Description                 | Request body | Response                                                                                                           |
| ------ | ----------------------------- | --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `POST` | `/citizen/push-token`         | Register push notifications | —            | <pre lang="json">{ "token": "...", "device_type": "android" }</pre>                                                |
| `POST` | `/citizen/issues`             | Report issue                | —            | <pre lang="json">{ "type": "illegal_dumping", "description": "...", "photo_url": "...", "lat": 0, "lng": 0 }</pre> |
| `POST` | `/citizen/education/progress` | Save quiz results           | —            | <pre lang="json">{ "content_id": "plastics-quiz", "score": 8 }</pre>                                               |

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
