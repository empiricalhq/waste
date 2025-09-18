import type { QueryResultRow } from 'pg';
import type { DatabaseInterface } from '@/internal/shared/database/database';

export abstract class BaseRepository<_T = any> {
  constructor(protected readonly db: DatabaseInterface) {}

  protected async executeQuery<R extends QueryResultRow>(query: string, params?: unknown[]): Promise<R[]> {
    const result = await this.db.query<R>(query, params);
    return result.rows;
  }

  protected async executeQuerySingle<R extends QueryResultRow>(query: string, params?: unknown[]): Promise<R | null> {
    const rows = await this.executeQuery<R>(query, params);
    return rows[0] || null;
  }

  protected async executeQueryWithCount(query: string, params?: unknown[]): Promise<{ rows: any[]; count: number }> {
    const result = await this.db.query(query, params);
    return {
      rows: result.rows,
      count: result.rowCount,
    };
  }
}
