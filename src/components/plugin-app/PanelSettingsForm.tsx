import { useMemo, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { PluginSettingField } from '@/components/plugins/PluginSettingField';
import {
  buildSettingsUpdate,
  createSettingsDraft,
  findMissingRequiredSettings,
  isSettingsDraftValid,
  type SettingsDraft,
} from '@/components/plugins/pluginSettingsDraft';
import { Button } from '@/components/ui/button';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import { describeError } from '@/lib/errors';
import type { PluginSettingsUpdate } from '@/types/plugin';

type PanelSettingsFormProps = {
  keys: string[];
};

export function PanelSettingsForm({ keys }: PanelSettingsFormProps) {
  const { plugin, saveSettings } = usePluginAppContext();

  const scoped = useMemo(
    () => ({
      ...plugin,
      settings: keys.flatMap((key) => plugin.settings.filter((schema) => schema.key === key)),
    }),
    [plugin, keys],
  );

  const [draft, setDraft] = useState<SettingsDraft>(() => createSettingsDraft(scoped));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = buildSettingsUpdate(scoped, draft);
  const changed = Object.keys(update).length > 0;
  const valid = isSettingsDraftValid(scoped, draft);
  const missing = findMissingRequiredSettings(scoped);

  if (scoped.settings.length === 0) return null;

  const run = async (values: PluginSettingsUpdate) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await saveSettings(values);
      setDraft(
        createSettingsDraft({
          ...updated,
          settings: updated.settings.filter((schema) => keys.includes(schema.key)),
        }),
      );
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!changed || !valid || submitting) return;
    await run(update);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4 rounded-lg border p-4">
      <h4 className="text-sm font-medium">設定</h4>
      <div className="flex flex-col gap-5">
        {scoped.settings.map((schema) => (
          <PluginSettingField
            key={schema.key}
            schema={schema}
            value={draft[schema.key] ?? ''}
            secretSet={plugin.secretsSet.includes(schema.key)}
            disabled={submitting}
            onValueChange={(value) => setDraft((current) => ({ ...current, [schema.key]: value }))}
            onClearSecret={() => void run({ [schema.key]: null })}
          />
        ))}
      </div>
      {missing.length > 0 && (
        <p className="text-sm text-muted-foreground">
          未設定の必須項目があります: {missing.map((schema) => schema.label).join('、')}
        </p>
      )}
      {error && (
        <p role="alert" className="break-words text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button className="cursor-pointer" type="submit" disabled={!changed || !valid || submitting}>
          {submitting && <LoaderCircle className="animate-spin" />}
          保存
        </Button>
      </div>
    </form>
  );
}
