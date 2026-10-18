import { invoke } from '@tauri-apps/api/core';
import type { ApiKeyId, ApiKeyStatusMap } from '@/types/apiKey';

export function loadApiKeys(nodeId: string): Promise<ApiKeyStatusMap> {
  return invoke<ApiKeyStatusMap>('load_api_keys', { nodeId });
}

export function saveApiKey(nodeId: string, keyId: ApiKeyId, value: string): Promise<ApiKeyStatusMap> {
  return invoke<ApiKeyStatusMap>('save_api_key', { nodeId, keyId, value });
}

export function deleteApiKey(nodeId: string, keyId: ApiKeyId): Promise<ApiKeyStatusMap> {
  return invoke<ApiKeyStatusMap>('delete_api_key', { nodeId, keyId });
}
