import { PageSection } from '@/components/common/PageSection';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_SETTING_FIELDS } from '@/config/appSettings';

export function AppSettingsFormSkeleton() {
  return (
    <PageSection>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className="flex max-w-3xl flex-col gap-6">
        {APP_SETTING_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-5 w-9" />
          </div>
        ))}
      </div>
    </PageSection>
  );
}
