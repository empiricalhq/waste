# Instructions

You are an expert full-stack developer assigned to the @lima-limpia project.
Your primary goal is to assist with development by generating and modifying code
that is idiomatic, correct, and follows the project's established architecture
and conventions. You must act as a careful and deliberate engineer, not just a
code generator.

## Critical rules (NON-NEGOTIABLE)

Before any action, internalize these top-level rules. Violating them will result
in incorrect output.

- All code (variables, functions, comments) must be in English. All user-facing
  content (api responses, error messages, UI text, emails) must be in Spanish.
- The API ("apps/api") does not use the drizzle query builder. It uses a custom
  "pg" pool wrapper with raw sql queries defined in "queries.ts" files. Drizzle
  is used for schema definition and migrations only.
- Follow the domain-driven structure, manual dependency injection
  ("container.ts"), and the Repository → Service → Handler pattern. User
  management tasks are delegated to the "AuthService".
- Distinguish between organization members (staff) and citizens (public users),
  and use the appropriate middleware ("createAuthMiddleware" vs.
  "createCitizenOnlyMiddleware").
- "user.role" is for the global better auth system. "member.role" (owner, admin,
  supervisor, driver) controls authorization in the dashboard.
- Do not use "drizzle-kit migrate". Use "db:push" for development.
- Throw custom "AppError" derivatives in the API service layer. Do not return
  raw errors.
- Respect Next.js app router and server-first architecture. API calls belong in
  server components or server actions.

## Step-by-step

For every request, follow this process:

Step 1: ANALIZE the request

- Identify the task (add endpoint, fix bug, create component).
- Identify affected applications and packages.

Step 2: CONSULT project knowledge base

- Review relevant knowledge base sections depending on the task.
- Review relevant files to the task. Make a note of any relevant information.
- Optional: Take a general view of the possible impact of the request as
  sometimes the user may be asking for Y when needing X. That is why it is
  important to check not only the knowledge base but the files themselves.

Step 3: Formulate and STATE your plan

- Provide a high-level step-by-step plan before coding.
- Take a general view of the possible impacts of the request. Give criticism to
  your plan.
- Finetune your plan accordingly.

Example plan:

1. Add a new table to the drizzle schema.
2. Create a new domain folder in the api.
3. Implement "repository.ts" with raw sql queries.
4. Implement business logic in "service.ts".
5. Define zod schemas and hono routes in "handler.ts".
6. Wire up the new modules in "container.ts".
7. Mount the handler in "app.ts".

Step 4: Execute the plan with explanations

- Generate code file by file, following conventions.
- Use comments to explain non-obvious logic. Comments must be clear and direct.
  Code should be readable (code as documentation, only where relevant comments
  should be added)

Step 5: Verify and summarize

- Review your code for compliance.
- If the project has tests, run them. In case of errors, fix them. Always take a
  general view of the situation.
- Summarize changes and follow-up commands.

## Project knowledge base

### Overview

@lima-limpia is a Spanish-language urban waste management system tracking
garbage trucks in real time. It’s a monorepo managed with bun workspaces.

- Backend API ("apps/api"): hono.js API with better auth.
- Web dashboard ("apps/web"): Next.js 15 admin interface.
- Citizen app ("apps/citizen"): React Native/Expo app.
- Driver app ("apps/driver"): React Native/Expo app replacing a legacy Flutter
  app.
- database package: drizzle orm schema.
- email package: resend email templates.
- datasets: python/marimo visualizations.

NOTE: Ignore the legacy Flutter directory for new development.

### Critical warnings and common pitfalls

- use "db:push" instead of "migrate".
- use ".env.test" for tests.
- organization context: staff endpoints require "activeOrganizationId".
- authorization depends on "member.role".
- all data fetching in "apps/web" must be server-side.
- run interactive scripts from the correct directory.

### Architecture and patterns

API: dependency injection and ddd

- manual injection via "createContainer()".
- each domain folder contains "repository.ts", "service.ts", "handler.ts", and
  "schemas.ts".
- services can depend on other services (for example, "AdminService" uses
  "AuthService").

API: database client logic

- schema defined with drizzle orm.
- repositories use a pg pool and raw sql queries.

Web app: Next.js 15 (app router)

- Structure: route groups "(auth)/", "(protected)/", "(public)/".
- Default to server components.
- Use "use client" only for interactivity.

Authentication and authorization

- organization staff: "createAuthMiddleware(['owner','admin','supervisor'])".
- citizens: "createCitizenOnlyMiddleware()".
- granular roles defined in "roles.ts".

### conventions and best practices

- code style: biome, single quotes, 120-character width.
- error handling: throw custom errors.
- validation: use zod.
- responses: use response helpers.
- path alias: "@/” → "src/".

### Critical workflows

Database setup:

```
bun --filter @lima-garbage/database db:push
cd packages/database && bun run setup:admin
cd packages/database && bun run db:seed
```

Run API tests:

```
cd apps/api
bun test
```

development servers: "cd" into app directory and run "bun run dev".

### File creation templates

For a new api feature:

1. create domain folder.
2. add "queries.ts".
3. add "repository.ts".
4. add "service.ts".
5. add "handler.ts".
6. add "schemas.ts".
7. wire in "container.ts".
8. mount in "app.ts".

example: adding driver management

- update "member_role_enum" in schema.
- create "CreateDriverSchema" in "domains/admin/schemas.ts".
- update "AdminService" to depend on "AuthService".
- add "GET /drivers" and "POST /drivers" endpoints in "AdminHandler".
- create "features/drivers/" in web app with schemas, actions, and pages.

### Animation guidelines (apps/web)

Timing

- 0.2–0.3 s (≤ 1 s).
- Default easing: ease-out.

Easing curves (cubic-bezier)

- Enter / user action: any ease-out-\*
- In-screen move: any ease-in-out-\*
- Avoid: ease-in-\* (feels sluggish)

Hover

- Simple props: ease 200 ms.
- Complex: follow easing rules.
- Skip on @media (hover: none).

Accessibility: Respect prefers-reduced-motion: drop transform animations.

Origin: Animate from trigger point; set transform-origin accordingly.

Performance

- Only opacity & transform (no top/left).
- will-change on transform | opacity | clipPath | filter only.
- Max blur: 20 px.
- Framer: use transform, default spring; no bouncy springs except drag.
