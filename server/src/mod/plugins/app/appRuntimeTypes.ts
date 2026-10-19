import type { Transport } from '../GitClient.js';

export type InputValue = string | number | boolean;
export type InputValues = Record<string, InputValue>;

export type SetupStepStatus = 'pending' | 'running' | 'success' | 'skipped' | 'failed';
export type SetupStatus = 'idle' | 'running' | 'success' | 'failed';

export interface SetupStepView {
  id: string;
  label: string;
  status: SetupStepStatus;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface SetupView {
  status: SetupStatus;
  steps: SetupStepView[];
}

export type TaskStatus = 'idle' | 'running' | 'success' | 'failed' | 'stopped' | 'timeout';

export interface TaskView {
  commandId: string;
  status: TaskStatus;
  startedAt: number | null;
  finishedAt: number | null;
  exitCode: number | null;
  inputs: InputValues;
}

export interface SourceView {
  repo: string;
  ref: string | null;
  transport: Transport;
  installedSha: string;
  updatedAt: number;
  present: boolean;
}

export interface AppOverview {
  source: SourceView | null;
  setup: SetupView;
  tasks: TaskView[];
}

export interface LogChunk {
  entries: { seq: number; text: string }[];
  next: number;
}
