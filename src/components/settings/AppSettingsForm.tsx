import { useId, useState } from 'react';
import { PageSection } from '@/components/common/PageSection';
import { SettingRow } from '@/components/form/SettingRow';
import { Switch } from '@/components/ui/switch';
import { APP_SETTING_FIELDS } from '@/config/appSettings';
import { describeError } from '@/lib/errors';
import type { AppSettings } from '@/types/appSettings';

type AppSettingsFormProps = {
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<void>;
};

export function AppSettingsForm({ settings, onSave }: AppSettingsFormProps) {
  const baseId = useId();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (key: keyof AppSettings, value: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...settings, [key]: value });
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageSection
      title="起動とタスクトレイ"
      description="Spinel の起動時とウィンドウを閉じたときの動作です。変更はすぐに反映されます。"
    >
      <div className="flex max-w-3xl flex-col gap-6">
        {APP_SETTING_FIELDS.map((field) => {
          const id = `${baseId}-${field.key}`;
          return (
            <SettingRow key={field.key} label={field.label} description={field.description} htmlFor={id}>
              <Switch
                id={id}
                checked={settings[field.key]}
                disabled={saving}
                onCheckedChange={(checked) => void update(field.key, checked)}
              />
            </SettingRow>
          );
        })}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </PageSection>
  );
}
