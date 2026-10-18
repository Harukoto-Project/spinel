import { PluginCard } from '@/components/plugins/PluginCard';
import { PluginCardSkeleton } from '@/components/plugins/PluginCardSkeleton';
import type { Plugin, PluginPermissions, PluginSettingsUpdate } from '@/types/plugin';

const SKELETON_COUNT = 2;

type PluginsSectionProps = {
  plugins: Plugin[];
  totalCount: number;
  loading?: boolean;
  frontErrors?: Record<string, string>;
  onEnable: (pluginId: string, grantedPermissions: PluginPermissions) => Promise<void>;
  onDisable: (pluginId: string) => Promise<void>;
  onSaveSettings: (pluginId: string, values: PluginSettingsUpdate) => Promise<void>;
};

export function PluginsSection({
  plugins,
  totalCount,
  loading = false,
  frontErrors = {},
  onEnable,
  onDisable,
  onSaveSettings,
}: PluginsSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">プラグイン</h2>
      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PluginCardSkeleton key={index} />
          ))}
        </div>
      ) : plugins.length === 0 ? (
        <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          {totalCount === 0
            ? 'インストールされているプラグインはありません。リポジトリを追加してください。'
            : '一致するプラグインがありません'}
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              frontError={frontErrors[plugin.id] ?? null}
              onEnable={(grantedPermissions) => onEnable(plugin.id, grantedPermissions)}
              onDisable={() => onDisable(plugin.id)}
              onSaveSettings={(values) => onSaveSettings(plugin.id, values)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
