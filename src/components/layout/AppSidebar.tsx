import { NavList } from '@/components/nav/NavList';
import { SidebarBrand } from '@/components/layout/SidebarBrand';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { getNavGroupsByPosition } from '@/config/navigation';
import { APP_COMMIT_HASH, APP_NAME, APP_VERSION } from '@/config/app';
import { useNavigation } from '@/contexts/NavigationContext';
import { useNavItems } from '@/hooks/use-nav-items';

export function AppSidebar() {
  const navItems = useNavItems();
  const { activeId, navigate } = useNavigation();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader data-tauri-drag-region className="h-14 justify-center p-2">
        <SidebarBrand title={APP_NAME} version={APP_VERSION} commitHash={APP_COMMIT_HASH} />
      </SidebarHeader>
      <SidebarContent>
        {getNavGroupsByPosition('top', navItems).map((group) => (
          <NavList
            key={group.label ?? 'top'}
            label={group.label}
            items={group.items}
            activeId={activeId}
            onSelect={navigate}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-0">
        {getNavGroupsByPosition('bottom', navItems).map((group) => (
          <NavList
            key={group.label ?? 'bottom'}
            label={group.label}
            items={group.items}
            activeId={activeId}
            onSelect={navigate}
          />
        ))}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
