# [pkg]: @lima-garbage/api

> **Base URL**: `/api`\
> **Authentication**: session cookie obtained from `POST /auth/sign-in/email`\
> **Authorization**: role-based access control via organization membership

Send the cookie with every protected call.

The API supports two types of roles:

- Organization members (owner, admin, supervisor, driver) are staff users with
  an organization membership
- Citizens are public users without organization membership

## Error codes

- 401 (unauthorized) – no valid session or invalid credentials
- 403 (forbidden) – valid session but wrong role or no active organization
- 400 (bad request) – malformed body or parameters
- 404 (not found) – resource does not exist

## Endpoints

### `/api/auth`

Managed by the `better-auth` library with the organization plugin. Base path:
`/api/auth`

Authentication operations:

| Method | Endpoint                           | Description                  | Request body |
| ------ | ---------------------------------- | ---------------------------- | ------------ |
| `POST` | `/api/auth/sign-in/email`          | Login with email/password    | -            |
| `POST` | `/api/auth/sign-out`               | Logout user                  | -            |
| `POST` | `/api/auth/sign-up/email`          | Register with email/password | -            |
| `POST` | `/api/auth/change-password`        | Change user password         | -            |
| `GET`  | `/api/auth/get-session`            | Get current session          | -            |
| `POST` | `/api/auth/request-password-reset` | Request password reset       | -            |

Organization management (for staff members):

| Method | Endpoint                                        | Description                           | Request body                |
| ------ | ----------------------------------------------- | ------------------------------------- | --------------------------- |
| `GET`  | `/api/auth/organization/list`                   | List user's organizations             | -                           |
| `GET`  | `/api/auth/organization/get-full-organization`  | Get organization details with members | -                           |
| `POST` | `/api/auth/organization/set-active`             | Set active organization               | `{ organizationId: "..." }` |
| `GET`  | `/api/auth/organization/get-active-member`      | Get current member details            | -                           |
| `GET`  | `/api/auth/organization/get-active-member-role` | Get current member role               | -                           |

<!-- prettier-ignore-start -->
> [!TIP]
> Need a path that’s not listed? Check
> `node_modules/better-auth/dist/shared/better-auth.*.d.ts` and grep the method
> name (e.g. `signInEmail`).
<!-- prettier-ignore-end -->

### `/api/admin`

Requires organization membership with owner, admin, or supervisor role.

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

<!-- prettier-ignore-start -->
| Method   | Endpoint                          | Description          | Request body            |
| -------- | --------------------------------- | -------------------- | ----------------------- |
| `GET`    | `/api/admin/routes`               | List all routes      | -                       |
| `POST`   | `/api/admin/routes`               | Create new route     | <pre lang="json">{&#13;  "name": "...",&#13;  "description": "...",&#13;  "start_lat": "...",&#13;  "start_lng": "...",&#13;  "estimated_duration_minutes": "...",&#13;  "waypoints": [&#13;    {&#13;      "lat": "...",&#13;      "lng": "...",&#13;      "sequence_order": "..."&#13;    }&#13;  ]&#13;}</pre> |
| `PUT`    | `/api/admin/routes/:id`           | Update route details | -                       |
| `DELETE` | `/api/admin/routes/:id`           | Delete route         | -                       |
| `GET`    | `/api/admin/routes/:id/waypoints` | Get route waypoints  | -                       |
<!-- prettier-ignore-end -->

**Assignments**:

<!-- prettier-ignore-start -->
| Method | Endpoint                   | Description                   | Request body            |
| ------ | -------------------------- | ----------------------------- | ----------------------- |
| `GET`  | `/api/admin/assignments`   | List assignments (filterable) | -                       |
| `POST` | `/api/admin/routes/assign` | Assign route to driver/truck  | <pre lang="json">{&#13;  "route_id": "...",&#13;  "truck_id": "...",&#13;  "driver_id": "...",&#13;  "assigned_date": "..."&#13;}</pre> |
<!-- prettier-ignore-end -->

The `assigned_date` format is `YYYY-MM-DD`.

**Monitoring**:

| Method | Endpoint                       | Description            | Request body                                                                     |
| ------ | ------------------------------ | ---------------------- | -------------------------------------------------------------------------------- |
| `GET`  | `/api/admin/alerts`            | Get unread alerts      | -                                                                                |
| `GET`  | `/api/admin/issues`            | Get open issues        | -                                                                                |
| `POST` | `/api/admin/dispatch/messages` | Send message to driver | <pre lang="json">{&#13; "recipient_id": "...",&#13; "content": "..."&#13;}</pre> |

### `/api/driver`

Requires organization membership with driver role.

**Routes**:

| Method | Endpoint                               | Description                        | Request body |
| ------ | -------------------------------------- | ---------------------------------- | ------------ |
| `GET`  | `/api/driver/route/current`            | Get current or next route details  | -            |
| `POST` | `/api/driver/assignments/:id/start`    | Mark assigned route as active      | -            |
| `POST` | `/api/driver/assignments/:id/complete` | Mark the active route as completed | -            |
| `POST` | `/api/driver/assignments/:id/cancel`   | Mark the active route as cancelled | -            |

**Live operations**:

<!-- prettier-ignore-start -->
| Method | Endpoint                        | Description     | Request body            |
| ------ | ------------------------------- | --------------- | ----------------------- |
| `POST` | `/api/driver/location`          | Update location | <pre lang="json">{&#13; "lat": "...",&#13; "lng": "...",&#13; "speed": "...",&#13; "heading": "..."&#13;}</pre> |
| `POST` | `/api/driver/issues`            | Report issue    | <pre lang="json">{&#13; "type": "road_blocked",&#13; "notes": "...",&#13; "lat": "...",&#13; "lng": "..."&#13;}</pre> |
| `GET`  | `/api/driver/dispatch/messages` | Get messages    | -                       |
<!-- prettier-ignore-end -->

### `/api/citizen`

Accessible only by authenticated users without organization membership.

**Core features**:

| Method | Endpoint                        | Description              | Request body                                                        |
| ------ | ------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| `GET`  | `/api/citizen/truck/status`     | Get nearest truck status | -                                                                   |
| `PUT`  | `/api/citizen/profile/location` | Set home location        | <pre lang="json">{&#13; "lat": "...",&#13; "lng": "..."&#13;}</pre> |

**Engagement**:

<!-- prettier-ignore-start -->
| Method | Endpoint                          | Description                 | Request Body            |
| ------ | --------------------------------- | --------------------------- | ----------------------- |
| `POST` | `/api/citizen/push-token`         | Register push notifications | <pre lang="json">{&#13; "token": "...",&#13; "device_type": "android\|ios"&#13;}</pre> |
| `POST` | `/api/citizen/issues`             | Report issue                | <pre lang="json">{&#13; "type": "illegal_dumping",&#13; "description": "...",&#13; "photo_url": "...",&#13; "lat": "...",&#13; "lng": "..."&#13;}</pre> |
| `POST` | `/api/citizen/education/progress` | Save quiz results           | <pre lang="json">{&#13; "content_id": "plastics-quiz",&#13; "score": "..."&#13;}</pre> |
<!-- prettier-ignore-end -->

## Deno deploy

For a standard project:

```txt
Install command:  deno i
Build command:    -
Entrypoint:       src/index.ts
Args:             -
```

For a monorepo, install dependencies from the `apps/api` folder and copy them to
the root:

```txt
# Ignore monorepo structure and copy to root
Install command:  mv package.json _package.json.bak && cp -r apps/api/* ./ && deno install
Build command:    -
Entrypoint:       apps/api/src/index.ts
Args:             -
```

Set the required environment variables [.env.example](../../.env.example):
`DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`.
