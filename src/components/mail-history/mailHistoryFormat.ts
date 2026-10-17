import { formatDateTime } from '@/components/nodes/nodeFormat';

const NO_SUBJECT = '(件名なし)';

export function formatHistoryTime(epochMs: number): string {
  return formatDateTime(new Date(epochMs).toISOString(), { seconds: true });
}

export function formatSubject(subject: string): string {
  return subject.trim() || NO_SUBJECT;
}

export function formatAccountLabel(name: string, email: string): string {
  return name === email ? name : `${name} (${email})`;
}
