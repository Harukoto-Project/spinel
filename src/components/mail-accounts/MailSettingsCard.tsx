import { useState, type FormEvent } from 'react';
import { NumberField } from '@/components/form/NumberField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MAIL_SETTING_FIELDS } from '@/config/mailSettings';
import { describeError } from '@/lib/errors';
import type { MailSettingField, MailSettings } from '@/types/mailAccount';

type MailSettingsCardProps = {
  settings: MailSettings;
  onSave: (settings: MailSettings) => Promise<void>;
};

type Draft = Record<keyof MailSettings, string>;

function toDraft(settings: MailSettings): Draft {
  return { pollIntervalSec: String(settings.pollIntervalSec) };
}

function isValid(field: MailSettingField, raw: string): boolean {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isInteger(value) && value >= field.min && value <= field.max;
}

export function MailSettingsCard({ settings, onSave }: MailSettingsCardProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = MAIL_SETTING_FIELDS.every((field) => isValid(field, draft[field.key]));
  const changed = MAIL_SETTING_FIELDS.some((field) => Number(draft[field.key]) !== settings[field.key]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSave({ pollIntervalSec: Number(draft.pollIntervalSec) });
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>取得設定</CardTitle>
          <CardDescription>ノードがメールを確認する条件です。保存すると次の確認から反映されます。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {MAIL_SETTING_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              label={field.label}
              description={field.description}
              unit={field.unit}
              min={field.min}
              max={field.max}
              value={draft[field.key]}
              invalid={!isValid(field, draft[field.key])}
              onValueChange={(value) => setDraft((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" className="cursor-pointer" disabled={!valid || !changed || saving}>
            保存
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
