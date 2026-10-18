import { createHash } from 'node:crypto';
import { HttpError } from '../http/HttpError.js';

export const REPOSITORY_URL_MAX = 512;

const invalid = (message: string): HttpError => new HttpError(400, 'invalid_repository_url', message);

export const normalizeRepositoryUrl = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed === '') throw invalid('リポジトリの URL を指定してください');

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw invalid('リポジトリの URL として解釈できません(例: https://github.com/owner/repo)');
  }

  if (url.protocol !== 'https:') throw invalid('https:// で始まる URL を指定してください');
  if (url.username !== '' || url.password !== '') throw invalid('URL に認証情報を含めないでください');
  if (url.search !== '' || url.hash !== '') throw invalid('URL にクエリやフラグメントを含めないでください');

  const path = url.pathname.replace(/\/+$/, '').replace(/\.git$/i, '');
  if (path === '' || path === '/') throw invalid('リポジトリのパスを含めてください(例: https://github.com/owner/repo)');

  const normalized = `https://${url.host}${path}`;
  if (normalized.length > REPOSITORY_URL_MAX) throw invalid(`URL は ${REPOSITORY_URL_MAX} 文字以内にしてください`);
  return normalized;
};

export const repositoryIdOf = (normalizedUrl: string): string =>
  createHash('sha256').update(normalizedUrl).digest('hex').slice(0, 16);
