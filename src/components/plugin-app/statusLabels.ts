import type { SetupStatus, SetupStepStatus, TaskStatus, WidgetTone } from '@/types/pluginApp';

type StatusLabel = {
  label: string;
  tone: WidgetTone;
};

export const TASK_STATUS_LABELS: Record<TaskStatus, StatusLabel> = {
  idle: { label: '未実行', tone: 'neutral' },
  running: { label: '実行中', tone: 'info' },
  success: { label: '完了', tone: 'success' },
  failed: { label: '失敗', tone: 'danger' },
  stopped: { label: '停止', tone: 'warning' },
  timeout: { label: 'タイムアウト', tone: 'danger' },
};

export const SETUP_STATUS_LABELS: Record<SetupStatus, StatusLabel> = {
  idle: { label: '未完了', tone: 'neutral' },
  running: { label: '実行中', tone: 'info' },
  success: { label: '完了', tone: 'success' },
  failed: { label: '失敗', tone: 'danger' },
};

export const SETUP_STEP_STATUS_LABELS: Record<SetupStepStatus, StatusLabel> = {
  pending: { label: '待機中', tone: 'neutral' },
  running: { label: '実行中', tone: 'info' },
  success: { label: '完了', tone: 'success' },
  skipped: { label: 'スキップ', tone: 'neutral' },
  failed: { label: '失敗', tone: 'danger' },
};
