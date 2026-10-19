import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CopyPublicKeyButtonProps = {
  publicKey: string;
};

const RESET_DELAY_MS = 2000;

export function CopyPublicKeyButton({ publicKey }: CopyPublicKeyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied && !failed) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [copied, failed]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
    } catch {
      setFailed(true);
    }
  };

  return (
    <Button className="cursor-pointer" variant="outline" onClick={() => void copy()}>
      {copied ? <Check /> : <Copy />}
      {copied ? 'コピーしました' : failed ? 'コピーできませんでした' : 'コピー'}
    </Button>
  );
}
