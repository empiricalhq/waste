import * as p from '@clack/prompts';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import color from 'picocolors';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Make sure it is set in your .env file.');
}
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required in your .env file.');
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
      role: {
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
  p.intro(color.inverse(' @packages/database: creación de usuario (admin) '));

  const s = p.spinner();

  try {
    s.start('Revisando si ya existe un usuario con rol administrador...');
    const { rows } = await db.query(`SELECT 1 FROM "user" WHERE role = 'admin' LIMIT 1`);
    s.stop('Revisión completada.');

    if (rows.length > 0) {
      p.log.warn('Ya existe un usuario con rol administrador.');
      p.outro('No se puede crear otro administrador desde este script. Usa la aplicación web para añadir más.');
      return;
    }

    const { name, email, password } = await p.group(
      {
        name: () =>
          p.text({
            message: 'Nombre completo del administrador:',
            placeholder: 'Ejemplo: Juan Pérez',
            validate: value => {
              if (value.trim().length < 5) return 'Escribe el nombre completo (mínimo 5 caracteres).';
            },
          }),
        email: () =>
          p.text({
            message: 'Correo electrónico del administrador:',
            placeholder: 'Ejemplo: admin@dominio.xyz',
            validate: value => {
              if (!/^\S+@\S+\.\S+$/.test(value)) return 'Debes ingresar un correo electrónico válido.';
            },
          }),
        password: () =>
          p.password({
            message: 'Crea una contraseña segura (mínimo 8 caracteres):',
            validate: value => {
              if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
            },
          }),
      },
      {
        onCancel: () => {
          p.cancel('Operación cancelada por el usuario.');
          process.exit(0);
        },
      }
    );

    s.start('Creando usuario administrador...');
    await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: 'admin',
      },
    });
    s.stop('Usuario administrador creado correctamente.');

    const noteMessage = `
Agrega estas credenciales al archivo ${color.bold('.env')} en la raíz del proyecto:

${color.green(`ADMIN_EMAIL="${email}"`)}
${color.green(`ADMIN_PASSWORD="${password}"`)}
`;
    p.note(noteMessage, 'Próximos pasos');
    p.outro(color.green('Usuario administrador configurado correctamente.'));
  } catch (error: any) {
    s.stop('Ocurrió un error durante la creación.');
    p.log.error('No se pudo crear el usuario administrador.');
    if (error.message.includes('unique constraint')) {
      p.log.warn('Ya existe un usuario con este correo electrónico en la base de datos.');
    } else {
      p.log.error(error.message);
    }
    p.outro(color.red('Proceso fallido.'));
    process.exit(1);
  } finally {
    await db.end();
  }
}

main().catch(console.error);
