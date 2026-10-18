import { useMemo } from 'react';
import { NAV_ITEMS, type NavItemConfig } from '@/config/navigation';
import { usePluginPages } from '@/contexts/PluginPagesContext';

export function useNavItems(): NavItemConfig[] {
  const { pages } = usePluginPages();

  return useMemo(
    () => [
      ...NAV_ITEMS,
      ...pages.map<NavItemConfig>((page) => ({
        id: page.navId,
        label: page.label,
        icon: page.icon,
        group: page.group,
        position: 'top',
      })),
    ],
    [pages],
  );
}
