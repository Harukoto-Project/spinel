import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

type SettingRowProps = {
  label: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
};

export function SettingRow({ label, description, htmlFor, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
