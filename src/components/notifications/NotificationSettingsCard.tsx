import { useId, useState } from 'react';
import { SettingRow } from '@/components/form/SettingRow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PRIORITY_FILTER_OPTIONS } from '@/config/notifications';
import { describeError } from '@/lib/errors';
import type { NotificationSettings } from '@/types/notification';

type NotificationSettingsCardProps = {
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => Promise<void>;
};

export function NotificationSettingsCard({ settings, onSave }: NotificationSettingsCardProps) {
  const enabledId = useId();
  const filterId = useId();
  const contentId = useId();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (patch: Partial<NotificationSettings>) => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...settings, ...patch });
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (value: string) => {
    const option = PRIORITY_FILTER_OPTIONS.find((candidate) => candidate.value === value);
    if (option) void update({ priorityFilter: option.value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>通知の設定</CardTitle>
        <CardDescription>
          このノードからの通知を Windows の通知として表示する条件です。変更はすぐに反映されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SettingRow
          label="通知を受け取る"
          description="オフにすると、このノードとの WebSocket 接続も切断します。"
          htmlFor={enabledId}
        >
          <Switch
            id={enabledId}
            checked={settings.enabled}
            disabled={saving}
            onCheckedChange={(enabled) => void update({ enabled })}
          />
        </SettingRow>
        <SettingRow label="通知する優先度" description="履歴には、すべての通知が記録されます。" htmlFor={filterId}>
          <Select
            value={settings.priorityFilter}
            disabled={saving || !settings.enabled}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger id={filterId} className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          label="通知に内容を表示する"
          description="オフにすると、件名や差出人を表示せず「新着メール」とだけ表示します。"
          htmlFor={contentId}
        >
          <Switch
            id={contentId}
            checked={settings.showContent}
            disabled={saving || !settings.enabled}
            onCheckedChange={(showContent) => void update({ showContent })}
          />
        </SettingRow>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
