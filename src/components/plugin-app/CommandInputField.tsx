import { useId } from 'react';
import { SettingRow } from '@/components/form/SettingRow';
import { resolveChoiceDisplay } from '@/components/plugin-app/commandInputDraft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PluginCommandInput } from '@/types/pluginApp';

type CommandInputFieldProps = {
  input: PluginCommandInput;
  value: string | boolean;
  disabled?: boolean;
  onValueChange: (value: string | boolean) => void;
};

function inputLabel(input: PluginCommandInput): string {
  return input.required ? `${input.label}(必須)` : input.label;
}

export function CommandInputField({ input, value, disabled = false, onValueChange }: CommandInputFieldProps) {
  const id = useId();
  const text = typeof value === 'string' ? value : '';

  if (input.type === 'boolean') {
    return (
      <SettingRow label={input.label} description={input.description ?? undefined} htmlFor={id}>
        <Switch id={id} checked={value === true} disabled={disabled} onCheckedChange={onValueChange} />
      </SettingRow>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{inputLabel(input)}</Label>
      {input.type === 'choice' && resolveChoiceDisplay(input) === 'buttons' ? (
        <div id={id} role="group" aria-label={input.label} className="flex flex-wrap gap-2">
          {(input.options ?? []).map((option) => {
            const selected = text === option;
            return (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                disabled={disabled}
                className="cursor-pointer"
                onClick={() => onValueChange(selected && !input.required ? '' : option)}
              >
                {option}
              </Button>
            );
          })}
        </div>
      ) : input.type === 'choice' ? (
        <Select value={text === '' ? undefined : text} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {(input.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={input.type === 'number' ? 'number' : 'text'}
          step={input.type === 'number' ? 'any' : undefined}
          value={text}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
      )}
      {input.description && <p className="text-xs text-muted-foreground">{input.description}</p>}
    </div>
  );
}
