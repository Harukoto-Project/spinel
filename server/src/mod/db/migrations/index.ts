import { initialMigration } from './001_initial.js';
import { apiKeysMigration } from './002_api_keys.js';
import { pluginsMigration } from './003_plugins.js';
import { pluginSourcesMigration } from './004_plugin_sources.js';
import { pluginAppStateMigration } from './005_plugin_app_state.js';
import type { Migration } from './types.js';

export const MIGRATIONS: readonly Migration[] = [
  initialMigration,
  apiKeysMigration,
  pluginsMigration,
  pluginSourcesMigration,
  pluginAppStateMigration,
];
