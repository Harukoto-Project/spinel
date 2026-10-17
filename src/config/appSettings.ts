import type { AppSettings } from '@/types/appSettings';

export type AppSettingField = {
  key: keyof AppSettings;
  label: string;
  description: string;
};

export const APP_SETTING_FIELDS: AppSettingField[] = [
  {
    key: 'launchAtLogin',
    label: 'Windows 起動時に自動起動',
    description: 'Windows にサインインしたとき、Spinel を自動で起動します。',
  },
  {
    key: 'startMinimized',
    label: '起動時に最小化した状態で起動する',
    description: 'ウィンドウを表示せず、タスクトレイに格納した状態で起動します。',
  },
  {
    key: 'closeToTray',
    label: '閉じるボタンでトレイに最小化',
    description: 'オフにすると、閉じるボタンでアプリを終了します。オンの間は通知を受信し続けます。',
  },
];
