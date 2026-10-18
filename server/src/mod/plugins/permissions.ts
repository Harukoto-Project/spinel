import type { PluginPermissions } from './types.js';

const FLAG_KEYS = ['routes', 'storage', 'notify', 'process', 'build'] as const;

export const isPermissionCovered = (required: PluginPermissions, granted: PluginPermissions): boolean => {
  if (FLAG_KEYS.some((key) => required[key] && !granted[key])) return false;
  if (granted.network.includes('*')) return true;
  return required.network.every((origin) => granted.network.includes(origin));
};

export const isSamePermissions = (a: PluginPermissions, b: PluginPermissions): boolean =>
  FLAG_KEYS.every((key) => a[key] === b[key]) &&
  new Set(a.network).size === new Set(b.network).size &&
  a.network.every((origin) => b.network.includes(origin));

export const normalizePermissions = (value: PluginPermissions): PluginPermissions => ({
  routes: value.routes,
  storage: value.storage,
  notify: value.notify,
  process: value.process,
  build: value.build,
  network: [...new Set(value.network)],
});
