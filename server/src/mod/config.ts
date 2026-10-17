export interface Config {
  host: string;
  port: number;
}

const str = (key: string, fallback: string): string => {
  const raw = process.env[key];
  return raw === undefined || raw === '' ? fallback : raw;
};

const port = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`環境変数 ${key} がポート番号として正しくありません: ${raw}`);
  }
  return value;
};

export const loadConfig = (): Config => ({
  host: str('HOST', '0.0.0.0'),
  port: port('PORT', 8787),
});
