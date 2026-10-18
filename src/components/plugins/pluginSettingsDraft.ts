import type { Plugin, PluginSettingSchema, PluginSettingsUpdate } from '@/types/plugin';

export type SettingsDraft = Record<string, string | boolean>;

function storedValue(plugin: Plugin, schema: PluginSettingSchema) {
  return plugin.settingValues[schema.key];
}

function initialBoolean(plugin: Plugin, schema: PluginSettingSchema): boolean {
  const stored = storedValue(plugin, schema);
  if (typeof stored === 'boolean') return stored;
  return typeof schema.default === 'boolean' ? schema.default : false;
}

export function createSettingsDraft(plugin: Plugin): SettingsDraft {
  const draft: SettingsDraft = {};
  for (const schema of plugin.settings) {
    if (schema.type === 'boolean') {
      draft[schema.key] = initialBoolean(plugin, schema);
    } else if (schema.type === 'secret') {
      draft[schema.key] = '';
    } else {
      draft[schema.key] = String(storedValue(plugin, schema) ?? '');
    }
  }
  return draft;
}

export function isNumberDraftValid(raw: string): boolean {
  return raw.trim() === '' || Number.isFinite(Number(raw));
}

export function isSettingsDraftValid(plugin: Plugin, draft: SettingsDraft): boolean {
  return plugin.settings.every(
    (schema) => schema.type !== 'number' || isNumberDraftValid(String(draft[schema.key] ?? '')),
  );
}

export function buildSettingsUpdate(plugin: Plugin, draft: SettingsDraft): PluginSettingsUpdate {
  const update: PluginSettingsUpdate = {};

  for (const schema of plugin.settings) {
    const value = draft[schema.key];

    if (schema.type === 'boolean') {
      if (typeof value === 'boolean' && value !== initialBoolean(plugin, schema)) update[schema.key] = value;
      continue;
    }

    const text = String(value ?? '').trim();

    if (schema.type === 'secret') {
      if (text !== '') update[schema.key] = text;
      continue;
    }

    if (text === String(storedValue(plugin, schema) ?? '')) continue;
    if (text === '') update[schema.key] = null;
    else update[schema.key] = schema.type === 'number' ? Number(text) : text;
  }

  return update;
}

export function findMissingRequiredSettings(plugin: Plugin): PluginSettingSchema[] {
  return plugin.settings.filter((schema) => {
    if (!schema.required) return false;
    if (schema.type === 'secret') return !plugin.secretsSet.includes(schema.key);
    if (schema.type === 'boolean') return false;
    return storedValue(plugin, schema) === undefined && schema.default === null;
  });
}
