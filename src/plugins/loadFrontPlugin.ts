import { describeError } from '@/lib/errors';
import { createFrontSession, createHostApi } from '@/plugins/createHostApi';
import { installHostGlobal, listHostModuleNames } from '@/plugins/hostModules';
import type { PluginFrontActivate, PluginFrontHandle } from '@/plugins/hostTypes';
import type { RegisteredPluginPage } from '@/plugins/registeredPage';
import { rewriteHostImports } from '@/plugins/rewriteHostImports';
import { fetchPluginAsset } from '@/services/pluginStorage';
import type { Plugin } from '@/types/plugin';

const ACTIVATE_TIMEOUT_MS = 15_000;

export type LoadedFrontPlugin = {
  pluginId: string;
  pages: RegisteredPluginPage[];
  dispose: () => Promise<void>;
};

async function importModule(pluginId: string, source: string): Promise<unknown> {
  const code = `${rewriteHostImports(source)}\n//# sourceURL=spinel-plugin/${pluginId}/front.js`;
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  try {
    return await import(/* @vite-ignore */ url);
  } catch (caught) {
    throw new Error(
      `画面のコードを読み込めません: ${describeError(caught)}(import できるのは ${listHostModuleNames().join(', ')} のみで、相対 import は使えません。1ファイルにバンドルしてください)`,
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function readHandle(value: unknown): PluginFrontHandle | null {
  if (typeof value !== 'object' || value === null) return null;
  const { deactivate } = value as PluginFrontHandle;
  return typeof deactivate === 'function' ? { deactivate } : null;
}

export async function loadFrontPlugin(nodeId: string, plugin: Plugin): Promise<LoadedFrontPlugin> {
  if (plugin.frontEntry === null) {
    throw new Error('front のエントリーが定義されていません');
  }
  installHostGlobal();

  const source = await fetchPluginAsset(nodeId, plugin.id, plugin.frontEntry);
  const module = (await importModule(plugin.id, source)) as { default?: unknown };
  if (typeof module.default !== 'function') {
    throw new Error('front のエントリーは default export で関数(host を受け取る activate)を公開してください');
  }

  const session = createFrontSession();
  const host = createHostApi(nodeId, plugin, session);
  let handle: PluginFrontHandle | null = null;
  let disposed = false;

  const dispose = async () => {
    if (disposed) return;
    disposed = true;
    session.sealed = true;
    const callbacks = [...session.callbacks].reverse();
    if (handle?.deactivate) callbacks.unshift(handle.deactivate);
    for (const callback of callbacks) {
      try {
        await callback();
      } catch (caught) {
        console.error(`[plugin:${plugin.id}] 後片付けに失敗しました`, caught);
      }
    }
  };

  try {
    const activate = module.default as PluginFrontActivate;
    const result = await withTimeout(
      Promise.resolve(activate(host)),
      ACTIVATE_TIMEOUT_MS,
      `activate が ${ACTIVATE_TIMEOUT_MS / 1000} 秒以内に完了しませんでした`,
    );
    handle = readHandle(result);
  } catch (caught) {
    await dispose();
    throw new Error(`activate に失敗しました: ${describeError(caught)}`);
  }

  session.sealed = true;
  return { pluginId: plugin.id, pages: session.pages, dispose };
}
