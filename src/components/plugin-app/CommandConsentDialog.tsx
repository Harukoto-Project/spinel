import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import type { CommandConsent } from '@/components/plugin-app/commandInputDraft';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type CommandConsentDialogProps = {
  commandLabel: string;
  consents: CommandConsent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function CommandConsentDialog({
  commandLabel,
  consents,
  open,
  onOpenChange,
  onConfirm,
}: CommandConsentDialogProps) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (open) setChecked(new Set());
  }, [open]);

  const allChecked = consents.every((consent) => checked.has(consent.key));

  const toggle = (key: string, value: boolean) => {
    setChecked((current) => {
      const next = new Set(current);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>「{commandLabel}」を実行しますか?</DialogTitle>
          <DialogDescription>次の内容を確認して、同意する場合はチェックを入れてください。</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {consents.map((consent) => (
            <div key={consent.key} className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id={`consent-${consent.key}`}
                className="mt-0.5 cursor-pointer"
                checked={checked.has(consent.key)}
                onCheckedChange={(value) => toggle(consent.key, value === true)}
              />
              <Label
                htmlFor={`consent-${consent.key}`}
                className="flex min-w-0 cursor-pointer flex-col items-start gap-1 break-words leading-snug"
              >
                <span className="font-medium">{consent.label}</span>
                <span className="text-sm font-normal text-muted-foreground">{consent.text}</span>
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button className="cursor-pointer" disabled={!allChecked} onClick={onConfirm}>
            <Play />
            同意して実行
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
