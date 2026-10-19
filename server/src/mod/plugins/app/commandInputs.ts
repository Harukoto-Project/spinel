import { HttpError } from '../../http/HttpError.js';
import type { PluginCommand, PluginCommandInput } from './appTypes.js';
import type { InputValue, InputValues } from './appRuntimeTypes.js';

const STRING_INPUT_MAX = 1024;

const invalid = (input: PluginCommandInput, message: string): HttpError =>
  new HttpError(400, 'invalid_command_input', `「${input.label}」${message}`);

const isMissing = (value: unknown): boolean => value === undefined || value === null || value === '';

const coerce = (input: PluginCommandInput, value: unknown): InputValue => {
  switch (input.type) {
    case 'boolean':
      if (typeof value !== 'boolean') throw invalid(input, 'は true / false で指定してください');
      return value;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(input, 'は数値で指定してください');
      return value;
    case 'choice':
      if (typeof value !== 'string' || input.options === null || !input.options.includes(value)) {
        throw invalid(input, 'は選択肢の中から指定してください');
      }
      return value;
    case 'string':
      if (typeof value !== 'string') throw invalid(input, 'は文字列で指定してください');
      if (value.length > STRING_INPUT_MAX) throw invalid(input, `は ${STRING_INPUT_MAX} 文字以内にしてください`);
      return value;
  }
};

export const resolveInputValues = (command: PluginCommand, raw: Record<string, unknown>): InputValues => {
  const known = new Set(command.inputs.map((input) => input.key));
  for (const key of Object.keys(raw)) {
    if (!known.has(key)) throw new HttpError(400, 'invalid_command_input', `未知の入力です: ${key}`);
  }

  const values: InputValues = {};
  for (const input of command.inputs) {
    const given = raw[input.key];
    const value = isMissing(given) ? (input.default ?? undefined) : given;
    if (value === undefined) {
      if (input.required) throw invalid(input, 'は必須です');
      continue;
    }
    values[input.key] = coerce(input, value);
  }
  return values;
};

export const buildInputArgs = (command: PluginCommand, values: InputValues): string[] => {
  const args: string[] = [];
  for (const input of command.inputs) {
    const value = values[input.key];
    if (value === undefined) continue;
    if (input.flag !== null) {
      if (value === true) args.push(input.flag);
      continue;
    }
    if (input.arg !== null) args.push(input.arg, String(value));
  }
  return args;
};
