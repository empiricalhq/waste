import * as p from '@clack/prompts';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { createId } from '@paralleldrive/cuid2';
import color from 'picocolors';

if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
  throw new Error('DATABASE_URL and BETTER_AUTH_SECRET must be set in your .env file.');
}

if (!process.env.SYSTEM_ADMIN_EMAIL || !process.env.SYSTEM_ADMIN_PASSWORD) {
  throw new Error(
    'SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD are required. Please run the `db:create-admin` script first.'
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api',

  emailAndPassword: { enabled: true },

  plugins: [admin()],

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
});

const seedUsers = [
  {
    authRole: 'admin' as const,
    appRole: 'supervisor' as const,
    name: 'Juan Díaz',
    email: 'supervisor@example.com',
    password: 'supervisor123',
  },
  {
    authRole: 'user' as const,
    appRole: 'driver' as const,
    name: 'Luis Martínez',
    email: 'driver@example.com',
    password: 'driver123',
  },
  {
    authRole: 'user' as const,
    appRole: 'citizen' as const,
    name: 'María Pérez',
    email: 'citizen@example.com',
    password: 'citizen123',
  },
];

const seedData = {
  trucks: [
    { name: 'Recolector Miraflores', licensePlate: 'MIR-001' },
    { name: 'Recolector San Isidro', licensePlate: 'SID-002' },
  ],
  route: {
    name: 'Ruta Centro Lima',
    description: 'Ruta de recolección para el Centro Histórico de Lima.',
    startLat: -12.046374,
    startLng: -77.042793,
    estimatedDurationMinutes: 180,
  },
  waypoints: [
    { lat: -12.046374, lng: -77.042793, streetName: 'Plaza de Armas', order: 1, offset: 0 },
    { lat: -12.047196, lng: -77.030983, streetName: 'Jr. de la Unión', order: 2, offset: 30 },
    { lat: -12.043333, lng: -77.028056, streetName: 'Mercado Central', order: 3, offset: 60 },
    { lat: -12.056944, lng: -77.035278, streetName: 'Av. Abancay', order: 4, offset: 90 },
    { lat: -12.068611, lng: -77.036111, streetName: 'Cercado de Lima', order: 5, offset: 120 },
  ],
};

async function createUsers(sessionToken: string) {
  p.log.step('Creando usuarios de prueba...');
  const createdUsers = [];
  const authCookie = `auth-session=${sessionToken}`;

  for (const userData of seedUsers) {
    try {
      const existingUserResponse = await auth.api.listUsers({
        query: { searchField: 'email', searchValue: userData.email, limit: 1 },
        headers: { Cookie: authCookie },
      });

      if (existingUserResponse.users && existingUserResponse.users.length > 0) {
        p.log.info(`El usuario ${userData.email} ya existe.`);
        createdUsers.push(existingUserResponse.users[0]);
        continue;
      }

      const newUserResponse = await auth.api.createUser({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.authRole,
          data: {
            emailVerified: true,
            appRole: userData.appRole,
          },
        },
        headers: { Cookie: authCookie },
      });

      const newUser = newUserResponse.user;
      if (newUser) {
        createdUsers.push(newUser);
        p.log.success(`Usuario creado: ${userData.email} (${userData.appRole})`);
      }
    } catch (error: any) {
      p.log.error(`Error al crear el usuario ${userData.email}: ${error}`);
    }
  }

  return createdUsers;
}

async function createAppData(supervisorUserId: string) {
  p.log.step('Añadiendo data sobre las rutas y camiones...');
  const client = await pool.connect();
  try {
    for (const truck of seedData.trucks) {
      const { rows } = await client.query('SELECT id FROM truck WHERE license_plate = $1', [truck.licensePlate]);
      if (rows.length === 0) {
        await client.query('INSERT INTO truck (id, name, license_plate) VALUES ($1, $2, $3)', [
          createId(),
          truck.name,
          truck.licensePlate,
        ]);
        p.log.success(`Camión recolector creado: ${truck.name}`);
      }
    }
    const { rows } = await client.query('SELECT id FROM route WHERE name = $1', [seedData.route.name]);
    if (rows.length === 0) {
      const routeId = createId();
      await client.query(
        `INSERT INTO route (id, name, description, start_lat, start_lng, estimated_duration_minutes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          routeId,
          seedData.route.name,
          seedData.route.description,
          seedData.route.startLat,
          seedData.route.startLng,
          seedData.route.estimatedDurationMinutes,
          supervisorUserId,
        ]
      );
      for (const wp of seedData.waypoints) {
        await client.query(
          `INSERT INTO route_waypoint (id, route_id, sequence_order, lat, lng, street_name, estimated_arrival_offset_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [createId(), routeId, wp.order, wp.lat, wp.lng, wp.streetName, wp.offset]
        );
      }
      p.log.success(`Ruta creada: ${seedData.route.name} con ${seedData.waypoints.length} puntos de recolección`);
    }
  } catch (error: any) {
    p.log.error(`Error al crear la data de la aplicación: ${error.message}`);
  } finally {
    client.release();
  }
}

async function main() {
  p.intro(color.inverse(' @lima-garbage/database: añadir sample data '));
  try {
    p.log.step('Iniciando sesión como administrador del sistema...');
    const signInResponse = await auth.api.signInEmail({
      body: {
        email: process.env.SYSTEM_ADMIN_EMAIL!,
        password: process.env.SYSTEM_ADMIN_PASSWORD!,
      },
    });

    const sessionToken = signInResponse.token;
    if (!sessionToken) {
      throw new Error('No se pudo obtener el token de sesión. Verifica las credenciales del administrador en tu .env');
    }
    p.log.success('Sesión de administrador iniciada correctamente.');

    const users = await createUsers(sessionToken);
    if (users.length === 0) throw new Error('No se encontraron usuarios creados.');

    const supervisorUser = users.find(u => u.appRole === 'supervisor');
    if (!supervisorUser) {
      console.log('Usuarios creados:', users);
      throw new Error('No se pudo encontrar un usuario supervisor entre los usuarios creados.');
    }

    await createAppData(supervisorUser.id);

    p.note('🎉 El entorno de trabajo está listo. Usuarios y datos creados.', '✅ Datos añadidos correctamente');
    p.outro(color.green('Ya puedes levantar las aplicaciones.'));
  } catch (error: any) {
    p.log.error(`La creación de datos falló: ${error.message}`);
    p.outro(color.red('Verifica tu base de datos y la configuración.'));
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
