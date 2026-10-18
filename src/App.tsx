import { useEffect, useState, type ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PluginPageFrame } from '@/components/plugins/PluginPageFrame';
import { PluginPageSkeleton } from '@/components/plugins/PluginPageSkeleton';
import { DEFAULT_NAV_ID } from '@/config/navigation';
import { ActiveNodeProvider } from '@/contexts/ActiveNodeContext';
import { NodesProvider } from '@/contexts/NodesContext';
import { PluginPagesProvider, usePluginPages } from '@/contexts/PluginPagesContext';
import { isPluginNavId } from '@/plugins/registeredPage';
import { ApiSettingsPage } from '@/pages/ApiSettingsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EmailNotificationSettingsPage } from '@/pages/EmailNotificationSettingsPage';
import { MailAccountsPage } from '@/pages/MailAccountsPage';
import { MailHistoryPage } from '@/pages/MailHistoryPage';
import { PluginsPage } from '@/pages/PluginsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const PLUGINS_NAV_ID = 'plugins';

const PAGES: Record<string, ReactNode> = {
  dashboard: <DashboardPage />,
  'email-notification-settings': <EmailNotificationSettingsPage />,
  'mail-history': <MailHistoryPage />,
  [PLUGINS_NAV_ID]: <PluginsPage />,
  'api-settings': <ApiSettingsPage />,
  'mail-accounts': <MailAccountsPage />,
  settings: <SettingsPage />,
};

function AppContent() {
  const [activeId, setActiveId] = useState(DEFAULT_NAV_ID);
  const { pages, status } = usePluginPages();

  const pluginPage = pages.find((page) => page.navId === activeId);
  const pluginPageMissing = isPluginNavId(activeId) && status === 'ready' && !pluginPage;

  useEffect(() => {
    if (pluginPageMissing) setActiveId(PLUGINS_NAV_ID);
  }, [pluginPageMissing]);

  const content = pluginPage ? (
    <PluginPageFrame key={pluginPage.navId} page={pluginPage} />
  ) : isPluginNavId(activeId) ? (
    <PluginPageSkeleton />
  ) : (
    PAGES[activeId]
  );

  return (
    <AppLayout activeId={activeId} onSelect={setActiveId}>
      {content}
    </AppLayout>
  );
}

function App() {
  return (
    <NodesProvider>
      <ActiveNodeProvider>
        <PluginPagesProvider>
          <AppContent />
        </PluginPagesProvider>
      </ActiveNodeProvider>
    </NodesProvider>
  );
}

export default App;
