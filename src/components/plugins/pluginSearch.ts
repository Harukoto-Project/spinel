import type { Plugin, PluginRepository } from '@/types/plugin';

function includesKeyword(keyword: string, ...values: Array<string | null>): boolean {
  return values.some((value) => value?.toLowerCase().includes(keyword) ?? false);
}

export function filterPlugins(plugins: Plugin[], query: string): Plugin[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return plugins;

  return plugins.filter((plugin) => includesKeyword(keyword, plugin.name, plugin.id, plugin.description));
}

export function filterPluginRepositories(repositories: PluginRepository[], query: string): PluginRepository[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return repositories;

  return repositories.filter((repository) => includesKeyword(keyword, repository.name, repository.url));
}
