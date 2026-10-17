import { NodeDetailRow } from '@/components/nodes/NodeDetailRow';
import { NodeStatusBadge } from '@/components/nodes/NodeStatusBadge';
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
              <NodeDetailRow label="ステータス">
                <NodeStatusBadge status={node.status} />
              </NodeDetailRow>
              <NodeDetailRow label="OS">{health?.os.name ?? EMPTY_VALUE}</NodeDetailRow>
              <NodeDetailRow label="バージョン">{health?.version ?? EMPTY_VALUE}</NodeDetailRow>
              <NodeDetailRow label="起動時刻">
                {formatDateTime(health?.startedAt ?? null, { seconds: true })}
              </NodeDetailRow>
              <NodeDetailRow label="最終更新">
                {formatDateTime(health?.updatedAt ?? null, { seconds: true })}
              </NodeDetailRow>
              <NodeDetailRow label="Ping">{formatPing(node.pingMs)}</NodeDetailRow>
              <NodeDetailRow label="最終接続">{formatDateTime(node.lastSeenAt, { seconds: true })}</NodeDetailRow>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
