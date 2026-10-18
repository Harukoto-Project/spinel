import type { ComponentType } from 'react';
import type { PluginSettingValue } from '@/types/plugin';

export type PluginPageDefinition = {
  id: string;
  label: string;
  icon?: string;
  group?: string;
  component: ComponentType;
};

export type PluginRequestInit = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

export type HostApi = {
  pluginId: string;
  registerPage: (page: PluginPageDefinition) => void;
  api: {
    request: <T = unknown>(path: string, init?: PluginRequestInit) => Promise<T>;
  };
  settings: {
    get: () => Promise<Record<string, PluginSettingValue>>;
  };
  onDeactivate: (callback: () => void | Promise<void>) => void;
};

export type PluginFrontHandle = {
  deactivate?: () => void | Promise<void>;
};

export type PluginFrontActivate = (host: HostApi) => void | PluginFrontHandle | Promise<void | PluginFrontHandle>;
