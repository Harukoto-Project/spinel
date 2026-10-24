import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { AppSettingsSection } from '@/components/settings/AppSettingsSection';
import { SshKeySection } from '@/components/settings/SshKeySection';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="アプリの設定" />
      <PageBody>
        <AppSettingsSection />
        <SshKeySection />
      </PageBody>
    </>
  );
}
