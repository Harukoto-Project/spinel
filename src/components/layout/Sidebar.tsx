import { NavList } from '@/components/nav/NavList';
import { SidebarBrand } from '@/components/layout/SidebarBrand';
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getNavGroupsByPosition } from '@/config/navigation';
import { APP_COMMIT_HASH, APP_NAME, APP_VERSION } from '@/config/app';
import { useNavItems } from '@/hooks/use-nav-items';

type SidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const navItems = useNavItems();

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader data-tauri-drag-region>
        <SidebarBrand title={APP_NAME} version={APP_VERSION} commitHash={APP_COMMIT_HASH} />
      </SidebarHeader>
      <SidebarContent>
        {getNavGroupsByPosition('top', navItems).map((group) => (
          <NavList
            key={group.label ?? 'top'}
            label={group.label}
            items={group.items}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {getNavGroupsByPosition('bottom', navItems).map((group) => (
          <NavList
            key={group.label ?? 'bottom'}
            label={group.label}
            items={group.items}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
      </SidebarFooter>
      <SidebarRail />
    </SidebarRoot>
  );
}
