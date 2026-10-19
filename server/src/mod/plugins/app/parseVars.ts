import { fail, fieldPath, optionalTable, requireString, type Table } from '../readers.js';
import { APP_PLATFORMS, type AppPlatform, type PluginVars } from './appTypes.js';
import { validatePlaceholders, type PlaceholderScope } from './placeholders.js';

const VAR_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const RESERVED_PREFIXES = ['source', 'plugin', 'data', 'setting', 'input'];
const VARS_MAX = 32;

const readTable = (table: Table, path: string, scope: PlaceholderScope): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(table)) {
    if (APP_PLATFORMS.includes(key as AppPlatform) && typeof value === 'object') continue;
    const at = fieldPath(path, key);
    if (!VAR_NAME_PATTERN.test(key)) return fail(at, '英字で始まる英数字と _ だけを使ってください');
    if (RESERVED_PREFIXES.includes(key)) return fail(at, `"${key}" は予約されているため変数名に使えません`);
    const text = requireString(table, key, path, 1024);
    validatePlaceholders(text, at, scope);
    result[key] = text;
  }
  if (Object.keys(result).length > VARS_MAX) return fail(path, `変数は ${VARS_MAX} 個までです`);
  return result;
};

export const parseVars = (root: Table, hasSource: boolean): PluginVars => {
  const table = optionalTable(root, 'vars', '');
  if (table === null) return { base: {}, platforms: {} };

  const scope: PlaceholderScope = {
    vars: new Set(),
    hasSource,
    settings: new Map(),
    inputs: new Set(),
    allowSecret: false,
  };

  const platforms: PluginVars['platforms'] = {};
  for (const platform of APP_PLATFORMS) {
    const sub = optionalTable(table, platform, 'vars');
    if (sub !== null) platforms[platform] = readTable(sub, fieldPath('vars', platform), scope);
  }

  return { base: readTable(table, 'vars', scope), platforms };
};

export const collectVarNames = (vars: PluginVars): Set<string> => {
  const names = new Set(Object.keys(vars.base));
  for (const platform of APP_PLATFORMS) {
    for (const key of Object.keys(vars.platforms[platform] ?? {})) names.add(key);
  }
  return names;
};

export const verifyVarsCoverage = (vars: PluginVars): void => {
  for (const platform of APP_PLATFORMS) {
    const merged = { ...vars.base, ...vars.platforms[platform] };
    for (const name of collectVarNames(vars)) {
      if (merged[name] === undefined) {
        return fail(
          fieldPath('vars', name),
          `${platform} 向けの値がありません(共通の値か [vars.${platform}] で指定してください)`,
        );
      }
    }
  }
};
