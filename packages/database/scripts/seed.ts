import * as p from '@clack/prompts';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { createId } from '@paralleldrive/cuid2';
import color from 'picocolors';

if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
  throw new Error('DATABASE_URL and BETTER_AUTH_SECRET must be set in your .env file.');
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
      role: {
        type: 'string',
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

async function createUsers() {
  p.log.step('Creando usuarios...');
  const createdUsers = [];

  for (const userData of seedUsers) {
    try {
      const existingUserResponse = await auth.api.listUsers({
        query: {
          searchField: 'email',
          searchValue: userData.email,
          limit: 1,
        },
      });

      if (existingUserResponse.users && existingUserResponse.users.length > 0) {
        const existingUser = existingUserResponse.users[0];
        if (existingUser) {
          p.log.info(`El usuario @${userData.email} ya existe.`);
          createdUsers.push(existingUser);
          continue;
        }
      }

      const newUserResponse = await auth.api.createUser({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.authRole,
          data: {
            emailVerified: true,
            role: userData.appRole,
          },
        },
      });

      const newUser = newUserResponse.user ?? newUserResponse;
      if (newUser) {
        createdUsers.push(newUser);
        p.log.success(`Usuario creado: ${userData.email} (${userData.appRole})`);
      }
    } catch (error: any) {
      p.log.error(`Error al crear el usuario ${userData.email}: ${error.message}`);
    }
  }

  return createdUsers;
}

async function createAppData(supervisorUserId: string) {
  p.log.step('Añadiendo data sobre las rutas, asignaciones y camiones recolectores...');
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
      } else {
        p.log.info(`Camión recolector con placa ${truck.licensePlate} ya existe.`);
      }
    }
    const { rows } = await client.query('SELECT id FROM route WHERE name = $1', [seedData.route.name]);
    let routeId;
    if (rows.length === 0) {
      routeId = createId();
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
      p.log.success(`Ruta creada: ${seedData.route.name} con ${seedData.waypoints.length} puntos de referencia.`);
    } else {
      routeId = rows[0].id;
      p.log.info(`La ruta "${seedData.route.name}" ya existe.`);
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
    const users = await createUsers();
    if (users.length === 0) throw new Error('No se encontraron usuarios creados.');

    const supervisorUser = users.find(u => u.role === 'supervisor');
    if (!supervisorUser)
      throw new Error('No se pudo encontrar un usuario supervisor para crear la data de la aplicación.');

    await createAppData(supervisorUser.id);

    p.note(
      `🎉 El entorno de trabajo está listo

Se han creado los siguientes usuarios:

Rol         | Email                   | Nombre
------------|-------------------------|-----------------
${users.map(u => `${u.role?.padEnd(10)} | ${u.email.padEnd(23)} | ${u.name}`).join('\n')}

Contraseñas:
- Supervisor -> supervisor123
- Driver     -> driver123
- Citizen    -> citizen123

Ruta: ${seedData.route.name}
Camiones: ${seedData.trucks.map(t => t.name).join(', ')}
Puntos de referencia: ${seedData.waypoints.length} ubicaciones en Lima
`,
      '✅ Los datos se han añadido correctamente'
    );
    p.outro(color.green('Ya puedes intentar levantar apps/web, apps/citizen o apps/driver'));
  } catch (error: any) {
    p.log.error('La creación de datos falló:');
    p.log.error(error.message);
    p.outro(color.red('La creación de datos falló. Verifica tu base de datos y la configuración de Better Auth.'));
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
