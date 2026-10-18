import { initialMigration } from './001_initial.js';
import { apiKeysMigration } from './002_api_keys.js';
import type { Migration } from './types.js';

export const MIGRATIONS: readonly Migration[] = [initialMigration, apiKeysMigration];
