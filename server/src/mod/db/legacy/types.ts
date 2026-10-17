import type { PoolConnection } from 'mysql2/promise';

export interface LegacyImporter {
  name: string;
  file: string;
  table: string;
  run(connection: PoolConnection, data: unknown): Promise<number>;
}
