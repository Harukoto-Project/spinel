import { Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DEFAULT_NAV_ID } from '@/config/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

export function NodeRequiredNotice() {
  const { navigate } = useNavigation();

  return (
    <Empty className="border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Server />
        </EmptyMedia>
        <EmptyTitle>ノードがありません</EmptyTitle>
        <EmptyDescription>この設定はノードごとに行います。ダッシュボードでノードを追加してください。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => navigate(DEFAULT_NAV_ID)}>
          ダッシュボードを開く
        </Button>
      </EmptyContent>
    </Empty>
  );
}
