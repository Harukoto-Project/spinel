import type { NotificationPayload, NotificationPriority } from './protocol.js';

export const buildTestNotification = (priority: NotificationPriority): NotificationPayload => ({
  kind: 'test',
  priority,
  title: 'テスト通知',
  body: 'Spinel のサーバーから送信したテスト通知です。この通知が表示されていれば、受信できています。',
  mail: null,
});
