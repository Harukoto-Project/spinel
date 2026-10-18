export type ApiKeyId = 'typesafe' | 'anthropic';

export type ApiKeySource = 'app' | 'env';

export type ApiKeyDefinition = {
  id: ApiKeyId;
  label: string;
  description: string;
  placeholder: string;
};

export type ApiKeyStatus = {
  configured: boolean;
  source: ApiKeySource | null;
};

export type ApiKeyStatusMap = Record<ApiKeyId, ApiKeyStatus>;
