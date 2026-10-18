import type { Migration } from './types.js';

const TABLE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

export const pluginsMigration: Migration = {
  version: 3,
  name: 'plugins',
  statements: [
    `CREATE TABLE plugin_repositories (
      id VARCHAR(32) NOT NULL PRIMARY KEY,
      url VARCHAR(512) NOT NULL,
      name VARCHAR(128) NOT NULL,
      installed_sha CHAR(40) NOT NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      UNIQUE KEY uq_plugin_repositories_url (url)
    ) ${TABLE_OPTIONS}`,

    `CREATE TABLE plugins (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      repo_id VARCHAR(32) NOT NULL,
      path VARCHAR(512) NOT NULL,
      manifest MEDIUMTEXT NOT NULL,
      installed_version VARCHAR(64) NOT NULL,
      enabled TINYINT(1) NOT NULL,
      granted_permissions TEXT NULL,
      config TEXT NOT NULL,
      secrets TEXT NULL,
      error_message TEXT NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      KEY idx_plugins_repo_id (repo_id),
      CONSTRAINT fk_plugins_repo FOREIGN KEY (repo_id) REFERENCES plugin_repositories (id) ON DELETE CASCADE
    ) ${TABLE_OPTIONS}`,

    `CREATE TABLE plugin_storage (
      plugin_id VARCHAR(64) NOT NULL,
      item_key VARCHAR(190) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      item_value MEDIUMTEXT NOT NULL,
      PRIMARY KEY (plugin_id, item_key),
      CONSTRAINT fk_plugin_storage_plugin FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
    ) ${TABLE_OPTIONS}`,
  ],
};
