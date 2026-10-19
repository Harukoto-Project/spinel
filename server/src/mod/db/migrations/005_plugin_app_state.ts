import type { Migration } from './types.js';

const TABLE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

export const pluginAppStateMigration: Migration = {
  version: 5,
  name: 'plugin_app_state',
  statements: [
    `CREATE TABLE plugin_app_state (
      plugin_id VARCHAR(64) NOT NULL PRIMARY KEY,
      setup_state TEXT NOT NULL,
      updated_at BIGINT NOT NULL,
      CONSTRAINT fk_plugin_app_state_plugin FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
    ) ${TABLE_OPTIONS}`,
  ],
};
