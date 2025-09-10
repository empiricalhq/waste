import { Pool } from 'pg';

class DbHelper {
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for tests');
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
      'citizen_issue_report',
      'driver_issue_report',
      'system_alert',
      'user_education_progress',
      'citizen_profile',
      'route_assignment',
      'route_schedule',
      'route_waypoint',
      'route',
      'truck_location_history',
      'truck_current_location',
      'truck',
      'verification',
      'session',
      'account',
      '"user"',
    ];

    await this.pool.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new DbHelper();
