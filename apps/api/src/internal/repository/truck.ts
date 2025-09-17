import type { Database } from '@/internal/database/connection';
import { TruckQueries } from '@/internal/database/queries';
import type { CreateTruckRequest, Truck, TruckWithDetails } from '@/internal/models/truck';

export class TruckRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findAllActive(): Promise<TruckWithDetails[]> {
    const result = await this.db.query<TruckWithDetails>(TruckQueries.findAllActiveWithDetails);
    return result.rows;
  }

  async create(data: CreateTruckRequest): Promise<Truck> {
    const result = await this.db.query<Truck>(TruckQueries.create, [data.name, data.license_plate]);
    if (!result.rows[0]) {
      throw new Error('Database query failed to return created truck.');
    }
    return result.rows[0];
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.db.query(TruckQueries.deactivate, [id]);
    return result.rowCount > 0;
  }
}
