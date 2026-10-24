import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PageSearchProvider } from '@/contexts/PageSearchContext';
import { useNavigation } from '@/contexts/NavigationContext';

type AppLayoutProps = {
  children?: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { activeId } = useNavigation();

  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden bg-sidebar text-foreground">
      <AppSidebar />
      <SidebarInset className="min-h-0 min-w-0 bg-sidebar">
        <GlobalHeader />
        <PageSearchProvider key={activeId}>
          <div className="min-h-0 flex-1 overflow-auto bg-background">{children}</div>
        </PageSearchProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
