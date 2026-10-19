import type { PluginCommandInput, PluginInputValues } from '@/types/pluginApp';

export type InputDraft = Record<string, string | boolean>;

export function createInputDraft(inputs: PluginCommandInput[]): InputDraft {
  const draft: InputDraft = {};
  for (const input of inputs) {
    if (input.type === 'boolean') draft[input.key] = input.default === true;
    else draft[input.key] = input.default === null ? '' : String(input.default);
  }
  return draft;
}

function isNumberText(text: string): boolean {
  return text.trim() === '' || Number.isFinite(Number(text));
}

export function isInputDraftValid(inputs: PluginCommandInput[], draft: InputDraft): boolean {
  return inputs.every((input) => {
    if (input.type === 'boolean') return true;
    const text = String(draft[input.key] ?? '').trim();
    if (text === '') return !input.required;
    if (input.type === 'number') return isNumberText(text);
    if (input.type === 'choice') return (input.options ?? []).includes(text);
    return true;
  });
}

export function buildInputValues(inputs: PluginCommandInput[], draft: InputDraft): PluginInputValues {
  const values: PluginInputValues = {};
  for (const input of inputs) {
    const value = draft[input.key];
    if (input.type === 'boolean') {
      values[input.key] = value === true;
      continue;
    }
    const text = String(value ?? '').trim();
    if (text === '') continue;
    values[input.key] = input.type === 'number' ? Number(text) : text;
  }
  return values;
}

export type CommandConsent = {
  key: string;
  label: string;
  text: string;
};

export function collectConsents(inputs: PluginCommandInput[], draft: InputDraft): CommandConsent[] {
  const consents: CommandConsent[] = [];
  for (const input of inputs) {
    if (input.type !== 'boolean' || !input.consent) continue;
    if (draft[input.key] !== true) continue;
    consents.push({ key: input.key, label: input.label, text: input.consent });
  }
  return consents;
}

export function resolveChoiceDisplay(input: PluginCommandInput): 'buttons' | 'select' {
  if (input.display !== null) return input.display;
  return (input.options?.length ?? 0) <= 8 ? 'buttons' : 'select';
}
