import { PageHeader } from '@/components/layout/PageHeader';
import { AppSettingsSection } from '@/components/settings/AppSettingsSection';
import { SshKeySection } from '@/components/settings/SshKeySection';

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <PageHeader title="設定" />
      <AppSettingsSection />
      <SshKeySection />
    </div>
  );
}
