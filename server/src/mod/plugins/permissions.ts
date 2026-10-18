import type { PluginPermissions } from './types.js';

const FLAG_KEYS = ['routes', 'storage', 'notify', 'process', 'build'] as const;

export const isPermissionCovered = (required: PluginPermissions, granted: PluginPermissions): boolean => {
  if (FLAG_KEYS.some((key) => required[key] && !granted[key])) return false;
  if (granted.network.includes('*')) return true;
  return required.network.every((origin) => granted.network.includes(origin));
};
