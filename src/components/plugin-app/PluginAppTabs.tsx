import { useMemo, useState } from 'react';
import { buildAppTabs, SETUP_TAB_ID } from '@/components/plugin-app/appTabs';
import { PanelView } from '@/components/plugin-app/PanelView';
import { SetupTab } from '@/components/plugin-app/SetupTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePluginAppContext } from '@/contexts/PluginAppContext';

export function PluginAppTabs() {
  const { app, setupReady } = usePluginAppContext();
  const tabs = useMemo(() => buildAppTabs(app), [app]);
  const [selected, setSelected] = useState<string | null>(() => {
    const initial = buildAppTabs(app);
    const setupTab = initial.find((tab) => tab.id === SETUP_TAB_ID);
    if (setupTab && !setupReady) return setupTab.id;
    return (initial.find((tab) => tab.id !== SETUP_TAB_ID) ?? initial[0])?.id ?? null;
  });

  if (tabs.length === 0) {
    return <p className="text-sm text-muted-foreground">表示できるパネルがありません</p>;
  }

  const current = tabs.find((tab) => tab.id === selected)?.id ?? tabs[0].id;

  return (
    <Tabs value={current} onValueChange={setSelected} className="gap-4">
      <div className="max-w-full overflow-x-auto">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="cursor-pointer px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="flex flex-col gap-8">
          {tab.id === SETUP_TAB_ID ? (
            <SetupTab />
          ) : (
            tab.panels.map((panel) => <PanelView key={panel.id} panel={panel} />)
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
