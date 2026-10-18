import type { PluginStorageStore } from '../PluginStorageStore.js';
import type { PluginStorage } from './contextTypes.js';

const KEY_MAX = 190;
const VALUE_MAX_BYTES = 1024 * 1024;

const assertKey = (key: string): void => {
  if (typeof key !== 'string' || key === '' || key.length > KEY_MAX) {
    throw new Error(`storage のキーは 1〜${KEY_MAX} 文字の文字列にしてください`);
  }
};

export const createPluginStorage = (store: PluginStorageStore, pluginId: string): PluginStorage => ({
  async get<T = unknown>(key: string): Promise<T | null> {
    assertKey(key);
    const raw = await store.get(pluginId, key);
    return raw === null ? null : (JSON.parse(raw) as T);
  },

  async set(key: string, value: unknown): Promise<void> {
    assertKey(key);
    const raw = JSON.stringify(value);
    if (raw === undefined) throw new Error('storage に保存できない値です(JSON に変換できません)');
    if (Buffer.byteLength(raw, 'utf8') > VALUE_MAX_BYTES) {
      throw new Error(`storage の値が大きすぎます(上限 ${VALUE_MAX_BYTES / 1024}KB)`);
    }
    await store.set(pluginId, key, raw);
  },

  async delete(key: string): Promise<boolean> {
    assertKey(key);
    return store.remove(pluginId, key);
  },
});
