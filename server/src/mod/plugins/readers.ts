import { HttpError } from '../http/HttpError.js';

export class ManifestValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ManifestValidationError';
  }
}

export const toHttpError = (error: unknown, code: string, label: string): HttpError => {
  if (error instanceof HttpError) return error;
  const detail = error instanceof Error ? error.message : String(error);
  return new HttpError(400, code, `${label} が不正です: ${detail}`);
};

export type Table = Record<string, unknown>;

export const isTable = (value: unknown): value is Table =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const fieldPath = (parent: string, key: string): string => (parent === '' ? key : `${parent}.${key}`);

export const fail = (path: string, message: string): never => {
  throw new ManifestValidationError(`${path === '' ? '(root)' : path}: ${message}`);
};

export const requireTable = (value: unknown, path: string): Table => {
  if (!isTable(value)) return fail(path, 'テーブル(オブジェクト)で指定してください');
  return value;
};

export const optionalTable = (parent: Table, key: string, path: string): Table | null => {
  const value = parent[key];
  if (value === undefined) return null;
  return requireTable(value, fieldPath(path, key));
};

export const requireString = (parent: Table, key: string, path: string, max = 256): string => {
  const at = fieldPath(path, key);
  const value = parent[key];
  if (typeof value !== 'string' || value.trim() === '') return fail(at, '空でない文字列を指定してください');
  const trimmed = value.trim();
  if (trimmed.length > max) return fail(at, `${max}文字以内にしてください`);
  return trimmed;
};

export const optionalString = (parent: Table, key: string, path: string, max = 1024): string | null => {
  if (parent[key] === undefined) return null;
  return requireString(parent, key, path, max);
};

export const optionalBoolean = (parent: Table, key: string, path: string, fallback: boolean): boolean => {
  const value = parent[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') return fail(fieldPath(path, key), 'true / false を指定してください');
  return value;
};

export const optionalStringArray = (parent: Table, key: string, path: string): string[] | null => {
  const value = parent[key];
  if (value === undefined) return null;
  const at = fieldPath(path, key);
  if (!Array.isArray(value)) return fail(at, '文字列の配列で指定してください');
  return value.map((item, index) => {
    if (typeof item !== 'string' || item.trim() === '')
      return fail(`${at}[${index}]`, '空でない文字列を指定してください');
    return item.trim();
  });
};

export const optionalTableArray = (parent: Table, key: string, path: string): Table[] => {
  const value = parent[key];
  if (value === undefined) return [];
  const at = fieldPath(path, key);
  if (!Array.isArray(value)) return fail(at, 'テーブルの配列で指定してください');
  return value.map((item, index) => requireTable(item, `${at}[${index}]`));
};

export const readRelativePath = (parent: Table, key: string, path: string): string => {
  const at = fieldPath(path, key);
  const value = requireString(parent, key, path, 512);
  if (value.includes('\\')) return fail(at, 'パス区切りには / を使ってください');
  if (value.startsWith('/') || /^[A-Za-z]:/.test(value)) return fail(at, '相対パスで指定してください');
  const segments = value.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    return fail(at, '空・"."・".." を含むパスは使えません');
  }
  return segments.join('/');
};
