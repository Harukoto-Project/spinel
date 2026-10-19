import { fail, optionalString, optionalTable, requireString, type Table } from '../readers.js';
import type { PluginSource } from './appTypes.js';

const REPO_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
const REF_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/;

export const parseSource = (root: Table): PluginSource | null => {
  const table = optionalTable(root, 'source', '');
  if (table === null) return null;

  const repo = requireString(table, 'repo', 'source', 140);
  if (!REPO_PATTERN.test(repo) || repo.endsWith('.git') || repo.endsWith('.')) {
    return fail('source.repo', 'GitHub の "owner/name" 形式で指定してください(例: Harukotokoto/ZenStudy-Automation)');
  }

  const ref = optionalString(table, 'ref', 'source', 100);
  if (ref !== null && (!REF_PATTERN.test(ref) || ref.includes('..') || ref.endsWith('/') || ref.endsWith('.lock'))) {
    return fail('source.ref', 'ブランチ名またはタグ名を指定してください');
  }

  return { repo, ref };
};
