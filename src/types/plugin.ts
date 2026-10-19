import type { PluginAppView } from '@/types/pluginApp';

export type PluginSettingType = 'string' | 'number' | 'boolean' | 'secret' | 'path' | 'select';

export type PluginSettingValue = string | number | boolean;

export type PluginSettingSchema = {
  key: string;
  type: PluginSettingType;
  label: string;
  description: string | null;
  default: PluginSettingValue | null;
  required: boolean;
  options: string[] | null;
};

export type PluginPermissions = {
  routes: boolean;
  storage: boolean;
  notify: boolean;
  process: boolean;
  build: boolean;
  network: string[];
};

export type PluginStatus = 'disabled' | 'active' | 'error';

export type PluginSummary = {
  id: string;
  name: string;
  version: string;
  description: string | null;
  enabled: boolean;
};

export type PluginRepository = {
  id: string;
  url: string;
  name: string;
  installedSha: string;
  updatedAt: number;
  plugins: PluginSummary[];
};

export type Plugin = {
  id: string;
  repoId: string;
  name: string;
  version: string;
  description: string | null;
  hasServer: boolean;
  hasFront: boolean;
  frontEntry: string | null;
  hasApp: boolean;
  app: PluginAppView | null;
  enabled: boolean;
  status: PluginStatus;
  errorMessage: string | null;
  restartRequired: boolean;
  permissions: PluginPermissions;
  grantedPermissions: PluginPermissions | null;
  settings: PluginSettingSchema[];
  settingValues: Record<string, PluginSettingValue>;
  secretsSet: string[];
};

export type PluginSettingsUpdate = Record<string, PluginSettingValue | null>;
