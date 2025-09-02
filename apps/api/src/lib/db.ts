import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export default sql;
