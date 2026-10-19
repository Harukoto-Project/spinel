import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SshKeyCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
