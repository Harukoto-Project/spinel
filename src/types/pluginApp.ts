export type PluginInputValue = string | number | boolean;
export type PluginInputValues = Record<string, PluginInputValue>;

export type PluginCommandKind = 'task' | 'query';
export type PluginInputType = 'choice' | 'string' | 'number' | 'boolean';
export type PluginInputDisplay = 'buttons' | 'select';

export type PluginCommandInput = {
  key: string;
  type: PluginInputType;
  label: string;
  description: string | null;
  options: string[] | null;
  default: PluginInputValue | null;
  required: boolean;
  arg: string | null;
  flag: string | null;
  display: PluginInputDisplay | null;
  consent?: string | null;
};

export type PluginAppCommand = {
  id: string;
  label: string;
  description: string | null;
  kind: PluginCommandKind;
  exclusive: string | null;
  inputs: PluginCommandInput[];
};

export type PluginAppSetupStepInfo = {
  id: string;
  label: string;
};

export type PluginAppSource = {
  repo: string;
  ref: string | null;
};

export type WidgetTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

type WidgetBase = {
  label: string | null;
};

export type ProgressWidget = WidgetBase & {
  type: 'progress';
  value: string;
  detail: string | null;
};

export type StatWidget = WidgetBase & {
  type: 'stat';
  value: string;
};

export type TextWidget = WidgetBase & {
  type: 'text';
  value: string;
};

export type BadgeWidget = WidgetBase & {
  type: 'badge';
  value: string;
  labels: Record<string, string>;
  tones: Record<string, WidgetTone>;
};

export type TableColumn = {
  label: string;
  value: string;
};

export type TableWidget = WidgetBase & {
  type: 'table';
  rows: string;
  columns: TableColumn[];
  empty: string | null;
  maxRows: number | null;
};

export type PluginWidget = ProgressWidget | StatWidget | TextWidget | BadgeWidget | TableWidget;

type PanelBase = {
  id: string;
  title: string;
  description: string | null;
  tab: string | null;
};

export type ActionsPanel = PanelBase & {
  type: 'actions';
  commands: string[];
  settings: string[];
};

export type ConsolePanel = PanelBase & {
  type: 'console';
  commands: string[];
};

export type StatusPanel = PanelBase & {
  type: 'status';
  query: string;
  intervalSec: number;
  widgets: PluginWidget[];
};

export type PluginPanel = ActionsPanel | ConsolePanel | StatusPanel;

export type PluginAppView = {
  source: PluginAppSource | null;
  setup: PluginAppSetupStepInfo[];
  commands: PluginAppCommand[];
  panels: PluginPanel[];
};

export type SetupStepStatus = 'pending' | 'running' | 'success' | 'skipped' | 'failed';
export type SetupStatus = 'idle' | 'running' | 'success' | 'failed';

export type SetupStepState = {
  id: string;
  label: string;
  status: SetupStepStatus;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
};

export type SetupState = {
  status: SetupStatus;
  steps: SetupStepState[];
};

export type TaskStatus = 'idle' | 'running' | 'success' | 'failed' | 'stopped' | 'timeout';

export type TaskState = {
  commandId: string;
  status: TaskStatus;
  startedAt: number | null;
  finishedAt: number | null;
  exitCode: number | null;
  inputs: PluginInputValues;
};

export type SourceState = {
  repo: string;
  ref: string | null;
  transport: 'https' | 'ssh';
  installedSha: string;
  updatedAt: number;
  present: boolean;
};

export type PluginAppOverview = {
  source: SourceState | null;
  setup: SetupState;
  tasks: TaskState[];
};

export type PluginLogEntry = {
  seq: number;
  text: string;
};

export type PluginLogChunk = {
  entries: PluginLogEntry[];
  next: number;
};

export type PluginTaskLogs = {
  logs: PluginLogChunk;
  task: TaskState;
};
