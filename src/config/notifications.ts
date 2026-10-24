import { BellOff, CircleCheck, LoaderCircle, type LucideIcon } from 'lucide-react';
import type { StatusTone } from '@/config/statusTones';
import type { ConnectionState, NotificationPriority, PriorityFilter } from '@/types/notification';

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  normal: '通常',
  urgent: '緊急',
};

export const PRIORITY_FILTER_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'すべて通知する' },
  { value: 'urgentOnly', label: '緊急のみ通知する' },
];

export type ConnectionStateStyle = {
  label: string;
  tone: StatusTone;
  icon?: LucideIcon;
};

export const CONNECTION_STATE_CONFIG: Record<ConnectionState, ConnectionStateStyle> = {
  disabled: { label: '通知オフ', tone: 'normal', icon: BellOff },
  needsKey: { label: '管理キー未設定', tone: 'warning' },
  connecting: { label: '接続中', tone: 'normal', icon: LoaderCircle },
  connected: { label: '接続済み', tone: 'normal', icon: CircleCheck },
  disconnected: { label: '切断(再接続中)', tone: 'warning' },
  unauthorized: { label: '認証エラー', tone: 'critical' },
};
