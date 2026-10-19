import type { ReactNode } from 'react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PanelCardProps = {
  title: string;
  description: string | null;
  action?: ReactNode;
  children: ReactNode;
};

export function PanelCard({ title, description, action, children }: PanelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
