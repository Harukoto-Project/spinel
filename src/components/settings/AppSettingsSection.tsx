import { AppSettingsForm } from '@/components/settings/AppSettingsForm';
import { AppSettingsFormSkeleton } from '@/components/settings/AppSettingsFormSkeleton';
import { useAppSettings } from '@/hooks/use-app-settings';

export function AppSettingsSection() {
  const { settings, loading, error, save } = useAppSettings();

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? <AppSettingsFormSkeleton /> : settings && <AppSettingsForm settings={settings} onSave={save} />}
    </>
  );
}
