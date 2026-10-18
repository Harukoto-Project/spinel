import type { Migration } from './types.js';

const TABLE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

export const apiKeysMigration: Migration = {
  version: 2,
  name: 'api_keys',
  statements: [
    `CREATE TABLE api_keys (
      id VARCHAR(32) NOT NULL PRIMARY KEY,
      api_key VARCHAR(512) NOT NULL,
      updated_at BIGINT NOT NULL
    ) ${TABLE_OPTIONS}`,
  ],
};
