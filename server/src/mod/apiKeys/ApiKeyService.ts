import { HttpError } from '../http/HttpError.js';
import type { ApiKeyStore } from './ApiKeyStore.js';
import {
  API_KEY_IDS,
  API_KEY_VALUE_MAX,
  type ApiKeyEnvValues,
  type ApiKeyId,
  type ApiKeyStatusMap,
} from './types.js';

type Listener = () => void;

export class ApiKeyService {
  private readonly listeners = new Set<Listener>();

  public constructor(
    private readonly store: ApiKeyStore,
    private readonly envValues: ApiKeyEnvValues,
  ) {}

  public subscribe(listener: Listener): void {
    this.listeners.add(listener);
  }

  public async resolve(id: ApiKeyId): Promise<string | null> {
    return (await this.store.get(id)) ?? this.envValues[id];
  }

  public async status(): Promise<ApiKeyStatusMap> {
    const stored = new Set(await this.store.listIds());
    const entries = API_KEY_IDS.map((id) => {
      if (stored.has(id)) return [id, { configured: true, source: 'app' }] as const;
      if (this.envValues[id] !== null) return [id, { configured: true, source: 'env' }] as const;
      return [id, { configured: false, source: null }] as const;
    });
    return Object.fromEntries(entries) as ApiKeyStatusMap;
  }

  public async set(id: ApiKeyId, value: string): Promise<ApiKeyStatusMap> {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.length > API_KEY_VALUE_MAX) {
      throw new HttpError(400, 'invalid_api_key', `APIキーは1〜${API_KEY_VALUE_MAX}文字で指定してください`);
    }
    await this.store.set(id, trimmed);
    this.notify();
    return this.status();
  }

  public async remove(id: ApiKeyId): Promise<ApiKeyStatusMap> {
    if (!(await this.store.remove(id))) {
      throw new HttpError(404, 'not_found', 'アプリから保存したAPIキーはありません');
    }
    this.notify();
    return this.status();
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}
