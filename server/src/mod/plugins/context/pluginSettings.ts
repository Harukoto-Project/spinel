import os from 'node:os';
import path from 'node:path';
import type { PluginStore } from '../PluginStore.js';
import type { PluginSettingSchema } from '../types.js';
import type { PluginSettings, PluginSettingsApi, PluginSettingValue } from './contextTypes.js';

const expandHome = (value: string): string => {
  if (value === '~') return os.homedir();
  if (value.startsWith('~/') || value.startsWith('~\\')) return path.join(os.homedir(), value.slice(2));
  return value;
};

const acceptable = (schema: PluginSettingSchema, value: unknown): value is Exclude<PluginSettingValue, null> => {
  switch (schema.type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'select':
      return typeof value === 'string' && (schema.options?.includes(value) ?? false);
    default:
      return typeof value === 'string';
  }
};

export const resolveSettings = (
  schemas: readonly PluginSettingSchema[],
  values: Record<string, unknown>,
  secrets: Record<string, unknown>,
): PluginSettings => {
  const result: PluginSettings = {};
  for (const schema of schemas) {
    const stored = schema.type === 'secret' ? secrets[schema.key] : values[schema.key];
    const value: PluginSettingValue = acceptable(schema, stored) ? stored : schema.default;
    result[schema.key] = schema.type === 'path' && typeof value === 'string' && value !== '' ? expandHome(value) : value;
  }
  return result;
};

export const createPluginSettings = (
  store: PluginStore,
  pluginId: string,
  schemas: readonly PluginSettingSchema[],
): PluginSettingsApi => ({
  async get(): Promise<PluginSettings> {
    const { values, secrets } = await store.getStoredSettings(pluginId);
    return resolveSettings(schemas, values, secrets);
  },
});
