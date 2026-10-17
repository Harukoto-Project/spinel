import { useState, type ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DEFAULT_NAV_ID } from '@/config/navigation';
import { ApiSettingsPage } from '@/pages/ApiSettingsPage';
import { DashboardPage } from '@/pages/DashboardPage';

const PAGES: Record<string, ReactNode> = {
  dashboard: <DashboardPage />,
  'api-settings': <ApiSettingsPage />,
};

function App() {
  const [activeId, setActiveId] = useState(DEFAULT_NAV_ID);

  return (
    <AppLayout activeId={activeId} onSelect={setActiveId}>
      {PAGES[activeId]}
    </AppLayout>
  );
}

export default App;
