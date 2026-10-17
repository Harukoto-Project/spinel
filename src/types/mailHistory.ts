import type { MailProviderId } from '@/types/mailAccount';
import type { NotificationPriority } from '@/types/notification';

export type MailDecision = 'notify' | 'ignore';

export type MailHistoryEntry = {
  id: string;
  accountId: string;
  accountName: string;
  accountEmail: string;
  provider: MailProviderId;
  from: string;
  subject: string;
  receivedAt: number;
  processedAt: number;
  decision: MailDecision;
  priority: NotificationPriority | null;
  summary: string | null;
  deadline: string | null;
};

export type MailHistoryFilters = {
  accountId: string;
  decision: string;
};

export type MailHistoryAccountOption = {
  id: string;
  label: string;
};
