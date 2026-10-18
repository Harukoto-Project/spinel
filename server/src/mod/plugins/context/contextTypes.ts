import type { FastifyReply, FastifyRequest } from 'fastify';
import type { NotificationPriority } from '../../notifications/protocol.js';
import type { PluginProcessApi } from '../process/types.js';

export type PluginSettingValue = string | number | boolean | null;

export type PluginSettings = Record<string, PluginSettingValue>;

export interface PluginLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

export type PluginRouteHandler = (request: FastifyRequest, reply: FastifyReply) => unknown;

export interface PluginRoutes {
  get(path: string, handler: PluginRouteHandler): void;
  post(path: string, handler: PluginRouteHandler): void;
  put(path: string, handler: PluginRouteHandler): void;
  delete(path: string, handler: PluginRouteHandler): void;
}

export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export interface PluginNotification {
  title: string;
  body: string;
  priority?: NotificationPriority;
}

export interface PluginNotify {
  publish(notification: PluginNotification): number;
}

export interface PluginHttp {
  fetch(input: string | URL, init?: RequestInit): Promise<Response>;
}

export interface PluginSettingsApi {
  get(): Promise<PluginSettings>;
}

export interface PluginContext {
  readonly id: string;
  readonly version: string;
  readonly logger: PluginLogger;
  readonly settings: PluginSettingsApi;
  readonly storage: PluginStorage;
  readonly routes: PluginRoutes;
  readonly notify: PluginNotify;
  readonly http: PluginHttp;
  readonly process: PluginProcessApi;
  onDeactivate(listener: () => void | Promise<void>): void;
}

export interface PluginInstance {
  deactivate?(): void | Promise<void>;
}

export type PluginActivate = (context: PluginContext) => void | PluginInstance | Promise<void | PluginInstance>;
