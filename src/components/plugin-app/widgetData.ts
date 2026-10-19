import {
  EMPTY_VALUE,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  toNumber,
} from '@/components/plugin-app/format';

const TOKEN_PATTERN = /\.?([A-Za-z_][\w-]*)|\[(\d+|\*)\]/g;
const TEMPLATE_PATTERN = /\{\{|\}\}|\{([^{}]+)\}/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function resolvePath(data: unknown, path: string): unknown[] {
  let current: unknown[] = [data];

  for (const match of path.matchAll(TOKEN_PATTERN)) {
    const [, name, bracket] = match;
    const next: unknown[] = [];

    for (const item of current) {
      if (name !== undefined) {
        if (isRecord(item) && name in item) next.push(item[name]);
      } else if (Array.isArray(item)) {
        if (bracket === '*') next.push(...item);
        else if (bracket !== undefined && Number(bracket) < item.length) next.push(item[Number(bracket)]);
      }
    }

    current = next;
  }

  return current;
}

export function firstValue(data: unknown, path: string): unknown {
  return resolvePath(data, path)[0];
}

export function resolveRows(data: unknown, path: string): unknown[] {
  const resolved = resolvePath(data, path);
  if (resolved.length === 1 && Array.isArray(resolved[0])) return resolved[0] as unknown[];
  return resolved;
}

function formatWith(value: unknown, format: string | undefined): string {
  if (value === undefined || value === null) return EMPTY_VALUE;

  switch (format) {
    case 'number':
      return formatNumber(value);
    case 'percent':
      return formatPercent(value);
    case 'duration':
      return formatDuration(value);
    case 'datetime':
      return formatDateTime(value);
    default:
      break;
  }

  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'はい' : 'いいえ';
  if (typeof value === 'number') return String(value);
  return JSON.stringify(value);
}

export function renderTemplate(template: string, data: unknown): string {
  return template.replace(TEMPLATE_PATTERN, (match, expression: string | undefined) => {
    if (match === '{{') return '{';
    if (match === '}}') return '}';
    const [path = '', format] = (expression ?? '').split('|').map((part) => part.trim());
    return formatWith(firstValue(data, path), format);
  });
}

export function readPercent(data: unknown, path: string): number | null {
  const number = toNumber(firstValue(data, path));
  return number === null ? null : Math.min(100, Math.max(0, number));
}

export function readText(data: unknown, path: string): string | null {
  const value = firstValue(data, path);
  return value === undefined || value === null ? null : String(value);
}
