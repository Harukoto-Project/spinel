import { randomUUID } from 'node:crypto';
import type { NotificationPayload } from '../../notifications/protocol.js';
import type { Mail, MailHistoryEntry, MailDecision, StoredMailAccount } from '../types.js';

export const buildHistoryEntry = (
  account: StoredMailAccount,
  mail: Mail,
  decision: MailDecision,
  payload: NotificationPayload | null,
): MailHistoryEntry => {
  const receivedAt = mail.receivedAt.getTime();
  const processedAt = Date.now();

  return {
    id: randomUUID(),
    accountId: account.id,
    accountName: account.name,
    accountEmail: account.email,
    provider: account.provider,
    from: mail.from,
    subject: mail.subject,
    receivedAt: Number.isFinite(receivedAt) ? receivedAt : processedAt,
    processedAt,
    decision,
    priority: payload?.priority ?? null,
    summary: payload?.mail?.summary ?? null,
    deadline: payload?.mail?.deadline ?? null,
  };
};
