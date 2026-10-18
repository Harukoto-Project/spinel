import { useId } from 'react';
import { SecretInput } from '@/components/form/SecretInput';
import { SettingRow } from '@/components/form/SettingRow';
import { isNumberDraftValid } from '@/components/plugins/pluginSettingsDraft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PluginSettingSchema } from '@/types/plugin';

type PluginSettingFieldProps = {
  schema: PluginSettingSchema;
  value: string | boolean;
  secretSet: boolean;
  disabled?: boolean;
  onValueChange: (value: string | boolean) => void;
  onClearSecret: () => void;
};

function fieldLabel(schema: PluginSettingSchema): string {
  return schema.required ? `${schema.label}(必須)` : schema.label;
}

export function PluginSettingField({
  schema,
  value,
  secretSet,
  disabled = false,
  onValueChange,
  onClearSecret,
}: PluginSettingFieldProps) {
  const id = useId();
  const text = typeof value === 'string' ? value : '';
  const defaultText = schema.default === null ? '' : String(schema.default);

  if (schema.type === 'boolean') {
    return (
      <SettingRow label={fieldLabel(schema)} description={schema.description ?? undefined} htmlFor={id}>
        <Switch id={id} checked={value === true} disabled={disabled} onCheckedChange={onValueChange} />
      </SettingRow>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{fieldLabel(schema)}</Label>
      {schema.type === 'select' ? (
        <Select value={text === '' ? undefined : text} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={defaultText === '' ? '選択してください' : `既定: ${defaultText}`} />
          </SelectTrigger>
          <SelectContent>
            {(schema.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : schema.type === 'secret' ? (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SecretInput
              id={id}
              value={text}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder={secretSet ? '••••••••••••••••(設定済み)' : '未設定'}
              disabled={disabled}
            />
          </div>
          {secretSet && (
            <Button type="button" variant="outline" disabled={disabled} onClick={onClearSecret}>
              削除
            </Button>
          )}
        </div>
      ) : (
        <Input
          id={id}
          type={schema.type === 'number' ? 'number' : 'text'}
          step={schema.type === 'number' ? 'any' : undefined}
          value={text}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={defaultText === '' ? undefined : `既定: ${defaultText}`}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={schema.type === 'number' && !isNumberDraftValid(text)}
        />
      )}
      {schema.description && <p className="text-xs text-muted-foreground">{schema.description}</p>}
      {schema.type === 'secret' && secretSet && (
        <p className="text-xs text-muted-foreground">保存済みの値は表示されません。上書きする場合のみ入力してください。</p>
      )}
      {schema.type !== 'secret' && schema.type !== 'select' && (
        <p className="text-xs text-muted-foreground">空にすると既定値に戻ります。</p>
      )}
    </div>
  );
}
