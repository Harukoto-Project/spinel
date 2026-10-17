import type { ConnectionState, NotificationKind, NotificationPriority, PriorityFilter } from '@/types/notification';

export const NOTIFICATION_HISTORY_LIMIT = 200;

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  normal: '通常',
  urgent: '緊急',
};

export const KIND_LABELS: Record<NotificationKind, string> = {
  mail: 'メール',
  test: 'テスト',
};

export const PRIORITY_FILTER_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'すべて通知する' },
  { value: 'urgentOnly', label: '緊急のみ通知する' },
];

export const CONNECTION_STATE_CONFIG: Record<ConnectionState, { label: string; dotClass: string }> = {
  disabled: { label: '通知オフ', dotClass: 'bg-muted-foreground' },
  needsKey: { label: '管理キー未設定', dotClass: 'bg-muted-foreground' },
  connecting: { label: '接続中…', dotClass: 'bg-amber-500 animate-pulse' },
  connected: { label: '接続済み', dotClass: 'bg-emerald-500' },
  disconnected: { label: '切断(再接続中)', dotClass: 'bg-amber-500' },
  unauthorized: { label: '認証エラー', dotClass: 'bg-destructive' },
};
