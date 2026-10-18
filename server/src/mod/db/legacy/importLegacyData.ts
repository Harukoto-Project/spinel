import path from 'node:path';
import type { Logger } from '../../logger.js';
import { queryRows, withTransaction, type Db } from '../Database.js';
import { adminKeyImporter } from './importAdminKey.js';
import { mailAccountsImporter } from './importMailAccounts.js';
import { mailHistoryImporter } from './importMailHistory.js';
import { mailProcessedImporter } from './importMailProcessed.js';
import { mailSettingsImporter } from './importMailSettings.js';
import { markLegacyImported, readLegacyJson } from './legacyFiles.js';
import type { LegacyImporter } from './types.js';

const IMPORTERS: readonly LegacyImporter[] = [
  adminKeyImporter,
  mailAccountsImporter,
  mailSettingsImporter,
  mailProcessedImporter,
  mailHistoryImporter,
];

const TABLE_NAME_PATTERN = /^[a-z_]+$/;

export const importLegacyData = async (db: Db, dataDir: string, logger: Logger): Promise<void> => {
  for (const importer of IMPORTERS) {
    const filePath = path.resolve(dataDir, importer.file);
    const data = await readLegacyJson(filePath);
    if (data === undefined) continue;

    if (!TABLE_NAME_PATTERN.test(importer.table)) throw new Error(`不正なテーブル名です: ${importer.table}`);

    const count = await withTransaction(db, async (connection) => {
      const existing = await queryRows<{ found: number }>(
        connection,
        `SELECT 1 AS found FROM ${importer.table} LIMIT 1`,
      );
      if (existing.length > 0) return null;
      return importer.run(connection, data);
    });

    if (count === null) {
      logger.warn(
        `${importer.name}は MySQL に既にデータがあるため、${importer.file} の取り込みをスキップしました(ファイルは残しています)`,
      );
      continue;
    }

    const renamed = await markLegacyImported(filePath);
    logger.info(`${importer.name}を ${importer.file} から MySQL へ取り込みました(${count}件)。元ファイル: ${renamed}`);
  }
};
