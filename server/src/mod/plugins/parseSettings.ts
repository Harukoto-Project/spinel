import {
  PLUGIN_SETTING_TYPES,
  type PluginSettingDefault,
  type PluginSettingSchema,
  type PluginSettingType,
} from './types.js';
import {
  fail,
  fieldPath,
  optionalBoolean,
  optionalString,
  optionalStringArray,
  optionalTableArray,
  requireString,
  type Table,
} from './readers.js';

const SETTING_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

const readType = (table: Table, path: string): PluginSettingType => {
  const value = requireString(table, 'type', path, 16);
  const found = PLUGIN_SETTING_TYPES.find((type) => type === value);
  if (found === undefined) {
    return fail(fieldPath(path, 'type'), `${PLUGIN_SETTING_TYPES.join(' / ')} のいずれかを指定してください`);
  }
  return found;
};

const readDefault = (
  table: Table,
  type: PluginSettingType,
  options: string[] | null,
  path: string,
): PluginSettingDefault | null => {
  const value = table['default'];
  if (value === undefined) return null;
  const at = fieldPath(path, 'default');

  switch (type) {
    case 'secret':
      return fail(at, 'secret 型には default を指定できません');
    case 'boolean':
      if (typeof value !== 'boolean') return fail(at, 'true / false を指定してください');
      return value;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return fail(at, '数値を指定してください');
      return value;
    case 'select':
      if (typeof value !== 'string' || options === null || !options.includes(value)) {
        return fail(at, 'options に含まれる値を指定してください');
      }
      return value;
    case 'string':
    case 'path':
      if (typeof value !== 'string') return fail(at, '文字列を指定してください');
      return value;
  }
};

export const parseSettings = (source: Table, path: string): PluginSettingSchema[] => {
  const tables = optionalTableArray(source, 'settings', path);
  const seen = new Set<string>();

  return tables.map((table, index) => {
    const at = `${fieldPath(path, 'settings')}[${index}]`;
    const key = requireString(table, 'key', at, 64);
    if (!SETTING_KEY_PATTERN.test(key)) {
      return fail(fieldPath(at, 'key'), '英字で始まる英数字と _ だけを使ってください');
    }
    if (seen.has(key)) return fail(fieldPath(at, 'key'), `"${key}" が重複しています`);
    seen.add(key);

    const type = readType(table, at);
    const options = optionalStringArray(table, 'options', at);
    if (type === 'select' && (options === null || options.length === 0)) {
      return fail(fieldPath(at, 'options'), 'select 型には options が必要です');
    }
    if (type !== 'select' && options !== null) {
      return fail(fieldPath(at, 'options'), 'options は select 型でのみ指定できます');
    }

    return {
      key,
      type,
      label: requireString(table, 'label', at, 128),
      description: optionalString(table, 'description', at, 512),
      default: readDefault(table, type, options, at),
      required: optionalBoolean(table, 'required', at, false),
      options,
    };
  });
};
