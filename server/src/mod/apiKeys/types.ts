export type ApiKeyId = 'typesafe' | 'anthropic';

export const API_KEY_IDS: readonly ApiKeyId[] = ['typesafe', 'anthropic'];

export type ApiKeySource = 'app' | 'env';

export interface ApiKeyStatus {
  configured: boolean;
  source: ApiKeySource | null;
}

export type ApiKeyStatusMap = Record<ApiKeyId, ApiKeyStatus>;

export type ApiKeyEnvValues = Record<ApiKeyId, string | null>;

export const API_KEY_VALUE_MAX = 512;
