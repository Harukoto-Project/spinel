import { DetailRow } from '@/components/form/DetailRow';
import { NodeStatusLabel } from '@/components/nodes/NodeStatusLabel';
import { EMPTY_VALUE, formatDateTime, formatPing } from '@/components/nodes/nodeFormat';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { NodeInfo } from '@/types/node';

type NodeDetailsDialogProps = {
  node: NodeInfo | null;
  onOpenChange: (open: boolean) => void;
};

export function NodeDetailsDialog({ node, onOpenChange }: NodeDetailsDialogProps) {
  const health = node?.health ?? null;

  return (
    <Dialog open={node !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {node && (
          <>
            <DialogHeader>
              <DialogTitle>{node.name}</DialogTitle>
              <DialogDescription>{node.address}</DialogDescription>
            </DialogHeader>
            <dl className="divide-y">
              <DetailRow label="ステータス">
                <NodeStatusLabel status={node.status} />
              </DetailRow>
              <DetailRow label="OS">{health?.os.name ?? EMPTY_VALUE}</DetailRow>
              <DetailRow label="バージョン">{health?.version ?? EMPTY_VALUE}</DetailRow>
              <DetailRow label="起動時刻">{formatDateTime(health?.startedAt ?? null, { seconds: true })}</DetailRow>
              <DetailRow label="最終更新">{formatDateTime(health?.updatedAt ?? null, { seconds: true })}</DetailRow>
              <DetailRow label="Ping">{formatPing(node.pingMs)}</DetailRow>
              <DetailRow label="最終接続">{formatDateTime(node.lastSeenAt, { seconds: true })}</DetailRow>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
