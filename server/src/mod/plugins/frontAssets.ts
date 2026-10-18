import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { HttpError } from '../http/HttpError.js';

const ASSET_MAX_BYTES = 8 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

export interface FrontAsset {
  data: Buffer;
  contentType: string;
}

const notFound = (): HttpError => new HttpError(404, 'asset_not_found', 'ファイルが見つかりません');

const isInside = (root: string, target: string): boolean => target === root || target.startsWith(root + path.sep);

export const readFrontAsset = async (frontRoot: string, relative: string): Promise<FrontAsset> => {
  const segments = relative.split('/');
  if (relative === '' || relative.includes('\\') || segments.some((s) => s === '' || s === '.' || s === '..')) {
    throw notFound();
  }

  let root: string;
  let file: string;
  try {
    root = await realpath(frontRoot);
    file = await realpath(path.join(root, ...segments));
  } catch {
    throw notFound();
  }
  if (!isInside(root, file)) throw notFound();

  const info = await stat(file);
  if (!info.isFile()) throw notFound();
  if (info.size > ASSET_MAX_BYTES) throw new HttpError(413, 'asset_too_large', 'ファイルが大きすぎます');

  return {
    data: await readFile(file),
    contentType: CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
  };
};
