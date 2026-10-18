import { parse as parseToml } from 'smol-toml';
import { HttpError } from '../http/HttpError.js';
import { parsePermissions } from './parsePermissions.js';
import { parseSettings } from './parseSettings.js';
import {
  PLUGIN_ID_MAX,
  PLUGIN_ID_PATTERN,
  SUPPORTED_SPINEL_API,
  type PluginBuild,
  type PluginEntry,
  type PluginManifest,
} from './types.js';
import {
  fail,
  fieldPath,
  optionalString,
  optionalTable,
  readRelativePath,
  requireString,
  requireTable,
  toHttpError,
  type Table,
} from './readers.js';

const ENTRY_PATTERN = /\.m?js$/;

export const MANIFEST_FILE_NAME = 'plugin.toml';

const readPluginId = (table: Table): string => {
  const id = requireString(table, 'id', '', PLUGIN_ID_MAX);
  if (!PLUGIN_ID_PATTERN.test(id)) return fail('id', '小文字英数字とハイフンだけを使ってください(例: my-plugin)');
  return id;
};

const readSpinelApi = (table: Table): number => {
  const value = table['spinel_api'];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return fail('spinel_api', '1 以上の整数を指定してください');
  }
  if (value !== SUPPORTED_SPINEL_API) {
    throw new HttpError(
      400,
      'unsupported_spinel_api',
      `このノードは spinel_api = ${SUPPORTED_SPINEL_API} のプラグインだけに対応しています(指定: ${value})`,
    );
  }
  return value;
};

const readEntry = (root: Table, section: 'server' | 'front'): PluginEntry | null => {
  const table = optionalTable(root, section, '');
  if (table === null) return null;
  const entry = readRelativePath(table, 'entry', section);
  if (!ENTRY_PATTERN.test(entry))
    return fail(fieldPath(section, 'entry'), '.js または .mjs のファイルを指定してください');
  if (!entry.startsWith(`${section}/`)) {
    return fail(fieldPath(section, 'entry'), `${section}/ ディレクトリ配下のファイルを指定してください`);
  }
  return { entry };
};

const readBuild = (root: Table): PluginBuild | null => {
  const table = optionalTable(root, 'build', '');
  if (table === null) return null;
  return { command: requireString(table, 'command', 'build', 1024) };
};

const buildManifest = (root: Table): PluginManifest => {
  const permissions = parsePermissions(optionalTable(root, 'permissions', ''), 'permissions');
  const build = readBuild(root);
  if (build !== null && !permissions.build) {
    return fail('build', '[build] を使うには permissions.build = true が必要です');
  }

  const server = readEntry(root, 'server');
  const front = readEntry(root, 'front');
  if (server === null && front === null) {
    return fail('(entry)', '[server] または [front] のどちらかは必要です');
  }
  return {
    id: readPluginId(root),
    name: requireString(root, 'name', '', 128),
    version: requireString(root, 'version', '', 64),
    description: optionalString(root, 'description', '', 512),
    spinelApi: readSpinelApi(root),
    server,
    front,
    build,
    permissions,
    settings: parseSettings(root, ''),
  };
};

export const parsePluginManifest = (text: string): PluginManifest => {
  try {
    return buildManifest(requireTable(parseToml(text), ''));
  } catch (error) {
    throw toHttpError(error, 'invalid_plugin_manifest', MANIFEST_FILE_NAME);
  }
};
