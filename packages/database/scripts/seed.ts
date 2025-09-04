import * as p from '@clack/prompts';
import { Pool } from 'pg';
import { betterAuth, type APIError } from 'better-auth';
import { admin } from 'better-auth/plugins';
import color from 'picocolors';
import { createId } from '@paralleldrive/cuid2';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Make sure it is set in your .env file.');
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required in your .env file.');
}

if (!process.env.SYSTEM_ADMIN_EMAIL || !process.env.SYSTEM_ADMIN_PASSWORD) {
  throw new Error(
    'SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD are required in your .env file. Make sure you have run `bun setup:admin` first.'
  );
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api',
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      appRole: {
        type: ['admin', 'supervisor', 'driver', 'citizen'],
        required: true,
        defaultValue: 'citizen',
      },
    },
  },
  telemetry: { enabled: false },
  plugins: [
    admin({
      adminRoles: ['admin'],
    }),
  ],
});

async function main() {
  p.intro(color.inverse(' @lima-garbage/database: añadir sample data '));

  const s = p.spinner();

  try {
    s.start('Iniciando sesión como administrador del sistema...');
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email: process.env.SYSTEM_ADMIN_EMAIL!,
        password: process.env.SYSTEM_ADMIN_PASSWORD!,
      },
    });
    const sessionToken = headers.get('set-cookie');
    s.stop();

    if (!sessionToken) {
      throw new Error('No se pudo obtener el token de sesión. Verifica las credenciales del administrador en tu .env');
    }
    p.log.success('Sesión de administrador iniciada correctamente.');

    s.start('Creando usuarios de prueba...');
    const usersToCreate = [
      {
        email: 'supervisor@example.com',
        name: 'Juan Díaz',
        appRole: 'supervisor',
      },
      {
        email: 'driver@example.com',
        name: 'Luis Martínez',
        appRole: 'driver',
      },
      {
        email: 'citizen@example.com',
        name: 'María Pérez',
        appRole: 'citizen',
      },
    ];

    const createdUsers = new Map<string, any>();

    for (const userData of usersToCreate) {
      try {
        const { rows } = await db.query('SELECT * FROM "user" WHERE email = $1', [userData.email]);
        if (rows.length > 0) {
          p.log.info(`Usuario ${userData.email} ya existe.`);
          createdUsers.set(userData.appRole, rows[0]);
          continue;
        }

        const newUser = await auth.api.createUser({
          body: {
            email: userData.email,
            password: 'password123',
            name: userData.name,
            role: 'user',
            data: {
              appRole: userData.appRole,
            },
          },
          headers: {
            Cookie: sessionToken,
          },
        });
        createdUsers.set(userData.appRole, newUser);
        p.log.success(`Usuario ${userData.email} creado.`);
      } catch (error) {
        p.log.error(`Error al crear el usuario ${userData.email}`);
        const apiError = error as APIError;
        if (apiError.status) {
          console.error(`Status: ${apiError.status}, Body: ${JSON.stringify(apiError.body)}`);
        } else {
          console.error(error);
        }
      }
    }
    s.stop('Creación de usuarios completada.');

    if (createdUsers.size === 0) {
      throw new Error('No se crearon ni encontraron usuarios de prueba. El script no puede continuar.');
    }

    const supervisor = createdUsers.get('supervisor');
    const driver = createdUsers.get('driver');

    if (!supervisor || !driver) {
      p.log.warn('No se encontraron los usuarios supervisor o driver, se omitirá la creación de datos relacionados.');
    } else {
      s.start('Creando camiones de prueba...');
      const { rows: existingTrucks } = await db.query(
        "SELECT license_plate FROM truck WHERE license_plate = 'ABC-123'"
      );
      let truckId;
      if (existingTrucks.length > 0) {
        p.log.info('Camión de prueba ya existe.');
        const { rows } = await db.query("SELECT id FROM truck WHERE license_plate = 'ABC-123'");
        truckId = rows[0].id;
      } else {
        truckId = createId();
        await db.query("INSERT INTO truck (id, name, license_plate) VALUES ($1, 'Camión 01', 'ABC-123')", [truckId]);
        p.log.success('Camión de prueba creado.');
      }
      s.stop();

      s.start('Creando rutas de prueba...');
      const { rows: existingRoutes } = await db.query("SELECT name FROM route WHERE name = 'Ruta Centro'");
      let routeId;
      if (existingRoutes.length > 0) {
        p.log.info('Ruta de prueba ya existe.');
        const { rows } = await db.query("SELECT id FROM route WHERE name = 'Ruta Centro'");
        routeId = rows[0].id;
      } else {
        routeId = createId();
        await db.query(
          "INSERT INTO route (id, name, start_lat, start_lng, estimated_duration_minutes, created_by) VALUES ($1, 'Ruta Centro', -12.046374, -77.042793, 120, $2)",
          [routeId, supervisor.id]
        );
        p.log.success('Ruta de prueba creada.');
      }
      s.stop();

      s.start('Creando asignaciones de ruta...');
      const today = new Date().toISOString().split('T')[0];
      const { rows: existingAssignments } = await db.query(
        'SELECT id FROM route_assignment WHERE truck_id = $1 AND assigned_date = $2',
        [truckId, today]
      );
      if (existingAssignments.length > 0) {
        p.log.info('La asignación de hoy ya existe.');
      } else {
        const assignmentId = createId();
        const startTime = new Date();
        startTime.setHours(8, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + 120 * 60000); // 120 minutes later
        await db.query(
          'INSERT INTO route_assignment (id, route_id, truck_id, driver_id, assigned_date, scheduled_start_time, scheduled_end_time, assigned_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [assignmentId, routeId, truckId, driver.id, today, startTime, endTime, supervisor.id]
        );
        p.log.success('Asignación de ruta creada.');
      }
      s.stop();
    }

    p.outro(color.green('Datos de ejemplo añadidos correctamente.'));
  } catch (error: any) {
    s.stop('La creación de datos falló');
    p.log.error(error.message);
    p.outro(color.red('Verifica tu base de datos y la configuración.'));
    process.exit(1);
  } finally {
    await db.end();
  }
}

main().catch(console.error);
