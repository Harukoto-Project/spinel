import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DetailRow } from '@/components/form/DetailRow';
import { CopyPublicKeyButton } from '@/components/ssh-key/CopyPublicKeyButton';
import { RegenerateSshKeyDialog } from '@/components/ssh-key/RegenerateSshKeyDialog';
import { SshKeySkeleton } from '@/components/ssh-key/SshKeySkeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSshKey } from '@/hooks/use-ssh-key';

type SshKeyNodeSettingsProps = {
  nodeId: string;
};

export function SshKeyNodeSettings({ nodeId }: SshKeyNodeSettingsProps) {
  const { sshKey, loading, error, regenerate } = useSshKey(nodeId);
  const [regenerating, setRegenerating] = useState(false);

  if (loading) return <SshKeySkeleton />;

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        GitHub の「Settings → SSH and GPG keys → New SSH key」にこの公開鍵を登録すると、ノードが private
        リポジトリを取得できます。リポジトリの URL には <code className="text-xs">git@github.com:owner/repository</code>{' '}
        の形式を使います。
      </p>
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
            <Button variant="outline" onClick={() => setRegenerating(true)}>
              <RefreshCw />
              鍵を再生成
            </Button>
          </div>
          <RegenerateSshKeyDialog open={regenerating} onOpenChange={setRegenerating} onConfirm={regenerate} />
        </>
      )}
    </div>
  );
}
