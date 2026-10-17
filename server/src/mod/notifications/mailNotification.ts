import type { NotificationPayload } from './protocol.js';

export interface MailNotificationInput {
  mail: {
    account: string;
    from: string;
    subject: string;
    body: string;
    receivedAt: Date;
  };
  jev: {
    relevance: number;
    hasDeadline: number;
  };
  claude: {
    summary: string;
    deadline: string | null;
  } | null;
}

const TITLE_MAX = 80;
const SUMMARY_MAX = 120;
const URGENT_RELEVANCE = 0.9;
const DEADLINE_THRESHOLD = 0.5;

const squash = (text: string): string => text.replace(/\s+/g, ' ').trim();

const truncate = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export const buildMailNotification = ({ mail, jev, claude }: MailNotificationInput): NotificationPayload => {
  const hasDeadline = claude?.deadline != null || jev.hasDeadline >= DEADLINE_THRESHOLD;
  const summary = claude?.summary || truncate(squash(mail.body), SUMMARY_MAX) || mail.subject;

  const lines = [summary, `差出人: ${mail.from}`];
  if (claude?.deadline) {
    lines.push(`期限: ${claude.deadline}`);
  } else if (hasDeadline) {
    lines.push('期限: あり(本文を確認してください)');
  }
  lines.push(`アカウント: ${mail.account}`);

  const urgent = hasDeadline || jev.relevance >= URGENT_RELEVANCE;
  return {
    kind: 'mail',
    priority: urgent ? 'urgent' : 'normal',
    title: truncate(mail.subject || '(件名なし)', TITLE_MAX),
    body: lines.join('\n'),
    mail: {
      account: mail.account,
      from: mail.from,
      subject: mail.subject,
      receivedAt: mail.receivedAt.toISOString(),
      summary,
      deadline: claude?.deadline ?? null,
    },
  };
};
