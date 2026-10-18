import { HttpError } from '../http/HttpError.js';
import type { PluginSettingSchema } from './types.js';

const STRING_MAX = 4096;
const SECRET_MAX = 2048;

type StoredValue = string | number | boolean;

export interface SettingsPatch {
  config: Record<string, StoredValue | null>;
  secrets: Record<string, StoredValue | null>;
}

export const isValidSettingValue = (schema: PluginSettingSchema, value: unknown): value is StoredValue => {
  switch (schema.type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'select':
      return typeof value === 'string' && (schema.options?.includes(value) ?? false);
    case 'secret':
      return typeof value === 'string' && value !== '' && value.length <= SECRET_MAX;
    default:
      return typeof value === 'string' && value.length <= STRING_MAX;
  }
};

const invalid = (key: string, message: string): HttpError =>
  new HttpError(400, 'invalid_plugin_settings', `設定 "${key}" が不正です: ${message}`);

export const buildSettingsPatch = (
  schemas: readonly PluginSettingSchema[],
  update: Record<string, unknown>,
): SettingsPatch => {
  const byKey = new Map(schemas.map((schema) => [schema.key, schema]));
  const patch: SettingsPatch = { config: {}, secrets: {} };

  for (const [key, value] of Object.entries(update)) {
    const schema = byKey.get(key);
    if (schema === undefined) throw invalid(key, 'このプラグインに存在しない設定です');

    const target = schema.type === 'secret' ? patch.secrets : patch.config;
    if (value === null) {
      target[key] = null;
      continue;
    }
    if (!isValidSettingValue(schema, value)) throw invalid(key, `${schema.label} の値の形式が正しくありません`);
    target[key] = value;
  }
  return patch;
};

export const applyPatch = (
  current: Record<string, unknown>,
  patch: Record<string, StoredValue | null>,
): Record<string, unknown> => {
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete next[key];
    else next[key] = value;
  }
  return next;
};

export const pickValidValues = (
  schemas: readonly PluginSettingSchema[],
  stored: Record<string, unknown>,
): Record<string, StoredValue> => {
  const result: Record<string, StoredValue> = {};
  for (const schema of schemas) {
    if (schema.type === 'secret') continue;
    const value = stored[schema.key];
    if (isValidSettingValue(schema, value)) result[schema.key] = value;
  }
  return result;
};
