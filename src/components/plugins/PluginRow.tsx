import { useState } from 'react';
import { Settings } from 'lucide-react';
import { EnablePluginDialog } from '@/components/plugins/EnablePluginDialog';
import { PluginSettingsDialog } from '@/components/plugins/PluginSettingsDialog';
import { PluginStatusLabel } from '@/components/plugins/PluginStatusLabel';
import { findMissingRequiredSettings } from '@/components/plugins/pluginSettingsDraft';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Plugin, PluginPermissions, PluginSettingsUpdate } from '@/types/plugin';

type PluginRowProps = {
  plugin: Plugin;
  frontError?: string | null;
  onEnable: (grantedPermissions: PluginPermissions) => Promise<void>;
  onDisable: () => Promise<void>;
  onSaveSettings: (values: PluginSettingsUpdate) => Promise<void>;
};

export function PluginRow({ plugin, frontError = null, onEnable, onDisable, onSaveSettings }: PluginRowProps) {
  const [enableOpen, setEnableOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const missingRequired = findMissingRequiredSettings(plugin);
  const hasSettings = plugin.settings.length > 0;

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      setEnableOpen(true);
      return;
    }
    setDisabling(true);
    try {
      await onDisable();
    } finally {
      setDisabling(false);
    }
  };

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold break-all">{plugin.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">v{plugin.version}</span>
            <PluginStatusLabel status={plugin.status} />
          </div>
          <p className="text-sm text-muted-foreground">{plugin.description ?? '説明はありません'}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasSettings && (
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings />
              設定
            </Button>
          )}
          <Switch
            checked={plugin.enabled}
            disabled={disabling}
            aria-label={`${plugin.name} を${plugin.enabled ? '無効' : '有効'}にする`}
            onCheckedChange={(checked) => void handleToggle(checked)}
          />
        </div>
      </div>
      {(plugin.errorMessage || frontError || plugin.restartRequired || missingRequired.length > 0) && (
        <div className="flex flex-col gap-1 text-sm">
          {plugin.errorMessage && (
            <p role="alert" className="break-words text-destructive">
              {plugin.errorMessage}
            </p>
          )}
          {frontError && (
            <p role="alert" className="break-words text-destructive">
              画面を読み込めませんでした: {frontError}
            </p>
          )}
          {plugin.restartRequired && (
            <p className="text-warning">
              新しいバージョンを取得済みですが、まだ反映されていません。リポジトリの「更新」を押してください。
            </p>
          )}
          {missingRequired.length > 0 && (
            <p className="text-warning">
              未設定の必須項目があります: {missingRequired.map((schema) => schema.label).join('、')}
            </p>
          )}
        </div>
      )}
      <EnablePluginDialog
        plugin={plugin}
        open={enableOpen}
        onOpenChange={setEnableOpen}
        onEnable={() => onEnable(plugin.permissions)}
      />
      {hasSettings && (
        <PluginSettingsDialog
          plugin={plugin}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSave={onSaveSettings}
        />
      )}
    </li>
  );
}
