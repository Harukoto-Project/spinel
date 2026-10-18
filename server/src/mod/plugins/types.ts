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

export interface PluginRepositoryRecord {
  id: string;
  url: string;
  name: string;
  installedSha: string;
  createdAt: number;
  updatedAt: number;
}

export interface PluginRecord {
  id: string;
  repoId: string;
  path: string;
  manifest: PluginManifest;
  installedVersion: string;
  enabled: boolean;
  grantedPermissions: PluginPermissions | null;
  config: Record<string, unknown>;
  secretKeys: string[];
  errorMessage: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface PluginRepositoryView {
  id: string;
  url: string;
  name: string;
  installedSha: string;
  updatedAt: number;
  plugins: PluginSummaryView[];
}

export type PluginStatus = 'disabled' | 'active' | 'error';

export interface PluginView {
  id: string;
  repoId: string;
  name: string;
  version: string;
  description: string | null;
  hasServer: boolean;
  hasFront: boolean;
  frontEntry: string | null;
  enabled: boolean;
  status: PluginStatus;
  errorMessage: string | null;
  restartRequired: boolean;
  permissions: PluginPermissions;
  grantedPermissions: PluginPermissions | null;
  settings: PluginSettingSchema[];
  settingValues: Record<string, string | number | boolean>;
  secretsSet: string[];
}

export interface PluginSummaryView {
  id: string;
  name: string;
  version: string;
  description: string | null;
  enabled: boolean;
}
