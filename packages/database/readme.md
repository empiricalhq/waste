# [pkg]: @lima-garbage/database

Paquete para definición de esquemas, migraciones y conexión de base de datos
PostgreSQL usando Drizzle ORM y Supabase. Está diseñado exclusivamente para
desarrollo y pruebas.

El paquete gestiona la estructura base de datos del proyecto, incluyendo
autenticación de usuarios, gestión de rutas, seguimiento de vehículos y perfiles
ciudadanos. Utiliza ciertos componentes de
[better-auth](https://www.better-auth.com/docs/plugins/admin) para autenticación
y drizzle-kit para migraciones.

## Esquema

El esquema se define modularmente en [src/schema/](src/schema/) con punto de
entrada en index.ts que exporta definiciones y relaciones para su uso en otros
proyectos dentro del monorepo.

**Autenticación** ([auth.ts](src/schema/auth.ts)): Gestión de usuarios mediante
better-auth con extensiones personalizadas.

- user: Tabla principal con enum appRole personalizado
  (admin|supervisor|driver|citizen) para permisos a nivel aplicación. appRole y
  role son distintos, el segundo es para uso de better-auth.
- account, session, verification: Soporte OAuth, gestión de sesiones y tokens de
  verificación respectivamente.

**Vehículos** ([trucks.ts](src/schema/trucks.ts)): Para el seguimiento de
camiones recolectores.

- truck: Información estática (nombre, placa).
- truckCurrentLocation: Ubicación actual en tiempo real, diseñada para
  actualizaciones frecuentes. Esto debe ser actualizado desde
  [apps/trucks](../../apps/trucks).
- truckLocationHistory: Registro histórico para análisis y reproducción de
  rutas.

**Rutas** ([routes.ts](src/schema/routes.ts)): Es la estructura de rutas de
recolección.

- route: Definición principal con waypoints, ubicación inicial y estado.
  Referencias a createdBy y approvedBy del modelo user.
- routeWaypoint: Coordenadas geográficas ordenadas del trazado.
- routeSchedule: Programación recurrente (ej: lunes 08:00).
- routeAssignment: Núcleo operacional que vincula route, truck y driver para
  fecha específica, con seguimiento de estado de 'scheduled' a 'completed'. Es
  algo flexible y adaptable.

**Ciudadanos** ([citizens.ts](src/schema/citizens.ts)): Funcionalidades
orientadas al ciudadano.

- citizenProfile: Extensión de user para rol 'citizen' con datos de ubicación y
  preferencias.
- userEducationProgress: Seguimiento de progreso en contenido educativo.

---

Las relaciones entre tables están definidas en [index.ts](src/schema/index.ts).
Se usan el helper relations de Drizzle para consultas relacionales tipadas.

## Variables de entorno

Configuración requerida en .env en el directorio raíz (ver
[.env.example](../../.env.example)):

```
DATABASE_URL=<postgresql_connection_string>
SUPABASE_URL=<supabase_project_url>
SUPABASE_ANON_KEY=<supabase_public_anon_key>
BETTER_AUTH_SECRET=<token_signing_secret>
```

## Gestión de esquema

Ejecuta los comandos desde dentro de `packages/database/`. No uses
`bun --filter @lima-garbage/database`, porque los scripts interactivos (via
@clack/prompts o drizzle-kit) como `setup:admin` no reciben entrada estándar
correctamente. Es un problema conocido de `bun`.

Entra al directorio y ejecuta por ejemplo (¡todavía no lo hagas!):

```sh
bun run setup:admin
```

Y así funciona.

### Migraciones

`drizzle-kit migrate` falla al crear `ENUM` ya existentes con el error
`type "xxx" already exists`. Es un bug conocido y no tiene solución disponible;
solo ocurre en migraciones, ya que `db:push` funciona pero no se usa en
producción.

El único workaround sería envolver cada `CREATE TYPE` en un bloque
`DO $$ ... EXCEPTION`, lo cual es manual e impracticable.

Un miembro del equipo de Drizzle ha confirmado que lo corregirán en la versión
`1.0.0`, prevista en dos semanas (ver este
[comentario](https://github.com/drizzle-team/drizzle-orm/issues/3206#issuecomment-3239448359)).
Hasta entonces no existen migraciones seguras, por lo que generamos el esquema
con `db:generate` y aplicamos los cambios manualmente o con `db:push` en
desarrollo, en espera de revisar la situación antes del primer release alfa.

---

Comandos adicionales:

`bun run db:push`: Sincronización directa esquema-base de datos, omitiendo
sistema de migraciones. Solo desarrollo local.

### Configuración inicial

`bun run setup:admin`: Script interactivo crítico para creación del primer
usuario admin. Solicita nombre, email y contraseña.

Falla si admin existe. Al completarse exitosamente, imprime variables de entorno
(SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD) para agregar a .env en el directorio
raiz, usadas por tests automatizados de API.

`bun run db:seed`: Ejecuta seed.ts para poblar la base de datos con datos
iniciales/prueba. Ver scripts/seed.ts](scripts/seed.ts) para modificaciones.
