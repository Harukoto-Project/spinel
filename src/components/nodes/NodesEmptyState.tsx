import { Server } from 'lucide-react';
import { AddNodeButton } from '@/components/nodes/AddNodeButton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type NodesEmptyStateProps = {
  onAddNode?: () => void;
};

export function NodesEmptyState({ onAddNode }: NodesEmptyStateProps) {
  return (
    <Empty className="border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Server />
        </EmptyMedia>
        <EmptyTitle>ノードがありません</EmptyTitle>
        <EmptyDescription>まだノードが登録されていません。最初のノードを追加して始めましょう。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddNodeButton onClick={onAddNode} />
      </EmptyContent>
    </Empty>
  );
}
