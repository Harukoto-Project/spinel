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

type SidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader>
        <SidebarBrand title={APP_NAME} version={APP_VERSION} commitHash={APP_COMMIT_HASH} />
      </SidebarHeader>
      <SidebarContent>
        {getNavGroupsByPosition('top').map((group) => (
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
        {getNavGroupsByPosition('bottom').map((group) => (
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
