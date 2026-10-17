import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PageSearchProvider } from '@/contexts/PageSearchContext';

type AppLayoutProps = {
  activeId: string;
  onSelect: (id: string) => void;
  children?: ReactNode;
};

export function AppLayout({ activeId, onSelect, children }: AppLayoutProps) {
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden bg-background text-foreground">
      <Sidebar activeId={activeId} onSelect={onSelect} />
      <SidebarInset className="min-h-0 min-w-0">
        <PageSearchProvider key={activeId}>
          <AppHeader activeId={activeId} />
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </PageSearchProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
