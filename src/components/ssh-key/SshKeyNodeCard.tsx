import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DetailRow } from '@/components/form/DetailRow';
import { CopyPublicKeyButton } from '@/components/ssh-key/CopyPublicKeyButton';
import { RegenerateSshKeyDialog } from '@/components/ssh-key/RegenerateSshKeyDialog';
import { SshKeyCardSkeleton } from '@/components/ssh-key/SshKeyCardSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSshKey } from '@/hooks/use-ssh-key';

type SshKeyNodeCardProps = {
  nodeId: string;
};

export function SshKeyNodeCard({ nodeId }: SshKeyNodeCardProps) {
  const { sshKey, loading, error, regenerate } = useSshKey(nodeId);
  const [regenerating, setRegenerating] = useState(false);

  if (loading) return <SshKeyCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Git 用の SSH 公開鍵</CardTitle>
        <CardDescription>
          GitHub の「Settings → SSH and GPG keys → New SSH key」にこの公開鍵を登録すると、ノードが private
          リポジトリを取得できます。 リポジトリの URL には{' '}
          <code className="text-xs">git@github.com:owner/repository</code> の形式を使います。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {sshKey && (
          <>
            <Textarea
              readOnly
              value={sshKey.publicKey}
              rows={3}
              spellCheck={false}
              aria-label="SSH 公開鍵"
              className="resize-none font-mono text-xs break-all"
              onFocus={(event) => event.currentTarget.select()}
            />
            <dl>
              <DetailRow label="フィンガープリント">
                <span className="font-mono text-xs">{sshKey.fingerprint}</span>
              </DetailRow>
              <DetailRow label="作成日時">{new Date(sshKey.createdAt).toLocaleString('ja-JP')}</DetailRow>
            </dl>
            <div className="flex flex-wrap gap-2">
              <CopyPublicKeyButton publicKey={sshKey.publicKey} />
              <Button className="cursor-pointer" variant="outline" onClick={() => setRegenerating(true)}>
                <RefreshCw />
                再生成
              </Button>
            </div>
            <RegenerateSshKeyDialog open={regenerating} onOpenChange={setRegenerating} onConfirm={regenerate} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
