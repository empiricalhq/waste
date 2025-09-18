import { BaseRepository } from '@/internal/shared/repository/base-repository';
import type { UserWithRole } from './models';
import { UserQueries } from './queries';

export class UserRepository extends BaseRepository {
  async findDrivers(): Promise<UserWithRole[]> {
    return this.executeQuery<UserWithRole>(UserQueries.findDrivers);
  }
}
