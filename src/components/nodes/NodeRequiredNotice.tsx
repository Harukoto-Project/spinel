import { Server } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

export function NodeRequiredNotice() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Server />
        </EmptyMedia>
        <EmptyTitle>ノードがありません</EmptyTitle>
        <EmptyDescription>
          この設定はノードごとに行います。Dashboard でノードを追加してから設定してください。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
