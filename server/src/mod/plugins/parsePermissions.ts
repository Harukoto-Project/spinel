import type { PluginPermissions } from './types.js';
import { fail, fieldPath, optionalBoolean, optionalStringArray, type Table } from './readers.js';

const NETWORK_ALL = '*';

const normalizeOrigin = (value: string, path: string): string => {
  if (value === NETWORK_ALL) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return fail(path, `"${value}" は URL として解釈できません`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:')
    return fail(path, 'http / https のオリジンを指定してください');
  if (url.origin !== value && `${url.origin}/` !== value) {
    return fail(path, `パスを含めずオリジンだけを指定してください(例: ${url.origin})`);
  }
  return url.origin;
};

export const parsePermissions = (table: Table | null, path: string): PluginPermissions => {
  const source = table ?? {};
  const networkAt = fieldPath(path, 'network');
  const rawNetwork = optionalStringArray(source, 'network', path) ?? [];
  const network = [...new Set(rawNetwork.map((origin, index) => normalizeOrigin(origin, `${networkAt}[${index}]`)))];

  return {
    routes: optionalBoolean(source, 'routes', path, false),
    storage: optionalBoolean(source, 'storage', path, false),
    notify: optionalBoolean(source, 'notify', path, false),
    process: optionalBoolean(source, 'process', path, false),
    build: optionalBoolean(source, 'build', path, false),
    network,
  };
};
