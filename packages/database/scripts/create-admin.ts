import process from 'node:process';
import { cancel, group, intro, log, note, outro, password, spinner, text } from '@clack/prompts';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { Pool } from 'pg';
import color from 'picocolors';

const MIN_NAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

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
  // biome-ignore lint/style/useNamingConvention: better auth requires baseURL
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api',
  emailAndPassword: { enabled: true },
  telemetry: { enabled: false },
  plugins: [organization({})],
});

async function checkExistingOrganization(): Promise<boolean> {
  const s = spinner();
  s.start('Revisando si ya existe una organización...');
  const { rows } = await db.query(`SELECT 1 FROM "organization" LIMIT 1`);
  s.stop('Revisión completada.');
  return rows.length > 0;
}

async function collectUserInput() {
  return await group(
    {
      name: () =>
        text({
          message: 'Nombre completo del propietario:',
          placeholder: 'Ejemplo: Juan Pérez',
          validate: (value) => {
            if (value.trim().length < MIN_NAME_LENGTH) {
              return `Escribe el nombre completo (mínimo ${MIN_NAME_LENGTH} caracteres).`;
            }
          },
        }),
      email: () =>
        text({
          message: 'Correo electrónico del propietario:',
          placeholder: 'Ejemplo: admin@dominio.xyz',
          validate: (value) => {
            if (!EMAIL_REGEX.test(value)) {
              return 'Debes ingresar un correo electrónico válido.';
            }
          },
        }),
      password: () =>
        password({
          message: `Crea una contraseña segura (mínimo ${MIN_PASSWORD_LENGTH} caracteres):`,
          validate: (value) => {
            if (value.length < MIN_PASSWORD_LENGTH) {
              return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
            }
          },
        }),
    },
    {
      onCancel: () => {
        cancel('Operación cancelada por el usuario.');
        process.exit(0);
      },
    },
  );
}

async function createOwnerUser(email: string, password: string, name: string) {
  const s = spinner();
  s.start('Creando usuario propietario...');
  const { user: ownerUser } = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });
  s.stop('Usuario propietario creado.');
  return ownerUser;
}

async function createOrganization(userId: string) {
  const s = spinner();
  s.start('Creando organización principal...');
  await auth.api.createOrganization({
    body: {
      name: 'Lima Limpia',
      slug: 'lima-limpia',
      userId,
    },
  });
  s.stop('Organización creada correctamente.');
}

function displaySuccessMessage(email: string, password: string) {
  const noteMessage = `
Agrega estas credenciales al archivo ${color.bold('.env')} en la raíz del proyecto:

${color.green(`SYSTEM_ADMIN_EMAIL="${email}"`)}
${color.green(`SYSTEM_ADMIN_PASSWORD="${password}"`)}
`;
  note(noteMessage, 'Próximos pasos (apps/api/test):');
  outro(color.green('Propietario de la organización configurado correctamente.'));
  outro('Ahora puedes usar esta cuenta para la prueba de la API via "bun run test".');
}

function handleError(error: unknown) {
  const s = spinner();
  s.stop('Ocurrió un error durante la creación.');
  log.error('No se pudo configurar la organización y el propietario.');

  if (error instanceof Error) {
    if (error.message?.includes('unique constraint')) {
      log.warn('Ya existe un usuario con este correo electrónico en la base de datos.');
    } else {
      log.error(error.message);
    }
  }

  outro(color.red('Proceso fallido.'));
  process.exit(1);
}

async function main() {
  intro(color.inverse(' @packages/database: creación de organización y propietario '));

  try {
    const hasOrganization = await checkExistingOrganization();

    if (hasOrganization) {
      log.warn('Ya existe una organización.');
      outro('Este script solo puede crear la primera organización y su propietario.');
      return;
    }

    const userInput = await collectUserInput();
    const ownerUser = await createOwnerUser(userInput.email, userInput.password, userInput.name);
    await createOrganization(ownerUser.id);
    displaySuccessMessage(userInput.email, userInput.password);
  } catch (error: unknown) {
    handleError(error);
  } finally {
    await db.end();
  }
}

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
