import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import type { DatabaseConfig } from '@/internal/shared/config/config';

export interface DatabaseInterface {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number }>;
  getClient(): Promise<PoolClient>;
  withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
  getPool(): Pool;
  close(): Promise<void>;
}

export class Database implements DatabaseInterface {
  private readonly pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.url,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: config.maxConnections,
      idleTimeoutMillis: config.idleTimeoutMs,
      connectionTimeoutMillis: config.connectionTimeoutMs,
    });
  }

  getPool(): Pool {
    return this.pool;
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number }> {
    const result = await this.pool.query<T>(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0,
    };
  }

  getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
