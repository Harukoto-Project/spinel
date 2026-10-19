import { createHash } from 'node:crypto';
import { HttpError } from '../http/HttpError.js';

export const REPOSITORY_URL_MAX = 512;

const SSH_HOST = 'github.com';
const SSH_PREFIX = `git@${SSH_HOST}:`;
const SSH_PATH_PATTERN = /^([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;

const invalid = (message: string): HttpError => new HttpError(400, 'invalid_repository_url', message);

const stripRepositorySuffix = (path: string): string => path.replace(/\/+$/, '').replace(/\.git$/i, '');

const sshUrlOf = (path: string): string => {
  const matched = SSH_PATH_PATTERN.exec(stripRepositorySuffix(path.replace(/^\/+/, '')));
  const owner = matched?.[1];
  const name = matched?.[2];
  if (owner === undefined || name === undefined || owner.startsWith('.') || name.startsWith('.')) {
    throw invalid(`リポジトリのパスは owner/repo の形式で指定してください(例: ${SSH_PREFIX}owner/repo)`);
  }
  return `${SSH_PREFIX}${owner}/${name}`;
};

const normalizeScpLikeUrl = (trimmed: string): string => {
  if (!trimmed.startsWith(SSH_PREFIX)) throw invalid(`SSH は ${SSH_HOST} のリポジトリだけに対応しています`);
  return sshUrlOf(trimmed.slice(SSH_PREFIX.length));
};

const normalizeSshSchemeUrl = (trimmed: string): string => {
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw invalid(`リポジトリの URL として解釈できません(例: ${SSH_PREFIX}owner/repo)`);
  }
  if (url.hostname !== SSH_HOST) throw invalid(`SSH は ${SSH_HOST} のリポジトリだけに対応しています`);
  if (url.username !== 'git' || url.password !== '') throw invalid('SSH のユーザー名は git を指定してください');
  if (url.port !== '' && url.port !== '22') throw invalid('SSH のポート番号は指定できません');
  if (url.search !== '' || url.hash !== '') throw invalid('URL にクエリやフラグメントを含めないでください');
  return sshUrlOf(url.pathname);
};

const normalizeHttpsUrl = (trimmed: string): string => {
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw invalid('リポジトリの URL として解釈できません(例: https://github.com/owner/repo)');
  }

  if (url.protocol !== 'https:') throw invalid('https:// または git@github.com: で始まる URL を指定してください');
  if (url.username !== '' || url.password !== '') throw invalid('URL に認証情報を含めないでください');
  if (url.search !== '' || url.hash !== '') throw invalid('URL にクエリやフラグメントを含めないでください');

  const path = stripRepositorySuffix(url.pathname);
  if (path === '' || path === '/') throw invalid('リポジトリのパスを含めてください(例: https://github.com/owner/repo)');

  return `https://${url.host}${path}`;
};

export const isSshRepositoryUrl = (url: string): boolean => url.startsWith(SSH_PREFIX);

export const normalizeRepositoryUrl = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed === '') throw invalid('リポジトリの URL を指定してください');

  const normalized = trimmed.startsWith('git@')
    ? normalizeScpLikeUrl(trimmed)
    : /^ssh:\/\//i.test(trimmed)
      ? normalizeSshSchemeUrl(trimmed)
      : normalizeHttpsUrl(trimmed);

  if (normalized.length > REPOSITORY_URL_MAX) throw invalid(`URL は ${REPOSITORY_URL_MAX} 文字以内にしてください`);
  return normalized;
};

export const repositoryIdOf = (normalizedUrl: string): string =>
  createHash('sha256').update(normalizedUrl).digest('hex').slice(0, 16);
