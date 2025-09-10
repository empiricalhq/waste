import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import process from 'node:process';
import {
  user,
  account,
  session,
  verification,
  truck,
  truckCurrentLocation,
  truckLocationHistory,
  route,
  routeWaypoint,
  routeSchedule,
  routeAssignment,
  citizenProfile,
  userEducationProgress,
  systemAlert,
  driverIssueReport,
  citizenIssueReport,
  dispatchMessage,
  pushNotificationToken,
} from '@lima-garbage/database';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for tests. Make sure .env.test is properly configured.');
}

let _testDb: ReturnType<typeof drizzle> | null = null;
let _queryClient: ReturnType<typeof postgres> | null = null;

export function getTestDb() {
  if (!_testDb) {
    _queryClient = postgres(process.env.DATABASE_URL!);
    _testDb = drizzle(_queryClient);
  }
  return _testDb;
}

export const testDb = getTestDb();

const allTables = [
  pushNotificationToken,
  dispatchMessage,
  citizenIssueReport,
  driverIssueReport,
  systemAlert,
  userEducationProgress,
  citizenProfile,
  routeAssignment,
  routeSchedule,
  routeWaypoint,
  route,
  truckLocationHistory,
  truckCurrentLocation,
  truck,
  verification,
  session,
  account,
  user,
];

/**
 * Clean all test data from the database
 * This truncates all tables in the correct order to avoid foreign key constraints
 */
export async function cleanDatabase(): Promise<void> {
  console.log('🧹 Cleaning test database...');

  try {
    // Disable foreign key checks temporarily
    await testDb.execute('SET session_replication_role = replica;');

    // Truncate all tables
    for (const table of allTables) {
      await testDb.delete(table);
    }

    // Re-enable foreign key checks
    await testDb.execute('SET session_replication_role = DEFAULT;');

    console.log('✅ Test database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning test database:', error);
    throw error;
  }
}

export async function validateTestDatabase(): Promise<void> {
  try {
    const result = await testDb.execute('SELECT current_database() as db_name;');
    const dbName = (result as any)[0]?.db_name;

    console.log(`Connected to database: ${dbName}`);
    console.log('✅ Test database connection validated');
  } catch (error) {
    console.error('Error validating test database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    if (_queryClient) {
      await _queryClient.end();
      _queryClient = null;
      _testDb = null;
    }
    console.log('✅ Test database connection closed');
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
