import { History, Key, LayoutDashboard, Mail, Settings, type LucideIcon } from 'lucide-react';

export type NavPosition = 'top' | 'bottom';

export type NavItemConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  position?: NavPosition;
  parentId?: string;
  group?: string;
  searchable?: boolean;
};

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'アプリケーション',
    searchable: true,
  },
  {
    id: 'email-notification-settings',
    label: 'メールの通知設定',
    icon: Mail,
    group: 'メール',
  },
  {
    id: 'mail-history',
    label: '通知履歴',
    icon: History,
    group: 'メール',
    searchable: true,
  },
  {
    id: 'mail-accounts',
    label: 'メールアカウント',
    icon: Mail,
    group: '設定',
    position: 'bottom',
  },
  {
    id: 'api-settings',
    label: 'APIキーの設定',
    icon: Key,
    group: '設定',
    position: 'bottom',
  },
  {
    id: 'settings',
    label: '設定',
    icon: Settings,
    group: '設定',
    position: 'bottom',
  }
];

export const DEFAULT_NAV_ID = NAV_ITEMS[0].id;

export function getNavItemsByPosition(position: NavPosition): NavItemConfig[] {
  return NAV_ITEMS.filter((item) => (item.position ?? 'top') === position);
}

export type NavGroupConfig = {
  label?: string;
  items: NavItemConfig[];
};

export function getNavGroupsByPosition(position: NavPosition): NavGroupConfig[] {
  const groups: NavGroupConfig[] = [];

  for (const item of getNavItemsByPosition(position)) {
    const existing = groups.find((group) => group.label === item.group);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ label: item.group, items: [item] });
    }
  }

  return groups;
}

export function isNavSearchable(id: string): boolean {
  return NAV_ITEMS.find((item) => item.id === id)?.searchable ?? false;
}

export function getNavTrail(id: string): NavItemConfig[] {
  const trail: NavItemConfig[] = [];
  const visited = new Set<string>();
  let current = NAV_ITEMS.find((item) => item.id === id);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    const parentId = current.parentId;
    current = parentId ? NAV_ITEMS.find((item) => item.id === parentId) : undefined;
  }

  return trail;
}
