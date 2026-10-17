import type { TriageConfig } from './triage/types.js';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export interface OutlookOAuthConfig {
  clientId: string;
}

export interface Config {
  host: string;
  port: number;
  dataDir: string;
  databaseUrl: string;
  adminKey: string | null;
  google: GoogleOAuthConfig | null;
  outlook: OutlookOAuthConfig | null;
  triage: TriageConfig;
}

const str = (key: string, fallback: string): string => {
  const raw = process.env[key];
  return raw === undefined || raw === '' ? fallback : raw;
};

const optional = (key: string): string | null => {
  const raw = process.env[key];
  return raw === undefined || raw === '' ? null : raw;
};

const num = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`環境変数 ${key} が数値ではありません: ${raw}`);
  }
  return value;
};

const port = (key: string, fallback: number): number => {
  const value = num(key, fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`環境変数 ${key} がポート番号として正しくありません: ${value}`);
  }
  return value;
};

const loadDatabaseUrl = (): string => {
  const raw = optional('DATABASE_URL');
  if (raw === null) {
    throw new Error('環境変数 DATABASE_URL が未設定です(例: mysql://user:password@localhost:3306/spinel)');
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('環境変数 DATABASE_URL が URL として正しくありません');
  }
  if (url.protocol !== 'mysql:') {
    throw new Error('環境変数 DATABASE_URL は mysql:// で始めてください');
  }
  if (url.pathname.length <= 1) {
    throw new Error('環境変数 DATABASE_URL にデータベース名を含めてください(例: mysql://.../spinel)');
  }
  return raw;
};

const loadGoogle = (): GoogleOAuthConfig | null => {
  const clientId = optional('GOOGLE_CLIENT_ID');
  const clientSecret = optional('GOOGLE_CLIENT_SECRET');
  if (clientId === null && clientSecret === null) return null;
  if (clientId === null || clientSecret === null) {
    throw new Error('GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET は両方指定してください');
  }
  return { clientId, clientSecret };
};

const loadOutlook = (): OutlookOAuthConfig | null => {
  const clientId = optional('OUTLOOK_CLIENT_ID');
  return clientId === null ? null : { clientId };
};

const loadTriage = (): TriageConfig => {
  const triage: TriageConfig = {
    ignoreBelow: num('IGNORE_BELOW', 0.2),
    notifyAbove: num('NOTIFY_ABOVE', 0.7),
    jevModel: str('JEV_MODEL', 'jev-latest'),
    jevBodyChars: num('JEV_BODY_CHARS', 4000),
    claudeModel: str('CLAUDE_MODEL', 'claude-haiku-4-5'),
    claudeBodyChars: num('CLAUDE_BODY_CHARS', 3000),
  };
  if (triage.ignoreBelow >= triage.notifyAbove) {
    throw new Error('IGNORE_BELOW は NOTIFY_ABOVE より小さくしてください');
  }
  return triage;
};

export const loadConfig = (): Config => ({
  host: str('HOST', '0.0.0.0'),
  port: port('PORT', 8787),
  dataDir: str('DATA_DIR', './data'),
  databaseUrl: loadDatabaseUrl(),
  adminKey: optional('ADMIN_KEY'),
  google: loadGoogle(),
  outlook: loadOutlook(),
  triage: loadTriage(),
});
