import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { HttpError } from '../http/HttpError.js';
import { MANIFEST_FILE_NAME, parsePluginManifest } from './parseManifest.js';
import { REPOSITORY_INDEX_FILE_NAME, parseRepositoryIndex } from './parseRepositoryIndex.js';
import type { PluginManifest, RepositoryIndex, RepositoryPluginSummary } from './types.js';

const INDEX_MAX_BYTES = 256 * 1024;
const MANIFEST_MAX_BYTES = 64 * 1024;
const PLUGINS_MAX = 100;

export interface RepositoryPluginContents {
  summary: RepositoryPluginSummary;
  manifest: PluginManifest;
}

export interface RepositoryContents {
  index: RepositoryIndex;
  plugins: RepositoryPluginContents[];
}

const invalid = (message: string): HttpError => new HttpError(400, 'invalid_plugin_repository', message);

const isInside = (root: string, target: string): boolean => target === root || target.startsWith(root + path.sep);

const resolveInside = async (root: string, relative: string, label: string): Promise<string> => {
  let resolved: string;
  try {
    resolved = await realpath(path.resolve(root, relative));
  } catch {
    throw invalid(`${label} が見つかりません`);
  }
  if (!isInside(root, resolved)) throw invalid(`${label} がリポジトリの外を指しています`);
  return resolved;
};

const readLimitedText = async (file: string, maxBytes: number, label: string): Promise<string> => {
  const info = await stat(file).catch(() => null);
  if (info === null || !info.isFile()) throw invalid(`${label} が見つかりません`);
  if (info.size > maxBytes) throw invalid(`${label} が大きすぎます(上限 ${Math.floor(maxBytes / 1024)}KB)`);
  return readFile(file, 'utf8');
};

const verifyEntry = async (pluginDir: string, entry: string, label: string): Promise<void> => {
  const resolved = await resolveInside(pluginDir, entry, label);
  const info = await stat(resolved);
  if (!info.isFile()) throw invalid(`${label} がファイルではありません`);
};

const readPlugin = async (root: string, summary: RepositoryPluginSummary): Promise<RepositoryPluginContents> => {
  const pluginDir = await resolveInside(
    root,
    summary.path,
    `プラグイン "${summary.id}" のディレクトリ(${summary.path})`,
  );
  const manifestText = await readLimitedText(
    path.join(pluginDir, MANIFEST_FILE_NAME),
    MANIFEST_MAX_BYTES,
    `プラグイン "${summary.id}" の ${MANIFEST_FILE_NAME}`,
  );
  const manifest = parsePluginManifest(manifestText);

  if (manifest.id !== summary.id) {
    throw invalid(
      `プラグイン "${summary.id}" の ${MANIFEST_FILE_NAME} の id("${manifest.id}")が ${REPOSITORY_INDEX_FILE_NAME} と一致しません`,
    );
  }

  const entries = [
    manifest.server === null ? null : { entry: manifest.server.entry, label: 'server.entry' },
    manifest.front === null ? null : { entry: manifest.front.entry, label: 'front.entry' },
  ];
  for (const item of entries) {
    if (item === null) continue;
    await verifyEntry(pluginDir, item.entry, `プラグイン "${summary.id}" の ${item.label}(${item.entry})`);
  }

  return { summary, manifest };
};

export const readRepositoryContents = async (directory: string): Promise<RepositoryContents> => {
  const root = await realpath(directory);
  const indexText = await readLimitedText(
    path.join(root, REPOSITORY_INDEX_FILE_NAME),
    INDEX_MAX_BYTES,
    REPOSITORY_INDEX_FILE_NAME,
  );
  const index = parseRepositoryIndex(indexText);
  if (index.plugins.length > PLUGINS_MAX) throw invalid(`プラグインは ${PLUGINS_MAX} 個までです`);

  const plugins: RepositoryPluginContents[] = [];
  for (const summary of index.plugins) plugins.push(await readPlugin(root, summary));
  return { index, plugins };
};
