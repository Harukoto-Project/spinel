import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Queryable } from '../../db/Database.js';
import { HttpError } from '../../http/HttpError.js';
import { resolveSettings } from '../context/pluginSettings.js';
import type { PluginInstaller } from '../PluginInstaller.js';
import { PluginStore } from '../PluginStore.js';
import type { PluginRecord } from '../types.js';
import type { InputValues } from './appRuntimeTypes.js';
import type { PluginSourceManager } from './PluginSourceManager.js';
import { currentPlatform, resolveVars, type BuiltinPaths, type ResolveContext } from './resolvePlaceholders.js';

export interface AppEnvironmentDeps {
  db: Queryable;
  installer: PluginInstaller;
  sources: PluginSourceManager;
  dataRoot: string;
}

export interface AppEnvironment {
  pluginDir: string;
  dataDir: string;
  sourceDir: string | null;
  defaultCwd: string;
  secretValues: string[];
  contextFor(inputs: InputValues, allowSecret: boolean): ResolveContext;
  cwdFor(relative: string | null): string;
}

export const resolveInside = (base: string, relative: string): string => {
  const resolved = path.resolve(base, relative);
  const offset = path.relative(base, resolved);
  if (offset.startsWith('..') || path.isAbsolute(offset)) {
    throw new HttpError(400, 'invalid_path', 'プラグインのディレクトリの外は指定できません');
  }
  return resolved;
};

export const loadAppEnvironment = async (
  deps: AppEnvironmentDeps,
  record: PluginRecord,
): Promise<AppEnvironment> => {
  const spec = record.manifest.app;
  const pluginDir = path.join(deps.installer.repositoryDirectory(record.repoId), record.path);
  const dataDir = path.join(deps.dataRoot, record.id);
  await mkdir(dataDir, { recursive: true });

  let sourceDir: string | null = null;
  if (spec.source !== null) {
    if (!(await deps.sources.isPresent(record.id))) {
      throw new HttpError(409, 'source_missing', 'ソースが取得されていません。「ソース更新」を実行してください');
    }
    sourceDir = deps.sources.directory(record.id);
  }

  const builtins: BuiltinPaths = { source: sourceDir, plugin: pluginDir, data: dataDir };
  const vars = resolveVars(spec.vars, currentPlatform(), builtins);

  const stored = await new PluginStore(deps.db).getStoredSettings(record.id);
  const settings = resolveSettings(record.manifest.settings, stored.values, stored.secrets);
  const secretKeys = new Set(record.manifest.settings.filter((item) => item.type === 'secret').map((item) => item.key));
  const secretValues = [...secretKeys]
    .map((key) => settings[key])
    .filter((value): value is string => typeof value === 'string' && value !== '');

  const defaultCwd = sourceDir ?? pluginDir;

  return {
    pluginDir,
    dataDir,
    sourceDir,
    defaultCwd,
    secretValues,
    contextFor: (inputs, allowSecret) => ({ ...builtins, vars, settings, secretKeys, inputs, allowSecret }),
    cwdFor: (relative) => (relative === null ? defaultCwd : resolveInside(defaultCwd, relative)),
  };
};
