import { ProcessedStore } from '../../mail/ProcessedStore.js';
import type { LegacyImporter } from './types.js';

export const mailProcessedImporter: LegacyImporter = {
  name: '処理済みメール',
  file: 'mail-processed.json',
  table: 'mail_processed',
  async run(connection, data) {
    if (!Array.isArray(data)) return 0;

    const ids = data.filter((value): value is string => typeof value === 'string');
    const store = new ProcessedStore(connection);
    for (const id of ids) await store.add(id);
    return ids.length;
  },
};
