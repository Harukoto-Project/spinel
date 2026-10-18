import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export const PLUGIN_NAV_PREFIX = 'plugin:';

export type RegisteredPluginPage = {
  navId: string;
  pluginId: string;
  pluginName: string;
  pageId: string;
  label: string;
  icon: LucideIcon;
  group: string;
  component: ComponentType;
};

export function makePluginNavId(pluginId: string, pageId: string): string {
  return `${PLUGIN_NAV_PREFIX}${pluginId}:${pageId}`;
}

export function isPluginNavId(id: string): boolean {
  return id.startsWith(PLUGIN_NAV_PREFIX);
}
