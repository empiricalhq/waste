import postgres from 'postgres';
import process from 'node:process';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for tests. Make sure .env.test is properly configured.');
}

const sql = postgres(process.env.DATABASE_URL);

export async function cleanDatabase(): Promise<void> {
  console.log('🧹 Cleaning test database...');

  try {
    // Simple truncate all tables (let the db handle foreign keys)
    await sql`TRUNCATE TABLE 
      push_notification_token,
      dispatch_message, 
      citizen_issue_report,
      driver_issue_report,
      system_alert,
      user_education_progress,
      citizen_profile,
      route_assignment,
      route_schedule,
      route_waypoint,
      route,
      truck_location_history,
      truck_current_location,
      truck,
      verification,
      session,
      account,
      "user"
      RESTART IDENTITY CASCADE`;

    console.log('✅ Test database cleaned successfully');
  } catch (error) {
    console.error('❌ Error cleaning test database:', error);
    throw error;
  }
}

export async function validateTestDatabase(): Promise<void> {
  try {
    const [{ current_database }] = await sql`SELECT current_database()`;

    console.log(`Connected to database: ${current_database}`);
    console.log('Test database connection validated');
  } catch (error) {
    console.error('❌ Error validating test database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await sql.end();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error);
    throw error;
  }
}

export async function setupTestDatabase(): Promise<void> {
  await validateTestDatabase();
  await cleanDatabase();
}

export async function teardownTestDatabase(): Promise<void> {
  await cleanDatabase();
  await closeDatabase();
}
