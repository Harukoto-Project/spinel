import { formatDateTime } from '@/components/nodes/nodeFormat';

export function formatReceivedAt(receivedAtMs: number): string {
  return formatDateTime(new Date(receivedAtMs).toISOString(), { seconds: true });
}
