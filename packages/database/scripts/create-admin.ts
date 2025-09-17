import process from 'node:process';
import * as p from '@clack/prompts';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { Pool } from 'pg';
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
  telemetry: { enabled: false },
  plugins: [organization({})],
});

async function main() {
  p.intro(color.inverse(' @packages/database: creación de organización y propietario '));

  const s = p.spinner();

  try {
    s.start('Revisando si ya existe una organización...');
    const { rows } = await db.query(`SELECT 1 FROM "organization" LIMIT 1`);
    s.stop('Revisión completada.');

    if (rows.length > 0) {
      p.log.warn('Ya existe una organización.');
      p.outro('Este script solo puede crear la primera organización y su propietario.');
      return;
    }

    const { name, email, password } = await p.group(
      {
        name: () =>
          p.text({
            message: 'Nombre completo del propietario:',
            placeholder: 'Ejemplo: Juan Pérez',
            validate: (value) => {
              if (value.trim().length < 5) {
                return 'Escribe el nombre completo (mínimo 5 caracteres).';
              }
            },
          }),
        email: () =>
          p.text({
            message: 'Correo electrónico del propietario:',
            placeholder: 'Ejemplo: admin@dominio.xyz',
            validate: (value) => {
              if (!/^\S+@\S+\.\S+$/.test(value)) {
                return 'Debes ingresar un correo electrónico válido.';
              }
            },
          }),
        password: () =>
          p.password({
            message: 'Crea una contraseña segura (mínimo 8 caracteres):',
            validate: (value) => {
              if (value.length < 8) {
                return 'La contraseña debe tener al menos 8 caracteres.';
              }
            },
          }),
      },
      {
        onCancel: () => {
          p.cancel('Operación cancelada por el usuario.');
          process.exit(0);
        },
      },
    );

    s.start('Creando usuario propietario...');
    const ownerUser = await auth.api.createUser({
      body: {
        email,
        password,
        name,
      },
    });
    s.stop('Usuario propietario creado.');

    s.start('Creando organización principal...');
    await auth.api.createOrganization({
      body: {
        name: 'Lima Limpia',
        slug: 'lima-limpia',
        userId: ownerUser.id, // This makes the user the 'owner'
      },
    });
    s.stop('Organización creada correctamente.');

    const noteMessage = `
Agrega estas credenciales al archivo ${color.bold('.env')} en la raíz del proyecto:

${color.green(`SYSTEM_ADMIN_EMAIL="${email}"`)}
${color.green(`SYSTEM_ADMIN_PASSWORD="${password}"`)}
`;
    p.note(noteMessage, 'Próximos pasos (apps/api/test):');
    p.outro(color.green('Propietario de la organización configurado correctamente.'));
    p.outro('Ahora puedes usar esta cuenta para la prueba de la API via "bun run test".');
  } catch (error: any) {
    s.stop('Ocurrió un error durante la creación.');
    p.log.error('No se pudo configurar la organización y el propietario.');
    if (error.message?.includes('unique constraint')) {
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
