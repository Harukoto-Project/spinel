import type { Migration } from './types.js';

const TABLE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

export const initialMigration: Migration = {
  version: 1,
  name: 'initial',
  statements: [
    `CREATE TABLE admin_keys (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      hash CHAR(64) NOT NULL,
      created_at BIGINT NOT NULL
    ) ${TABLE_OPTIONS}`,

    `CREATE TABLE mail_accounts (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE,
      provider VARCHAR(32) NOT NULL,
      email VARCHAR(320) NOT NULL,
      name VARCHAR(255) NOT NULL,
      refresh_token TEXT NOT NULL,
      connected_at BIGINT NOT NULL,
      connected TINYINT(1) NOT NULL,
      last_error TEXT NULL,
      last_checked_at BIGINT NULL,
      sync_cursor TEXT NULL,
      UNIQUE KEY uq_mail_accounts_provider_email (provider, email)
    ) ${TABLE_OPTIONS}`,

    `CREATE TABLE mail_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      poll_interval_sec INT UNSIGNED NOT NULL
    ) ${TABLE_OPTIONS}`,

    `CREATE TABLE mail_processed (
      seq BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      mail_id VARCHAR(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      UNIQUE KEY uq_mail_processed_mail_id (mail_id)
    ) ${TABLE_OPTIONS}`,

    `CREATE TABLE mail_history (
      seq BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      id VARCHAR(64) NOT NULL,
      account_id VARCHAR(64) NOT NULL,
      account_name VARCHAR(255) NOT NULL,
      account_email VARCHAR(320) NOT NULL,
      provider VARCHAR(32) NOT NULL,
      sender TEXT NOT NULL,
      subject TEXT NOT NULL,
      received_at BIGINT NOT NULL,
      processed_at BIGINT NOT NULL,
      decision ENUM('notify', 'ignore') NOT NULL,
      priority ENUM('normal', 'urgent') NULL,
      summary TEXT NULL,
      deadline TEXT NULL,
      UNIQUE KEY uq_mail_history_id (id)
    ) ${TABLE_OPTIONS}`,
  ],
};
