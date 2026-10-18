import { WindowControls } from '@/components/layout/WindowControls';
import { PageBreadcrumb } from '@/components/nav/PageBreadcrumb';
import { HeaderSearch } from '@/components/search/HeaderSearch';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getNavTrail, isNavSearchable } from '@/config/navigation';

type AppHeaderProps = {
  activeId: string;
};

export function AppHeader({ activeId }: AppHeaderProps) {
  return (
    <header data-tauri-drag-region className="flex h-14 shrink-0 items-center gap-2 border-b pl-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="pointer-events-none mr-2 data-[orientation=vertical]:h-4" />
      <PageBreadcrumb trail={getNavTrail(activeId)} />
      <div data-tauri-drag-region className="h-full min-w-4 flex-1" />
      {isNavSearchable(activeId) ? <HeaderSearch /> : null}
      <WindowControls />
    </header>
  );
}
