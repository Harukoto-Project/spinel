import type { PluginPermissions } from '@/types/plugin';

export type PluginPermissionKey = Exclude<keyof PluginPermissions, 'network'>;

export type PluginPermissionDefinition = {
  key: PluginPermissionKey;
  label: string;
  description: string;
  dangerous?: boolean;
};

export const PLUGIN_PERMISSIONS: PluginPermissionDefinition[] = [
  {
    key: 'routes',
    label: 'エンドポイントの追加',
    description: 'ノードに、このプラグイン専用の API エンドポイントを追加します。',
  },
  {
    key: 'storage',
    label: 'データの保存',
    description: 'ノード上に、このプラグイン専用のデータを保存します。',
  },
  {
    key: 'notify',
    label: '通知の送信',
    description: 'このアプリへ通知を送ります。',
  },
  {
    key: 'process',
    label: 'プロセスの実行',
    description: 'ノード上で外部のプログラムを起動します。',
    dangerous: true,
  },
  {
    key: 'build',
    label: 'ビルドの実行',
    description: 'ノード上でビルド用のコマンドを実行します。',
    dangerous: true,
  },
];

export const NETWORK_ANY_ORIGIN = '*';
