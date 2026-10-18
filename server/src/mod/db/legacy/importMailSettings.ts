import { isValidPollInterval, MailSettingsStore } from '../../mail/settings/MailSettingsStore.js';
import type { LegacyImporter } from './types.js';

export const mailSettingsImporter: LegacyImporter = {
  name: 'メール設定',
  file: 'mail-settings.json',
  table: 'mail_settings',
  async run(connection, data) {
    const interval =
      typeof data === 'object' && data !== null && 'pollIntervalSec' in data ? data.pollIntervalSec : null;
    if (!isValidPollInterval(interval)) {
      throw new Error('メール設定ファイルの形式が正しくありません');
    }

    await new MailSettingsStore(connection).update({ pollIntervalSec: interval });
    return 1;
  },
};
