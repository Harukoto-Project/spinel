import { PageSection } from '@/components/common/PageSection';
import { PluginRow } from '@/components/plugins/PluginRow';
import { PluginRowSkeleton } from '@/components/plugins/PluginRowSkeleton';
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
    <PageSection title="プラグイン" description="有効にしたプラグインの画面は、サイドバーに追加されます。">
      {loading ? (
        <ul className="flex flex-col divide-y divide-border">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PluginRowSkeleton key={index} />
          ))}
        </ul>
      ) : plugins.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {totalCount === 0
            ? 'インストールされているプラグインはありません。リポジトリを追加してください。'
            : '一致するプラグインがありません'}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {plugins.map((plugin) => (
            <PluginRow
              key={plugin.id}
              plugin={plugin}
              frontError={frontErrors[plugin.id] ?? null}
              onEnable={(grantedPermissions) => onEnable(plugin.id, grantedPermissions)}
              onDisable={() => onDisable(plugin.id)}
              onSaveSettings={(values) => onSaveSettings(plugin.id, values)}
            />
          ))}
        </ul>
      )}
    </PageSection>
  );
}
