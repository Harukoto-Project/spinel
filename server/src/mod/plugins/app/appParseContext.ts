import type { PluginSettingType } from '../types.js';
import { fail, fieldPath, type Table } from '../readers.js';
import { TIMEOUT_MAX_SEC } from './appTypes.js';
import { validatePlaceholders, type PlaceholderScope } from './placeholders.js';

export interface AppParseContext {
  hasSource: boolean;
  vars: ReadonlySet<string>;
  settings: ReadonlyMap<string, PluginSettingType>;
}

export const createScope = (
  context: AppParseContext,
  inputs: ReadonlySet<string>,
  allowSecret: boolean,
): PlaceholderScope => ({
  vars: context.vars,
  hasSource: context.hasSource,
  settings: context.settings,
  inputs,
  allowSecret,
});

const LINE_ITEMS_MAX = 64;
const LINE_ITEM_LENGTH_MAX = 1024;

export const readRunLine = (table: Table, at: string, scope: PlaceholderScope): string[] => {
  const key = 'run';
  const path = fieldPath(at, key);
  const value = table[key];
  if (!Array.isArray(value) || value.length === 0) {
    return fail(path, '実行するコマンドを文字列の配列で指定してください(例: ["{python}", "main.py"])');
  }
  if (value.length > LINE_ITEMS_MAX) return fail(path, `要素は ${LINE_ITEMS_MAX} 個までです`);
  return value.map((item, index) => {
    if (typeof item !== 'string' || item === '') return fail(`${path}[${index}]`, '空でない文字列を指定してください');
    if (item.length > LINE_ITEM_LENGTH_MAX)
      return fail(`${path}[${index}]`, `${LINE_ITEM_LENGTH_MAX}文字以内にしてください`);
    validatePlaceholders(item, `${path}[${index}]`, scope);
    return item;
  });
};

export const readTemplateList = (table: Table, key: string, at: string, scope: PlaceholderScope): string[] => {
  const value = table[key];
  if (value === undefined) return [];
  const path = fieldPath(at, key);
  if (!Array.isArray(value)) return fail(path, '文字列の配列で指定してください');
  if (value.length > LINE_ITEMS_MAX) return fail(path, `要素は ${LINE_ITEMS_MAX} 個までです`);
  return value.map((item, index) => {
    if (typeof item !== 'string') return fail(`${path}[${index}]`, '文字列を指定してください');
    if (item.length > LINE_ITEM_LENGTH_MAX)
      return fail(`${path}[${index}]`, `${LINE_ITEM_LENGTH_MAX}文字以内にしてください`);
    validatePlaceholders(item, `${path}[${index}]`, scope);
    return item;
  });
};

export const readTimeoutSec = (table: Table, at: string, fallback: number | null): number | null => {
  const value = table['timeout'];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > TIMEOUT_MAX_SEC) {
    return fail(fieldPath(at, 'timeout'), `1〜${TIMEOUT_MAX_SEC} の整数(秒)で指定してください`);
  }
  return value;
};
