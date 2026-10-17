import { useState, type ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DEFAULT_NAV_ID } from '@/config/navigation';
import { NodesProvider } from '@/contexts/NodesContext';
import { ApiSettingsPage } from '@/pages/ApiSettingsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EmailNotificationSettingsPage } from '@/pages/EmailNotificationSettingsPage';
import { MailAccountsPage } from '@/pages/MailAccountsPage';

const PAGES: Record<string, ReactNode> = {
  dashboard: <DashboardPage />,
  'email-notification-settings': <EmailNotificationSettingsPage />,
  'api-settings': <ApiSettingsPage />,
  'mail-accounts': <MailAccountsPage />,
};

function App() {
  const [activeId, setActiveId] = useState(DEFAULT_NAV_ID);

  return (
    <NodesProvider>
      <AppLayout activeId={activeId} onSelect={setActiveId}>
        {PAGES[activeId]}
      </AppLayout>
    </NodesProvider>
  );
}

export default App;
