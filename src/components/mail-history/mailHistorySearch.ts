import { FILTER_ALL } from '@/config/mailHistory';
import { formatAccountLabel } from '@/components/mail-history/mailHistoryFormat';
import type { MailHistoryAccountOption, MailHistoryEntry, MailHistoryFilters } from '@/types/mailHistory';

export function buildAccountOptions(items: MailHistoryEntry[]): MailHistoryAccountOption[] {
  const options = new Map<string, string>();
  for (const item of items) {
    if (!options.has(item.accountId)) {
      options.set(item.accountId, formatAccountLabel(item.accountName, item.accountEmail));
    }
  }
  return [...options].map(([id, label]) => ({ id, label }));
}

export function filterMailHistory(
  items: MailHistoryEntry[],
  query: string,
  filters: MailHistoryFilters,
): MailHistoryEntry[] {
  const keyword = query.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.accountId !== FILTER_ALL && item.accountId !== filters.accountId) return false;
    if (filters.decision !== FILTER_ALL && item.decision !== filters.decision) return false;
    if (!keyword) return true;

    const haystack = [item.subject, item.from, item.accountName, item.accountEmail, item.summary];
    return haystack.some((text) => text?.toLowerCase().includes(keyword));
  });
}
