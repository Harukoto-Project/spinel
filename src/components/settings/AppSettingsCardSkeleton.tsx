import { APP_SETTING_FIELDS } from '@/config/appSettings';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AppSettingsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {APP_SETTING_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-5 w-9" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
