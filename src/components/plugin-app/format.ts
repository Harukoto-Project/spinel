export const EMPTY_VALUE = '—';

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatNumber(value: unknown): string {
  const number = toNumber(value);
  return number === null ? String(value) : number.toLocaleString('ja-JP');
}

export function formatPercent(value: unknown): string {
  const number = toNumber(value);
  if (number === null) return String(value);
  return `${Math.round(number * 10) / 10}%`;
}

export function formatDuration(value: unknown): string {
  const number = toNumber(value);
  if (number === null) return String(value);

  const total = Math.max(0, Math.round(number));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) return `${hours}時間${minutes}分`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
}

export function toDate(value: unknown): Date | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 1e12 ? value * 1000 : value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = toNumber(value);
    const date = numeric === null ? new Date(value) : toDate(numeric);
    return date !== null && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

export function formatDateTime(value: unknown): string {
  const date = toDate(value);
  return date === null ? String(value) : date.toLocaleString('ja-JP');
}

export function formatClock(value: number | null): string {
  if (value === null) return EMPTY_VALUE;
  return new Date(value).toLocaleTimeString('ja-JP');
}
