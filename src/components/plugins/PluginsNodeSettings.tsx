import { useMemo } from 'react';
import { PluginRepositoriesSection } from '@/components/plugins/PluginRepositoriesSection';
import { PluginsSection } from '@/components/plugins/PluginsSection';
import { filterPluginRepositories, filterPlugins } from '@/components/plugins/pluginSearch';
import { usePageSearch } from '@/contexts/PageSearchContext';
import { usePluginPages } from '@/contexts/PluginPagesContext';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { usePlugins } from '@/hooks/use-plugins';

const SEARCH_DEBOUNCE_MS = 300;

type PluginsNodeSettingsProps = {
  nodeId: string;
};

export function PluginsNodeSettings({ nodeId }: PluginsNodeSettingsProps) {
  const { errors: frontErrors, reload } = usePluginPages();
  const {
    repositories,
    plugins,
    loading,
    error,
    addRepository,
    refreshRepository,
    deleteRepository,
    enable,
    disable,
    saveSettings,
  } = usePlugins(nodeId, reload);

  const { query } = usePageSearch();
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const busy = loading || query !== debouncedQuery;

  const filteredPlugins = useMemo(() => filterPlugins(plugins, debouncedQuery), [plugins, debouncedQuery]);
  const filteredRepositories = useMemo(
    () => filterPluginRepositories(repositories, debouncedQuery),
    [repositories, debouncedQuery],
  );

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <PluginsSection
        plugins={filteredPlugins}
        totalCount={plugins.length}
        loading={busy}
        frontErrors={frontErrors}
        onEnable={enable}
        onDisable={disable}
        onSaveSettings={saveSettings}
      />
      <PluginRepositoriesSection
        repositories={filteredRepositories}
        totalCount={repositories.length}
        loading={busy}
        onAddRepository={addRepository}
        onRefreshRepository={refreshRepository}
        onDeleteRepository={deleteRepository}
      />
    </>
  );
}
