import type { ImapSettingField } from '@/types/imap';

export const IMAP_DEFAULT_PORT = 993;

export const IMAP_SETTING_FIELDS: ImapSettingField[] = [
  {
    key: 'lookbackDays',
    label: '取得対象の期間',
    description: '受信箱から、直近この日数分のメールを対象にします。',
    unit: '日',
    min: 1,
    max: 365,
  },
  {
    key: 'fetchLimit',
    label: '1回の最大取得件数',
    description: '1回の取得で、新しいメールから数えてこの件数まで取得します。',
    unit: '件',
    min: 1,
    max: 500,
  },
  {
    key: 'pollIntervalSec',
    label: '取得間隔',
    description: 'この間隔(秒)ごとにメールを取得します。',
    unit: '秒',
    min: 10,
    max: 86400,
  },
];
