import { BaseRepository } from '@/internal/shared/repository/base-repository';
import type { CreateTruckRequest, Truck, TruckWithDetails } from './models';
import { TruckQueries } from './queries';

export class TruckRepository extends BaseRepository {
  async findAllActive(): Promise<TruckWithDetails[]> {
    return this.executeQuery<TruckWithDetails>(TruckQueries.findAllActiveWithDetails);
  }

  async create(data: CreateTruckRequest): Promise<Truck> {
    const result = await this.executeQuery<Truck>(TruckQueries.create, [data.name, data.license_plate]);
    if (!result[0]) {
      throw new Error('Database query failed to return created truck.');
    }
    return result[0];
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.executeQueryWithCount(TruckQueries.deactivate, [id]);
    return result.count > 0;
  }
}
