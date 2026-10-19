import type { PluginSettingType } from '../types.js';
import { fail } from '../readers.js';
import { BUILTIN_PLACEHOLDERS } from './appTypes.js';

const ESCAPED_BRACES = /\{\{|\}\}/g;
const PLACEHOLDER = /\{([^{}]*)\}/g;

export interface PlaceholderScope {
  vars: ReadonlySet<string>;
  hasSource: boolean;
  settings: ReadonlyMap<string, PluginSettingType>;
  inputs: ReadonlySet<string>;
  allowSecret: boolean;
}

export const extractPlaceholders = (text: string, at: string): string[] => {
  const names: string[] = [];
  const rest = text.replace(ESCAPED_BRACES, '').replace(PLACEHOLDER, (_match, name: string) => {
    names.push(name.trim());
    return '';
  });
  if (/[{}]/.test(rest)) {
    return fail(at, '{ } が対応していません(波括弧そのものは {{ と }} で書きます)');
  }
  return names;
};

const isBuiltin = (name: string): boolean => (BUILTIN_PLACEHOLDERS as readonly string[]).includes(name);

const validateName = (name: string, at: string, scope: PlaceholderScope): void => {
  if (name === '') return fail(at, '空のプレースホルダー {} は使えません');

  if (isBuiltin(name)) {
    if (name === 'source' && !scope.hasSource) {
      return fail(at, '{source} を使うには [source] の指定が必要です');
    }
    return;
  }

  if (name.startsWith('setting.')) {
    const key = name.slice('setting.'.length);
    const type = scope.settings.get(key);
    if (type === undefined) return fail(at, `{${name}} に対応する [[settings]] がありません`);
    if (type === 'secret' && !scope.allowSecret) {
      return fail(at, `{${name}} は secret 型のため、stdin と env でだけ使えます(コマンドライン引数からは見えてしまうため)`);
    }
    return;
  }

  if (name.startsWith('input.')) {
    const key = name.slice('input.'.length);
    if (!scope.inputs.has(key)) return fail(at, `{${name}} に対応する入力(inputs)がありません`);
    return;
  }

  if (!scope.vars.has(name)) return fail(at, `{${name}} は未定義です([vars] に追加してください)`);
};

export const validatePlaceholders = (text: string, at: string, scope: PlaceholderScope): void => {
  for (const name of extractPlaceholders(text, at)) validateName(name, at, scope);
};