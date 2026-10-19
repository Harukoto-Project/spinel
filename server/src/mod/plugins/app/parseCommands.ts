import {
  fail,
  fieldPath,
  optionalString,
  optionalTable,
  optionalTableArray,
  readRelativePath,
  requireString,
  type Table,
} from '../readers.js';
import { createScope, readRunLine, readTemplateList, readTimeoutSec, type AppParseContext } from './appParseContext.js';
import { COMMAND_KINDS, QUERY_TIMEOUT_DEFAULT_SEC, type PluginCommand, type PluginCommandKind } from './appTypes.js';
import { ID_PATTERN } from './idPattern.js';
import { parseInputs } from './parseInputs.js';
import { validatePlaceholders } from './placeholders.js';

const COMMANDS_MAX = 32;
const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ENV_MAX = 32;

const readKind = (table: Table, at: string): PluginCommandKind => {
  if (table['kind'] === undefined) return 'task';
  const value = requireString(table, 'kind', at, 16);
  const found = COMMAND_KINDS.find((kind) => kind === value);
  if (found === undefined)
    return fail(fieldPath(at, 'kind'), `${COMMAND_KINDS.join(' / ')} のいずれかを指定してください`);
  return found;
};

const readEnv = (table: Table, at: string, validate: (text: string, path: string) => void): Record<string, string> => {
  const env = optionalTable(table, 'env', at);
  if (env === null) return {};
  const entries = Object.keys(env);
  if (entries.length > ENV_MAX) return fail(fieldPath(at, 'env'), `環境変数は ${ENV_MAX} 個までです`);

  const result: Record<string, string> = {};
  for (const key of entries) {
    const path = fieldPath(fieldPath(at, 'env'), key);
    if (!ENV_KEY_PATTERN.test(key)) return fail(path, '環境変数名は英数字と _ だけを使ってください');
    const value = env[key];
    if (typeof value !== 'string') return fail(path, '文字列を指定してください');
    if (value.length > 1024) return fail(path, '1024文字以内にしてください');
    validate(value, path);
    result[key] = value;
  }
  return result;
};

export const parseCommands = (root: Table, context: AppParseContext): PluginCommand[] => {
  const tables = optionalTableArray(root, 'commands', '');
  if (tables.length > COMMANDS_MAX) return fail('commands', `コマンドは ${COMMANDS_MAX} 個までです`);

  const seen = new Set<string>();
  return tables.map((table, index) => {
    const at = `commands[${index}]`;
    const id = requireString(table, 'id', at, 32);
    if (!ID_PATTERN.test(id))
      return fail(fieldPath(at, 'id'), '小文字英字で始まる小文字英数字・-・_ だけを使ってください');
    if (seen.has(id)) return fail(fieldPath(at, 'id'), `"${id}" が重複しています`);
    seen.add(id);

    const kind = readKind(table, at);
    const inputs = parseInputs(table, at);
    const inputKeys = new Set(inputs.map((input) => input.key));
    const runScope = createScope(context, inputKeys, false);
    const secretScope = createScope(context, inputKeys, true);

    const exclusive = optionalString(table, 'exclusive', at, 32);
    if (exclusive !== null) {
      if (!ID_PATTERN.test(exclusive))
        return fail(fieldPath(at, 'exclusive'), '小文字英字で始まる小文字英数字・-・_ だけを使ってください');
      if (kind === 'query') return fail(fieldPath(at, 'exclusive'), 'query コマンドには exclusive を指定できません');
    }

    return {
      id,
      label: requireString(table, 'label', at, 128),
      description: optionalString(table, 'description', at, 512),
      kind,
      run: readRunLine(table, at, runScope),
      cwd: table['cwd'] === undefined ? null : readRelativePath(table, 'cwd', at),
      stdin: readTemplateList(table, 'stdin', at, secretScope),
      env: readEnv(table, at, (text, path) => validatePlaceholders(text, path, secretScope)),
      exclusive,
      timeoutSec: readTimeoutSec(table, at, kind === 'query' ? QUERY_TIMEOUT_DEFAULT_SEC : null),
      inputs,
    };
  });
};
