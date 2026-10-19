export const APP_PLATFORMS = ['windows', 'linux', 'darwin'] as const;
export type AppPlatform = (typeof APP_PLATFORMS)[number];

export const BUILTIN_PLACEHOLDERS = ['source', 'plugin', 'data'] as const;

export const WIDGET_FORMATS = ['duration', 'percent', 'datetime', 'number'] as const;
export type WidgetFormat = (typeof WIDGET_FORMATS)[number];

export const WIDGET_TONES = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
export type WidgetTone = (typeof WIDGET_TONES)[number];

export const QUERY_TIMEOUT_DEFAULT_SEC = 60;
export const TIMEOUT_MAX_SEC = 3600;

export interface PluginSource {
  repo: string;
  ref: string | null;
}

export interface PluginVars {
  base: Record<string, string>;
  platforms: Partial<Record<AppPlatform, Record<string, string>>>;
}

export interface PluginSetupStep {
  id: string;
  label: string;
  run: string[];
  cwd: string | null;
  skipIfExists: string | null;
  timeoutSec: number | null;
}

export const COMMAND_KINDS = ['task', 'query'] as const;
export type PluginCommandKind = (typeof COMMAND_KINDS)[number];

export const INPUT_TYPES = ['choice', 'string', 'number', 'boolean'] as const;
export type PluginInputType = (typeof INPUT_TYPES)[number];

export const INPUT_DISPLAYS = ['buttons', 'select'] as const;
export type PluginInputDisplay = (typeof INPUT_DISPLAYS)[number];

export type PluginInputDefault = string | number | boolean;

export interface PluginCommandInput {
  key: string;
  type: PluginInputType;
  label: string;
  description: string | null;
  options: string[] | null;
  default: PluginInputDefault | null;
  required: boolean;
  arg: string | null;
  flag: string | null;
  display: PluginInputDisplay | null;
  consent: string | null;
}

export interface PluginCommand {
  id: string;
  label: string;
  description: string | null;
  kind: PluginCommandKind;
  run: string[];
  cwd: string | null;
  stdin: string[];
  env: Record<string, string>;
  exclusive: string | null;
  timeoutSec: number | null;
  inputs: PluginCommandInput[];
}

export interface WidgetBase {
  label: string | null;
}

export interface ProgressWidget extends WidgetBase {
  type: 'progress';
  value: string;
  detail: string | null;
}

export interface StatWidget extends WidgetBase {
  type: 'stat';
  value: string;
}

export interface TextWidget extends WidgetBase {
  type: 'text';
  value: string;
}

export interface BadgeWidget extends WidgetBase {
  type: 'badge';
  value: string;
  labels: Record<string, string>;
  tones: Record<string, WidgetTone>;
}

export interface TableColumn {
  label: string;
  value: string;
}

export interface TableWidget extends WidgetBase {
  type: 'table';
  rows: string;
  columns: TableColumn[];
  empty: string | null;
  maxRows: number | null;
}

export type PluginWidget = ProgressWidget | StatWidget | TextWidget | BadgeWidget | TableWidget;

export interface PanelBase {
  id: string;
  title: string;
  description: string | null;
  tab: string | null;
}

export interface ActionsPanel extends PanelBase {
  type: 'actions';
  commands: string[];
  settings: string[];
}

export interface ConsolePanel extends PanelBase {
  type: 'console';
  commands: string[];
}

export interface StatusPanel extends PanelBase {
  type: 'status';
  query: string;
  intervalSec: number;
  widgets: PluginWidget[];
}

export type PluginPanel = ActionsPanel | ConsolePanel | StatusPanel;

export interface PluginAppSpec {
  source: PluginSource | null;
  vars: PluginVars;
  setup: PluginSetupStep[];
  commands: PluginCommand[];
  panels: PluginPanel[];
}

export const EMPTY_APP_SPEC: PluginAppSpec = {
  source: null,
  vars: { base: {}, platforms: {} },
  setup: [],
  commands: [],
  panels: [],
};

export const hasAppSpec = (app: PluginAppSpec): boolean =>
  app.source !== null || app.setup.length > 0 || app.commands.length > 0 || app.panels.length > 0;
