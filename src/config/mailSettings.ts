import type { MailSettingField } from '@/types/mailAccount';

export const MAIL_SETTING_FIELDS: MailSettingField[] = [
  {
    key: 'pollIntervalSec',
    label: '新着メールの確認間隔',
    description: 'ノードが各アカウントの新着メールを確認する間隔です。アカウント接続後に届いたメールだけが対象です。',
    unit: '秒',
    min: 10,
    max: 86400,
    defaultValue: 300,
  },
];
