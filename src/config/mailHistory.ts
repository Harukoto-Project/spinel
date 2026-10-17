import type { MailDecision, MailHistoryFilters } from '@/types/mailHistory';

export const FILTER_ALL = 'all';

export const DEFAULT_MAIL_HISTORY_FILTERS: MailHistoryFilters = {
  accountId: FILTER_ALL,
  decision: FILTER_ALL,
};

export const DECISION_LABELS: Record<MailDecision, string> = {
  notify: '通知',
  ignore: '除外',
};

export const DECISION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: FILTER_ALL, label: 'すべての判定' },
  { value: 'notify', label: DECISION_LABELS.notify },
  { value: 'ignore', label: DECISION_LABELS.ignore },
];
