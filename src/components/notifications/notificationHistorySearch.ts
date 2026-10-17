import type { ReceivedNotification } from '@/types/notification';

export const UNKNOWN_NODE_NAME = '削除済みノード';

export function filterHistory(
  items: ReceivedNotification[],
  query: string,
  nodeNames: ReadonlyMap<string, string>,
): ReceivedNotification[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return items;

  return items.filter((item) => {
    const haystack = [
      nodeNames.get(item.nodeId) ?? UNKNOWN_NODE_NAME,
      item.title,
      item.body,
      item.mail?.account,
      item.mail?.from,
      item.mail?.subject,
    ];
    return haystack.some((text) => text?.toLowerCase().includes(keyword));
  });
}
