import { SidebarTitle } from '@/components/layout/SidebarTitle';
import { VersionInfo } from '@/components/layout/VersionInfo';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { APP_LOGO_SRC } from '@/config/app';

type SidebarBrandProps = {
  title: string;
  version: string;
  commitHash?: string;
};

export function SidebarBrand({ title, version, commitHash }: SidebarBrandProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild tooltip={title} className="h-10 cursor-default">
          <div data-tauri-drag-region className="**:pointer-events-none select-none">
            <img src={APP_LOGO_SRC} alt="" draggable={false} className="size-8 shrink-0 object-contain" />
            <div className="grid flex-1 text-left leading-tight">
              <SidebarTitle title={title} />
              <VersionInfo version={version} commitHash={commitHash} />
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
