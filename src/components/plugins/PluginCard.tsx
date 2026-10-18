import { useState } from 'react';
import { Settings } from 'lucide-react';
import { EnablePluginDialog } from '@/components/plugins/EnablePluginDialog';
import { PluginSettingsDialog } from '@/components/plugins/PluginSettingsDialog';
import { PluginStatusBadge } from '@/components/plugins/PluginStatusBadge';
import { findMissingRequiredSettings } from '@/components/plugins/pluginSettingsDraft';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Plugin, PluginPermissions, PluginSettingsUpdate } from '@/types/plugin';

type PluginCardProps = {
  plugin: Plugin;
  frontError?: string | null;
  onEnable: (grantedPermissions: PluginPermissions) => Promise<void>;
  onDisable: () => Promise<void>;
  onSaveSettings: (values: PluginSettingsUpdate) => Promise<void>;
};

export function PluginCard({ plugin, frontError = null, onEnable, onDisable, onSaveSettings }: PluginCardProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="break-all">{plugin.name}</span>
          <span className="text-xs font-normal text-muted-foreground">v{plugin.version}</span>
          <PluginStatusBadge status={plugin.status} />
        </CardTitle>
        <CardDescription>{plugin.description ?? '説明はありません'}</CardDescription>
        <CardAction>
          <Switch
            checked={plugin.enabled}
            disabled={disabling}
            aria-label={`${plugin.name} を${plugin.enabled ? '無効' : '有効'}にする`}
            onCheckedChange={(checked) => void handleToggle(checked)}
          />
        </CardAction>
      </CardHeader>
      {(plugin.errorMessage || frontError || plugin.restartRequired || missingRequired.length > 0) && (
        <CardContent className="flex flex-col gap-2 text-sm">
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
            <p className="text-muted-foreground">
              新しいバージョンを取得済みです。反映するには、いったん無効にしてから、もう一度有効にしてください。
            </p>
          )}
          {missingRequired.length > 0 && (
            <p className="text-muted-foreground">
              未設定の必須項目があります: {missingRequired.map((schema) => schema.label).join('、')}
            </p>
          )}
        </CardContent>
      )}
      {hasSettings && (
        <CardFooter className="justify-end">
          <Button className="cursor-pointer" variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings />
            設定
          </Button>
        </CardFooter>
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
    </Card>
  );
}
