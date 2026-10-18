export const SUPPORTED_SPINEL_API = 1;

export const PLUGIN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PLUGIN_ID_MAX = 64;

export const PLUGIN_SETTING_TYPES = ['string', 'number', 'boolean', 'secret', 'path', 'select'] as const;
export type PluginSettingType = (typeof PLUGIN_SETTING_TYPES)[number];

export type PluginSettingDefault = string | number | boolean;

export interface PluginSettingSchema {
  key: string;
  type: PluginSettingType;
  label: string;
  description: string | null;
  default: PluginSettingDefault | null;
  required: boolean;
  options: string[] | null;
}

export interface PluginPermissions {
  routes: boolean;
  storage: boolean;
  notify: boolean;
  process: boolean;
  build: boolean;
  network: string[];
}

export interface PluginEntry {
  entry: string;
}

export interface PluginBuild {
  command: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string | null;
  spinelApi: number;
  server: PluginEntry | null;
  front: PluginEntry | null;
  build: PluginBuild | null;
  permissions: PluginPermissions;
  settings: PluginSettingSchema[];
}

export interface RepositoryPluginSummary {
  id: string;
  path: string;
  name: string;
  description: string | null;
  version: string;
}

export interface RepositoryIndex {
  schema: number;
  name: string;
  plugins: RepositoryPluginSummary[];
}

export const REPOSITORY_INDEX_SCHEMA = 1;
