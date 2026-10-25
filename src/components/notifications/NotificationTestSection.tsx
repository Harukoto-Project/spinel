import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { PageSection } from '@/components/common/PageSection';
import { Button } from '@/components/ui/button';
import { PRIORITY_LABELS } from '@/config/notifications';
import { describeError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { sendTestNotification } from '@/services/notificationStorage';
import type { NotificationPriority } from '@/types/notification';

const TEST_PRIORITIES: NotificationPriority[] = ['normal', 'urgent'];

type NotificationTestSectionProps = {
  nodeId: string;
  connected: boolean;
};

type TestResult = {
  ok: boolean;
  message: string;
};

export function NotificationTestSection({ nodeId, connected }: NotificationTestSectionProps) {
  const [sending, setSending] = useState<NotificationPriority | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  const send = async (priority: NotificationPriority) => {
    setSending(priority);
    setResult(null);
    try {
      const delivered = await sendTestNotification(nodeId, priority);
      setResult(
        delivered > 0
          ? { ok: true, message: 'テスト通知を送信しました。Windows の通知を確認してください。' }
          : { ok: false, message: '接続中のクライアントがないため、通知は届きませんでした。' },
      );
    } catch (caught) {
      setResult({ ok: false, message: describeError(caught) });
    } finally {
      setSending(null);
    }
  };

  return (
    <PageSection
      title="テスト通知"
      description="ノードからテスト通知を送信し、WebSocket 経由で Windows の通知が表示されるか確認します。接続済みのときに送信できます。"
      divided
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {TEST_PRIORITIES.map((priority) => (
          <Button
            key={priority}
            type="button"
            variant="outline"
            disabled={!connected || sending !== null}
            onClick={() => void send(priority)}
          >
            {sending === priority && <LoaderCircle className="animate-spin" />}
            {PRIORITY_LABELS[priority]}のテスト通知を送信
          </Button>
        ))}
      </div>
      {result && (
        <p role="status" className={cn('text-sm', result.ok ? 'text-muted-foreground' : 'text-destructive')}>
          {result.message}
        </p>
      )}
    </PageSection>
  );
}
