import { describeError } from '@/lib/errors';
import type { HostApi, PluginPageDefinition, PluginRequestInit } from '@/plugins/hostTypes';
import { makePluginNavId, type RegisteredPluginPage } from '@/plugins/registeredPage';
import { resolvePageIcon } from '@/plugins/resolvePageIcon';
import { loadPlugins, requestPluginApi } from '@/services/pluginStorage';
import type { Plugin, PluginSettingValue } from '@/types/plugin';

const PAGE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const LABEL_MAX_LENGTH = 40;

export type FrontSession = {
  pages: RegisteredPluginPage[];
  callbacks: Array<() => void | Promise<void>>;
  sealed: boolean;
};

export function createFrontSession(): FrontSession {
  return { pages: [], callbacks: [], sealed: false };
}

function assertPageDefinition(session: FrontSession, page: PluginPageDefinition): void {
  if (session.sealed) {
    throw new Error('registerPage は activate の実行中にだけ呼び出せます');
  }
  if (typeof page?.id !== 'string' || !PAGE_ID_PATTERN.test(page.id)) {
    throw new Error('ページの id は英数字・ハイフン・アンダースコアの64文字以内で指定してください');
  }
  if (typeof page.label !== 'string' || page.label.trim() === '' || page.label.length > LABEL_MAX_LENGTH) {
    throw new Error(`ページの label は1〜${LABEL_MAX_LENGTH}文字で指定してください`);
  }
  if (page.icon !== undefined && typeof page.icon !== 'string') {
    throw new Error('ページの icon は lucide のアイコン名(文字列)で指定してください');
  }
  if (page.group !== undefined && (typeof page.group !== 'string' || page.group.trim() === '')) {
    throw new Error('ページの group は空でない文字列で指定してください');
  }
  const componentType = typeof page.component;
  if (page.component === null || (componentType !== 'function' && componentType !== 'object')) {
    throw new Error('ページの component に React コンポーネントを指定してください');
  }
  if (session.pages.some((registered) => registered.pageId === page.id)) {
    throw new Error(`ページの id が重複しています: ${page.id}`);
  }
}

function resolveEffectiveSettings(plugin: Plugin): Record<string, PluginSettingValue> {
  const values: Record<string, PluginSettingValue> = {};
  for (const schema of plugin.settings) {
    if (schema.type === 'secret') continue;
    const value = plugin.settingValues[schema.key] ?? schema.default;
    if (value !== null && value !== undefined) values[schema.key] = value;
  }
  return values;
}

export function createHostApi(nodeId: string, plugin: Plugin, session: FrontSession): HostApi {
  return {
    pluginId: plugin.id,
    registerPage(page) {
      assertPageDefinition(session, page);
      session.pages.push({
        navId: makePluginNavId(plugin.id, page.id),
        pluginId: plugin.id,
        pluginName: plugin.name,
        pageId: page.id,
        label: page.label.trim(),
        icon: resolvePageIcon(page.icon),
        group: page.group?.trim() ?? plugin.name,
        component: page.component,
      });
    },
    api: {
      async request<T = unknown>(path: string, init?: PluginRequestInit): Promise<T> {
        try {
          const result = await requestPluginApi(nodeId, plugin.id, init?.method ?? 'GET', path, init?.body);
          return result as T;
        } catch (caught) {
          throw new Error(describeError(caught));
        }
      },
    },
    settings: {
      async get() {
        const plugins = await loadPlugins(nodeId).catch((caught: unknown) => {
          throw new Error(describeError(caught));
        });
        const latest = plugins.find((candidate) => candidate.id === plugin.id);
        return resolveEffectiveSettings(latest ?? plugin);
      },
    },
    onDeactivate(callback) {
      if (typeof callback !== 'function') {
        throw new Error('onDeactivate には関数を指定してください');
      }
      session.callbacks.push(callback);
    },
  };
}
