import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { ConnectionStatus } from '@/types/notification';

const CONNECTION_EVENT = 'notification-connection';

export function listenConnectionChanged(handler: (status: ConnectionStatus) => void): Promise<UnlistenFn> {
  return listen<ConnectionStatus>(CONNECTION_EVENT, (event) => handler(event.payload));
}
