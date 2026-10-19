import { createElement } from 'react';
import { Puzzle } from 'lucide-react';
import { PluginAppPage } from '@/components/plugin-app/PluginAppPage';
import { makePluginNavId, type RegisteredPluginPage } from '@/plugins/registeredPage';
import type { Plugin } from '@/types/plugin';

export const APP_PAGE_ID = '__app';
const APP_PAGE_GROUP = 'プラグイン';

export function hasAppPage(plugin: Plugin): boolean {
  return plugin.enabled && plugin.hasApp && plugin.app !== null;
}

export function createAppPage(plugin: Plugin): RegisteredPluginPage {
  return {
    navId: makePluginNavId(plugin.id, APP_PAGE_ID),
    pluginId: plugin.id,
    pluginName: plugin.name,
    pageId: APP_PAGE_ID,
    label: plugin.name,
    icon: Puzzle,
    group: APP_PAGE_GROUP,
    component: () => createElement(PluginAppPage, { pluginId: plugin.id }),
  };
}
