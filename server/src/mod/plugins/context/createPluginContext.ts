import type { Logger } from '../../logger.js';
import type { NotificationPayload } from '../../notifications/protocol.js';
import type { PluginProcessManager } from '../process/PluginProcessManager.js';
import type { PluginStorageStore } from '../PluginStorageStore.js';
import type { PluginStore } from '../PluginStore.js';
import type { PluginPermissions, PluginRecord } from '../types.js';
import type { PluginContext, PluginLogger, PluginNotify, PluginRoutes } from './contextTypes.js';
import { createPluginHttp } from './pluginHttp.js';
import { createPluginSettings } from './pluginSettings.js';
import { createPluginStorage } from './pluginStorage.js';
import type { PluginRouter } from './PluginRouter.js';

const TITLE_MAX = 120;
const BODY_MAX = 500;

export interface PluginContextDeps {
  record: PluginRecord;
  permissions: PluginPermissions;
  router: PluginRouter;
  pluginStore: PluginStore;
  storageStore: PluginStorageStore;
  processes: PluginProcessManager;
  publish: (payload: NotificationPayload) => number;
  logger: Logger;
  onDeactivate: (listener: () => void | Promise<void>) => void;
}

export class PluginPermissionError extends Error {
  public constructor(permission: string) {
    super(`この操作には "${permission}" 権限が必要です(plugin.toml の [permissions] に宣言し、有効化時に許可してください)`);
    this.name = 'PluginPermissionError';
  }
}

const denied = <T extends object>(permission: string): T =>
  new Proxy({} as T, {
    get: (_target, property) => {
      if (property === 'then') return undefined;
      return () => {
        throw new PluginPermissionError(permission);
      };
    },
  });

const truncate = (value: string, max: number): string => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

const createLogger = (logger: Logger, pluginId: string): PluginLogger => {
  const prefix = `[plugin:${pluginId}]`;
  return {
    info: (message) => logger.info(`${prefix} ${message}`),
    warn: (message) => logger.warn(`${prefix} ${message}`),
    error: (message, error) => logger.error(`${prefix} ${message}`, error),
  };
};

const createRoutes = (router: PluginRouter): PluginRoutes => ({
  get: (path, handler) => router.add('GET', path, handler),
  post: (path, handler) => router.add('POST', path, handler),
  put: (path, handler) => router.add('PUT', path, handler),
  delete: (path, handler) => router.add('DELETE', path, handler),
});

const createNotify = (publish: PluginContextDeps['publish'], pluginName: string): PluginNotify => ({
  publish: ({ title, body, priority }) =>
    publish({
      kind: 'plugin',
      priority: priority === 'urgent' ? 'urgent' : 'normal',
      title: truncate(`[${pluginName}] ${String(title)}`, TITLE_MAX),
      body: truncate(String(body), BODY_MAX),
      mail: null,
    }),
});

export const createPluginContext = (deps: PluginContextDeps): PluginContext => {
  const { record, permissions } = deps;
  const id = record.id;

  return {
    id,
    version: record.manifest.version,
    logger: createLogger(deps.logger, id),
    settings: createPluginSettings(deps.pluginStore, id, record.manifest.settings),
    storage: permissions.storage ? createPluginStorage(deps.storageStore, id) : denied('storage'),
    routes: permissions.routes ? createRoutes(deps.router) : denied('routes'),
    notify: permissions.notify ? createNotify(deps.publish, record.manifest.name) : denied('notify'),
    http: permissions.network.length > 0 ? createPluginHttp(permissions.network) : denied('network'),
    process: permissions.process ? deps.processes.createApi(id) : denied('process'),
    onDeactivate: deps.onDeactivate,
  };
};
