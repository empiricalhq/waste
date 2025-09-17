import process from 'node:process';

import { Pool } from 'pg';

export class DbHelper {
  private readonly pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL required');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
  }

  async clean(): Promise<void> {
    const tables = [
      'push_notification_token',
      'dispatch_message',
      'system_alert',
      'driver_issue_report',
      'citizen_issue_report',
      'user_education_progress',
      'citizen_profile',
      'truck_location_history',
      'truck_current_location',
      'route_assignment',
      'route_waypoint',
      'route_schedule',
      'invitation',
      'member',
      'session',
      'account',
      'verification',
      'route',
      'truck',
      'organization',
      '"user"',
    ];

    try {
      await this.pool.query('SET session_replication_role = replica;');
      const tableList = tables.join(', ');
      await this.pool.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
      await this.pool.query('SET session_replication_role = DEFAULT;');
    } catch (error) {
      console.error('Database clean failed:', error);
      throw error;
    }
  }

  async addMember(userId: string, orgId: string, role: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO member (id, "userId", "organizationId", role) VALUES (gen_random_uuid(), $1, $2, $3)',
      [userId, orgId, role],
    );
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
