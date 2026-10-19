import { HttpError } from '../../http/HttpError.js';
import type { PluginSettings } from '../context/contextTypes.js';
import type { AppPlatform, PluginVars } from './appTypes.js';

const TOKEN = /\{\{|\}\}|\{([^{}]*)\}/g;

export type PlaceholderInputValue = string | number | boolean;

export interface BuiltinPaths {
  source: string | null;
  plugin: string;
  data: string;
}

export interface ResolveContext extends BuiltinPaths {
  vars: Readonly<Record<string, string>>;
  settings: PluginSettings;
  secretKeys: ReadonlySet<string>;
  inputs: Readonly<Record<string, PlaceholderInputValue | null | undefined>>;
  allowSecret: boolean;
}

const unresolved = (message: string): HttpError => new HttpError(500, 'invalid_placeholder', message);

const stringify = (value: PlaceholderInputValue | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const currentPlatform = (): AppPlatform => {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'darwin';
  return 'linux';
};

const replaceTokens = (text: string, lookup: (name: string) => string): string =>
  text.replace(TOKEN, (match, name: string | undefined) => {
    if (match === '{{') return '{';
    if (match === '}}') return '}';
    return lookup((name ?? '').trim());
  });

const lookupBuiltin = (name: string, builtins: BuiltinPaths): string | null => {
  if (name === 'plugin') return builtins.plugin;
  if (name === 'data') return builtins.data;
  if (name === 'source') {
    if (builtins.source === null) throw unresolved('{source} を使うには [source] の指定が必要です');
    return builtins.source;
  }
  return null;
};

export const resolveVars = (
  vars: PluginVars,
  platform: AppPlatform,
  builtins: BuiltinPaths,
): Record<string, string> => {
  const merged = { ...vars.base, ...vars.platforms[platform] };
  const result: Record<string, string> = {};
  for (const [key, text] of Object.entries(merged)) {
    result[key] = replaceTokens(text, (name) => {
      const value = lookupBuiltin(name, builtins);
      if (value === null) throw unresolved(`[vars] では {${name}} は使えません`);
      return value;
    });
  }
  return result;
};

export const resolveTemplate = (text: string, context: ResolveContext): string =>
  replaceTokens(text, (name) => {
    const builtin = lookupBuiltin(name, context);
    if (builtin !== null) return builtin;

    if (name.startsWith('setting.')) {
      const key = name.slice('setting.'.length);
      if (!(key in context.settings)) throw unresolved(`{${name}} に対応する設定がありません`);
      if (context.secretKeys.has(key) && !context.allowSecret) {
        throw unresolved(`{${name}} は secret 型のため、stdin と env でだけ使えます`);
      }
      return stringify(context.settings[key]);
    }

    if (name.startsWith('input.')) {
      return stringify(context.inputs[name.slice('input.'.length)]);
    }

    const variable = context.vars[name];
    if (variable === undefined) throw unresolved(`{${name}} は未定義です`);
    return variable;
  });

export const resolveTemplates = (texts: readonly string[], context: ResolveContext): string[] =>
  texts.map((text) => resolveTemplate(text, context));
