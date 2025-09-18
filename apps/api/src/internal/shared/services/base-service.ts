import { ConflictError, ValidationError } from '@/internal/shared/utils/errors';

export abstract class BaseService {
  protected handleDatabaseError(error: unknown): never {
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case '23505':
          throw new ConflictError('Resource already exists');
        case '23503':
          throw new ValidationError('Invalid reference provided');
        case '23502':
          throw new ValidationError('Required field missing');
        default:
          throw error;
      }
    }
    throw error;
  }
}
