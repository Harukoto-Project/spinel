import { invoke } from '@tauri-apps/api/core';
import type {
  ConnectionStatus,
  NotificationConfig,
  NotificationPriority,
  NotificationSettings,
} from '@/types/notification';

export function loadNotificationConfig(nodeId: string): Promise<NotificationConfig> {
  return invoke<NotificationConfig>('load_notification_config', { nodeId });
}

export function saveNotificationSettings(nodeId: string, settings: NotificationSettings): Promise<NotificationConfig> {
  return invoke<NotificationConfig>('save_notification_settings', { nodeId, settings });
}

export function setNodeAdminKey(nodeId: string, adminKey: string): Promise<NotificationConfig> {
  return invoke<NotificationConfig>('set_node_admin_key', { nodeId, adminKey });
}

export function deleteNodeAdminKey(nodeId: string): Promise<NotificationConfig> {
  return invoke<NotificationConfig>('delete_node_admin_key', { nodeId });
}

export function deleteNotificationConfig(nodeId: string): Promise<void> {
  return invoke('delete_notification_config', { nodeId });
}

export function refreshNotificationConnections(): Promise<void> {
  return invoke('refresh_notification_connections');
}

export function getNotificationConnections(): Promise<ConnectionStatus[]> {
  return invoke<ConnectionStatus[]>('get_notification_connections');
}

export function sendTestNotification(nodeId: string, priority: NotificationPriority): Promise<number> {
  return invoke<number>('send_test_notification', { nodeId, priority });
}
