import {
  fail,
  fieldPath,
  optionalBoolean,
  optionalString,
  optionalStringArray,
  optionalTableArray,
  requireString,
  type Table,
} from '../readers.js';
import {
  INPUT_DISPLAYS,
  INPUT_TYPES,
  type PluginCommandInput,
  type PluginInputDefault,
  type PluginInputDisplay,
  type PluginInputType,
} from './appTypes.js';

const INPUT_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const ARG_PATTERN = /^-\S*$/;
const INPUTS_MAX = 16;
const OPTIONS_MAX = 32;

const readType = (table: Table, at: string): PluginInputType => {
  const value = requireString(table, 'type', at, 16);
  const found = INPUT_TYPES.find((type) => type === value);
  if (found === undefined) return fail(fieldPath(at, 'type'), `${INPUT_TYPES.join(' / ')} のいずれかを指定してください`);
  return found;
};

const readOptions = (table: Table, type: PluginInputType, at: string): string[] | null => {
  const options = optionalStringArray(table, 'options', at);
  if (type !== 'choice') {
    if (options !== null) return fail(fieldPath(at, 'options'), 'options は choice 型でのみ指定できます');
    return null;
  }
  if (options === null || options.length === 0) return fail(fieldPath(at, 'options'), 'choice 型には options が必要です');
  if (options.length > OPTIONS_MAX) return fail(fieldPath(at, 'options'), `選択肢は ${OPTIONS_MAX} 個までです`);
  if (new Set(options).size !== options.length) return fail(fieldPath(at, 'options'), '選択肢が重複しています');
  return options;
};

const readDefault = (
  table: Table,
  type: PluginInputType,
  options: string[] | null,
  at: string,
): PluginInputDefault | null => {
  const value = table['default'];
  if (value === undefined) return null;
  const path = fieldPath(at, 'default');

  switch (type) {
    case 'boolean':
      if (typeof value !== 'boolean') return fail(path, 'true / false を指定してください');
      return value;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return fail(path, '数値を指定してください');
      return value;
    case 'choice':
      if (typeof value !== 'string' || options === null || !options.includes(value)) {
        return fail(path, 'options に含まれる値を指定してください');
      }
      return value;
    case 'string':
      if (typeof value !== 'string') return fail(path, '文字列を指定してください');
      return value;
  }
};

const readArgName = (table: Table, key: 'arg' | 'flag', at: string): string | null => {
  const value = optionalString(table, key, at, 64);
  if (value === null) return null;
  if (!ARG_PATTERN.test(value)) {
    return fail(fieldPath(at, key), '"-" で始まり空白を含まない文字列を指定してください(例: --month)');
  }
  return value;
};

const readDisplay = (table: Table, type: PluginInputType, at: string): PluginInputDisplay | null => {
  if (table['display'] === undefined) return null;
  if (type !== 'choice') return fail(fieldPath(at, 'display'), 'display は choice 型でのみ指定できます');
  const value = requireString(table, 'display', at, 16);
  const found = INPUT_DISPLAYS.find((display) => display === value);
  if (found === undefined) return fail(fieldPath(at, 'display'), `${INPUT_DISPLAYS.join(' / ')} のいずれかを指定してください`);
  return found;
};

export const parseInputs = (commandTable: Table, commandAt: string): PluginCommandInput[] => {
  const tables = optionalTableArray(commandTable, 'inputs', commandAt);
  if (tables.length > INPUTS_MAX) return fail(fieldPath(commandAt, 'inputs'), `入力は ${INPUTS_MAX} 個までです`);

  const seen = new Set<string>();
  return tables.map((table, index) => {
    const at = `${fieldPath(commandAt, 'inputs')}[${index}]`;
    const key = requireString(table, 'key', at, 64);
    if (!INPUT_KEY_PATTERN.test(key)) return fail(fieldPath(at, 'key'), '英字で始まる英数字と _ だけを使ってください');
    if (seen.has(key)) return fail(fieldPath(at, 'key'), `"${key}" が重複しています`);
    seen.add(key);

    const type = readType(table, at);
    const options = readOptions(table, type, at);
    const arg = readArgName(table, 'arg', at);
    const flag = readArgName(table, 'flag', at);
    if (type === 'boolean' && arg !== null) return fail(fieldPath(at, 'arg'), 'boolean 型には arg ではなく flag を使ってください');
    if (type !== 'boolean' && flag !== null) return fail(fieldPath(at, 'flag'), 'flag は boolean 型でのみ指定できます');

    return {
      key,
      type,
      label: requireString(table, 'label', at, 128),
      description: optionalString(table, 'description', at, 512),
      options,
      default: readDefault(table, type, options, at),
      required: optionalBoolean(table, 'required', at, false),
      arg,
      flag,
      display: readDisplay(table, type, at),
    };
  });
};
