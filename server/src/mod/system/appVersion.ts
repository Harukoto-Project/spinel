import { readFileSync } from 'node:fs';

export const loadAppVersion = (): string => {
  const raw = readFileSync(new URL('../../../package.json', import.meta.url), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && typeof parsed.version === 'string') {
    return parsed.version;
  }
  throw new Error('package.json から version を読み取れませんでした');
};
