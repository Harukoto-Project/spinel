import { initialMigration } from './001_initial.js';
import type { Migration } from './types.js';

export const MIGRATIONS: readonly Migration[] = [initialMigration];
