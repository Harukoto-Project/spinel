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
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <PageBreadcrumb trail={getNavTrail(activeId)} />
      {isNavSearchable(activeId) ? <HeaderSearch /> : null}
    </header>
  );
}
