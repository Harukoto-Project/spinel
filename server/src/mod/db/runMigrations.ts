import type { Logger } from '../logger.js';
import { execute, queryRows, type Db } from './Database.js';
import { MIGRATIONS } from './migrations/index.js';

const LOCK_NAME = 'spinel_schema_migrations';
const LOCK_TIMEOUT_SEC = 30;

interface AppliedRow {
  version: number;
}

interface LockRow {
  acquired: number | null;
}

export const runMigrations = async (db: Db, logger: Logger): Promise<void> => {
  const connection = await db.getConnection();
  try {
    const [lock] = await queryRows<LockRow>(connection, 'SELECT GET_LOCK(?, ?) AS acquired', [
      LOCK_NAME,
      LOCK_TIMEOUT_SEC,
    ]);
    if (lock?.acquired !== 1) {
      throw new Error(
        'データベースのマイグレーションのロックを取得できませんでした(他のサーバーが実行中の可能性があります)',
      );
    }

    try {
      await execute(
        connection,
        `CREATE TABLE IF NOT EXISTS schema_migrations (
          version INT UNSIGNED NOT NULL PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          applied_at BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      );

      const applied = new Set(
        (await queryRows<AppliedRow>(connection, 'SELECT version FROM schema_migrations')).map((row) => row.version),
      );

      for (const migration of [...MIGRATIONS].sort((a, b) => a.version - b.version)) {
        if (applied.has(migration.version)) continue;
        logger.info(`データベースのマイグレーションを適用します: ${migration.version} ${migration.name}`);
        for (const statement of migration.statements) await execute(connection, statement);
        await execute(connection, 'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', [
          migration.version,
          migration.name,
          Date.now(),
        ]);
      }
    } finally {
      await execute(connection, 'DO RELEASE_LOCK(?)', [LOCK_NAME]).catch(() => undefined);
    }
  } finally {
    connection.release();
  }
};
