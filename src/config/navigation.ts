import { AtSign, Bell, History, Key, LayoutDashboard, Puzzle, Settings, type LucideIcon } from 'lucide-react';

export type NavPosition = 'top' | 'bottom';

export type NavItemConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  position?: NavPosition;
  parentId?: string;
  group?: string;
};

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    icon: LayoutDashboard,
    group: 'アプリケーション',
  },
  {
    id: 'mail-history',
    label: '通知履歴',
    icon: History,
    group: 'アプリケーション',
  },
  {
    id: 'email-notification-settings',
    label: 'メールの通知設定',
    icon: Bell,
    group: 'メール',
  },
  {
    id: 'mail-accounts',
    label: 'メールアカウント',
    icon: AtSign,
    group: 'メール',
  },
  {
    id: 'api-settings',
    label: 'APIキーの設定',
    icon: Key,
    group: '設定',
    position: 'bottom',
  },
  {
    id: 'plugins',
    label: 'プラグインの管理',
    icon: Puzzle,
    group: '設定',
    position: 'bottom',
  },
  {
    id: 'settings',
    label: 'アプリの設定',
    icon: Settings,
    group: '設定',
    position: 'bottom',
  },
];

export const DEFAULT_NAV_ID = NAV_ITEMS[0].id;

export function getNavItemsByPosition(position: NavPosition, items: NavItemConfig[] = NAV_ITEMS): NavItemConfig[] {
  return items.filter((item) => (item.position ?? 'top') === position);
}

export type NavGroupConfig = {
  label?: string;
  items: NavItemConfig[];
};

export function getNavGroupsByPosition(position: NavPosition, items: NavItemConfig[] = NAV_ITEMS): NavGroupConfig[] {
  const groups: NavGroupConfig[] = [];

  for (const item of getNavItemsByPosition(position, items)) {
    const existing = groups.find((group) => group.label === item.group);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ label: item.group, items: [item] });
    }
  }

  const labeled = groups.filter((group) => group.label && group.items.length >= 2);
  const unlabeledItems = groups
    .filter((group) => !group.label || group.items.length < 2)
    .flatMap((group) => group.items);

  return unlabeledItems.length > 0 ? [...labeled, { items: unlabeledItems }] : labeled;
}

export function getNavTrail(id: string, items: NavItemConfig[] = NAV_ITEMS): NavItemConfig[] {
  const trail: NavItemConfig[] = [];
  const visited = new Set<string>();
  let current = items.find((item) => item.id === id);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    const parentId = current.parentId;
    current = parentId ? items.find((item) => item.id === parentId) : undefined;
  }

  return trail;
}
