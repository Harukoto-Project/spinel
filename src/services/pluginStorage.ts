import { invoke } from '@tauri-apps/api/core';
import type { Plugin, PluginPermissions, PluginRepository, PluginSettingsUpdate } from '@/types/plugin';

export function loadPluginRepositories(nodeId: string): Promise<PluginRepository[]> {
  return invoke<PluginRepository[]>('load_plugin_repositories', { nodeId });
}

export function addPluginRepository(nodeId: string, url: string): Promise<PluginRepository[]> {
  return invoke<PluginRepository[]>('add_plugin_repository', { nodeId, url });
}

export function refreshPluginRepository(nodeId: string, repoId: string): Promise<PluginRepository[]> {
  return invoke<PluginRepository[]>('refresh_plugin_repository', { nodeId, repoId });
}

export function deletePluginRepository(nodeId: string, repoId: string): Promise<PluginRepository[]> {
  return invoke<PluginRepository[]>('delete_plugin_repository', { nodeId, repoId });
}

export function loadPlugins(nodeId: string): Promise<Plugin[]> {
  return invoke<Plugin[]>('load_plugins', { nodeId });
}

export function enablePlugin(
  nodeId: string,
  pluginId: string,
  grantedPermissions: PluginPermissions,
): Promise<Plugin[]> {
  return invoke<Plugin[]>('enable_plugin', { nodeId, pluginId, grantedPermissions });
}

export function disablePlugin(nodeId: string, pluginId: string): Promise<Plugin[]> {
  return invoke<Plugin[]>('disable_plugin', { nodeId, pluginId });
}

export function savePluginSettings(
  nodeId: string,
  pluginId: string,
  values: PluginSettingsUpdate,
): Promise<Plugin[]> {
  return invoke<Plugin[]>('save_plugin_settings', { nodeId, pluginId, values });
}

export function fetchPluginAsset(nodeId: string, pluginId: string, path: string): Promise<string> {
  return invoke<string>('fetch_plugin_asset', { nodeId, pluginId, path });
}
