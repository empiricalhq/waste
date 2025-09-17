import process from 'node:process';
import { Pool, type QueryResultRow } from 'pg';

export class DbHelper {
  private readonly pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for DbHelper');
    }
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  async clean(): Promise<void> {
    const tables = [
      'truck_location_history',
      'truck_current_location',
      'driver_issue_report',
      'citizen_issue_report',
      'route_assignment',
      'route_waypoint',
      'route',
      'truck',
      'citizen_profile',
      'member',
      'organization',
      'session',
      'account',
      '"user"',
    ];
    await this.pool.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`);
  }

  async addMember(userId: string, orgId: string, role: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO member ("id", "userId", "organizationId", role) VALUES (gen_random_uuid(), $1, $2, $3)`,
      [userId, orgId, role],
    );
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
    const result = await this.pool.query<T>(text, params);
    return { rows: result.rows };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
