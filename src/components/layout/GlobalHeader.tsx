import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { WindowControls } from '@/components/layout/WindowControls';
import { PageBreadcrumb } from '@/components/nav/PageBreadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { APP_NAME } from '@/config/app';
import { DEFAULT_NAV_ID, getNavTrail } from '@/config/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useNavItems } from '@/hooks/use-nav-items';

export function GlobalHeader() {
  const navItems = useNavItems();
  const { activeId, navigate } = useNavigation();

  return (
    <header
      data-tauri-drag-region
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-sidebar pl-4 md:pl-8"
    >
      <SidebarTrigger className="size-8" />
      <Separator orientation="vertical" className="pointer-events-none mr-1 data-[orientation=vertical]:h-4" />
      <PageBreadcrumb
        rootLabel={APP_NAME}
        trail={getNavTrail(activeId, navItems)}
        onRootClick={() => navigate(DEFAULT_NAV_ID)}
        onItemClick={navigate}
      />
      <div data-tauri-drag-region className="h-full min-w-2 flex-1" />
      <ThemeToggle />
      <WindowControls />
    </header>
  );
}
