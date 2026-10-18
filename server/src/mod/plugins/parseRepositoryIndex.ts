import { PLUGIN_ID_MAX, PLUGIN_ID_PATTERN, REPOSITORY_INDEX_SCHEMA, type RepositoryIndex } from './types.js';
import {
  fail,
  fieldPath,
  optionalString,
  optionalTableArray,
  readRelativePath,
  requireString,
  requireTable,
  toHttpError,
  type Table,
} from './readers.js';

export const REPOSITORY_INDEX_FILE_NAME = 'repository.json';

const readSchema = (root: Table): number => {
  const value = root['schema'];
  if (value !== REPOSITORY_INDEX_SCHEMA) return fail('schema', `${REPOSITORY_INDEX_SCHEMA} のみ対応しています`);
  return value;
};

const buildIndex = (root: Table): RepositoryIndex => {
  const schema = readSchema(root);
  const name = requireString(root, 'name', '', 128);
  if (!Array.isArray(root['plugins'])) return fail('plugins', 'プラグインの配列で指定してください');

  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();

  const plugins = optionalTableArray(root, 'plugins', '').map((table, index) => {
    const at = `${fieldPath('', 'plugins')}[${index}]`;
    const id = requireString(table, 'id', at, PLUGIN_ID_MAX);
    if (!PLUGIN_ID_PATTERN.test(id)) {
      return fail(fieldPath(at, 'id'), '小文字英数字とハイフンだけを使ってください(例: my-plugin)');
    }
    if (seenIds.has(id)) return fail(fieldPath(at, 'id'), `"${id}" が重複しています`);
    seenIds.add(id);

    const path = readRelativePath(table, 'path', at);
    if (seenPaths.has(path)) return fail(fieldPath(at, 'path'), `"${path}" が重複しています`);
    seenPaths.add(path);

    return {
      id,
      path,
      name: requireString(table, 'name', at, 128),
      description: optionalString(table, 'description', at, 512),
      version: requireString(table, 'version', at, 64),
    };
  });

  return { schema, name, plugins };
};

export const parseRepositoryIndex = (text: string): RepositoryIndex => {
  try {
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return fail('(root)', 'JSON として解釈できません');
    }
    return buildIndex(requireTable(json, ''));
  } catch (error) {
    throw toHttpError(error, 'invalid_repository_index', REPOSITORY_INDEX_FILE_NAME);
  }
};
