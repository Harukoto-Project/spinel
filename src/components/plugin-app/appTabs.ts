import type { PluginAppView, PluginPanel } from '@/types/pluginApp';

export const SETUP_TAB_ID = '__setup';
const DEFAULT_TAB_LABEL = 'メイン';

export type AppTab = {
  id: string;
  label: string;
  panels: PluginPanel[];
};

export function buildAppTabs(app: PluginAppView): AppTab[] {
  const tabs: AppTab[] = [];

  if (app.source !== null || app.setup.length > 0) {
    tabs.push({ id: SETUP_TAB_ID, label: 'セットアップ', panels: [] });
  }

  for (const panel of app.panels) {
    const label = panel.tab ?? DEFAULT_TAB_LABEL;
    const id = `tab:${label}`;
    const existing = tabs.find((tab) => tab.id === id);
    if (existing) existing.panels.push(panel);
    else tabs.push({ id, label, panels: [panel] });
  }

  return tabs;
}
