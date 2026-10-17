const shortFormatter = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const longFormatter = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export const EMPTY_VALUE = '—';

export function formatDateTime(iso: string | null, options: { seconds?: boolean } = {}): string {
  if (iso === null) return EMPTY_VALUE;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return (options.seconds ? longFormatter : shortFormatter).format(date);
}

export function formatPing(pingMs: number | null): string {
  return pingMs === null ? EMPTY_VALUE : `${pingMs} ms`;
}
