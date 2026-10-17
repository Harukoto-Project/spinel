export type ApiKeyId = 'typesafe' | 'anthropic';

export type ApiKeyDefinition = {
  id: ApiKeyId;
  label: string;
  description: string;
  placeholder: string;
};

export type ApiKeyStatusMap = Record<ApiKeyId, boolean>;
