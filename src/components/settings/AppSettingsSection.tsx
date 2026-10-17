import { AppSettingsCard } from '@/components/settings/AppSettingsCard';
import { AppSettingsCardSkeleton } from '@/components/settings/AppSettingsCardSkeleton';
import { useAppSettings } from '@/hooks/use-app-settings';

export function AppSettingsSection() {
  const { settings, loading, error, save } = useAppSettings();

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? <AppSettingsCardSkeleton /> : settings && <AppSettingsCard settings={settings} onSave={save} />}
    </div>
  );
}
