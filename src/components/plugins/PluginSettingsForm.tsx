import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { PluginSettingField } from '@/components/plugins/PluginSettingField';
import {
  buildSettingsUpdate,
  createSettingsDraft,
  isSettingsDraftValid,
  type SettingsDraft,
} from '@/components/plugins/pluginSettingsDraft';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { describeError } from '@/lib/errors';
import type { Plugin, PluginSettingsUpdate } from '@/types/plugin';

type PluginSettingsFormProps = {
  plugin: Plugin;
  onSave: (values: PluginSettingsUpdate) => Promise<void>;
  onClose: () => void;
};

export function PluginSettingsForm({ plugin, onSave, onClose }: PluginSettingsFormProps) {
  const [draft, setDraft] = useState<SettingsDraft>(() => createSettingsDraft(plugin));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = buildSettingsUpdate(plugin, draft);
  const changed = Object.keys(update).length > 0;
  const valid = isSettingsDraftValid(plugin, draft);

  const run = async (values: PluginSettingsUpdate, closeAfter: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSave(values);
      if (closeAfter) onClose();
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!changed || !valid || submitting) return;
    await run(update, true);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{plugin.name} の設定</DialogTitle>
        <DialogDescription>保存した設定は、次にプラグインが読み込むときから反映されます。</DialogDescription>
      </DialogHeader>
      <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto px-1 py-1">
        {plugin.settings.map((schema) => (
          <PluginSettingField
            key={schema.key}
            schema={schema}
            value={draft[schema.key] ?? ''}
            secretSet={plugin.secretsSet.includes(schema.key)}
            disabled={submitting}
            onValueChange={(value) => setDraft((current) => ({ ...current, [schema.key]: value }))}
            onClearSecret={() => void run({ [schema.key]: null }, false)}
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button className="cursor-pointer" type="button" variant="outline" disabled={submitting} onClick={onClose}>
          キャンセル
        </Button>
        <Button className="cursor-pointer" type="submit" disabled={!changed || !valid || submitting}>
          {submitting && <LoaderCircle className="animate-spin" />}
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}
