import type { Migration } from './types.js';

const TABLE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

export const pluginSourcesMigration: Migration = {
  version: 4,
  name: 'plugin_sources',
  statements: [
    `CREATE TABLE plugin_sources (
      plugin_id VARCHAR(64) NOT NULL PRIMARY KEY,
      repo VARCHAR(140) NOT NULL,
      source_ref VARCHAR(100) NULL,
      transport VARCHAR(8) NOT NULL,
      installed_sha CHAR(40) NOT NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      CONSTRAINT fk_plugin_sources_plugin FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
    ) ${TABLE_OPTIONS}`,
  ],
};
