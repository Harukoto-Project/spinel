import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { ConnectionStatus, ReceivedNotification } from '@/types/notification';

const RECEIVED_EVENT = 'notification-received';
const CONNECTION_EVENT = 'notification-connection';

export function listenNotificationReceived(handler: (notification: ReceivedNotification) => void): Promise<UnlistenFn> {
  return listen<ReceivedNotification>(RECEIVED_EVENT, (event) => handler(event.payload));
}

export function listenConnectionChanged(handler: (status: ConnectionStatus) => void): Promise<UnlistenFn> {
  return listen<ConnectionStatus>(CONNECTION_EVENT, (event) => handler(event.payload));
}
