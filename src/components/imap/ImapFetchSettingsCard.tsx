import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { NumberField } from '@/components/form/NumberField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IMAP_SETTING_FIELDS } from '@/config/imap';
import { describeError } from '@/lib/errors';
import type { ImapSettings } from '@/types/imap';

type ImapFetchSettingsCardProps = {
  settings: ImapSettings;
  onSave: (settings: ImapSettings) => Promise<void>;
};

type FormValues = Record<keyof ImapSettings, string>;

function toFormValues(settings: ImapSettings): FormValues {
  return {
    lookbackDays: String(settings.lookbackDays),
    fetchLimit: String(settings.fetchLimit),
    pollIntervalSec: String(settings.pollIntervalSec),
  };
}

export function ImapFetchSettingsCard({ settings, onSave }: ImapFetchSettingsCardProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(settings));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidKeys = IMAP_SETTING_FIELDS.filter(({ key, min, max }) => {
    const value = Number(values[key]);
    return values[key] === '' || !Number.isInteger(value) || value < min || value > max;
  }).map(({ key }) => key);
  const dirty = IMAP_SETTING_FIELDS.some(({ key }) => values[key] !== String(settings[key]));
  const canSave = dirty && invalidKeys.length === 0 && !saving;

  const handleChange = (key: keyof ImapSettings, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    try {
      const next: ImapSettings = {
        lookbackDays: Number(values.lookbackDays),
        fetchLimit: Number(values.fetchLimit),
        pollIntervalSec: Number(values.pollIntervalSec),
      };
      await onSave(next);
      setValues(toFormValues(next));
      setSaved(true);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>取得設定</CardTitle>
          <CardDescription>このノードがメールを取得する条件と間隔です。すべてのアカウントに共通です。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {IMAP_SETTING_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              label={field.label}
              description={`${field.description}(${field.min}〜${field.max})`}
              unit={field.unit}
              min={field.min}
              max={field.max}
              value={values[field.key]}
              invalid={invalidKeys.includes(field.key)}
              onValueChange={(value) => handleChange(field.key, value)}
            />
          ))}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-end gap-3">
          {error && (
            <p role="alert" className="mr-auto text-sm text-destructive">
              {error}
            </p>
          )}
          {saved && !error && <p className="text-sm text-muted-foreground">保存しました</p>}
          <Button className="cursor-pointer" type="submit" disabled={!canSave}>
            {saving && <LoaderCircle className="animate-spin" />}
            保存
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
