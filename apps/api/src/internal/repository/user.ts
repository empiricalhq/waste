import type { Database } from '@/internal/database/connection';
import { UserQueries } from '@/internal/database/queries';
import type { UserWithRole } from '@/internal/models/user';

export class UserRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findDrivers(): Promise<UserWithRole[]> {
    const result = await this.db.query<UserWithRole>(UserQueries.findDrivers);
    return result.rows;
  }
}
