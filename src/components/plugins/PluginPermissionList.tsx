import { Badge } from '@/components/ui/badge';
import { NETWORK_ANY_ORIGIN, PLUGIN_PERMISSIONS } from '@/config/pluginPermissions';
import type { PluginPermissions } from '@/types/plugin';

type PluginPermissionListProps = {
  permissions: PluginPermissions;
};

type PermissionItem = {
  id: string;
  label: string;
  description: string;
  dangerous: boolean;
};

function listPermissionItems(permissions: PluginPermissions): PermissionItem[] {
  const items: PermissionItem[] = PLUGIN_PERMISSIONS.filter((definition) => permissions[definition.key]).map(
    (definition) => ({
      id: definition.key,
      label: definition.label,
      description: definition.description,
      dangerous: definition.dangerous ?? false,
    }),
  );

  for (const origin of permissions.network) {
    const any = origin === NETWORK_ANY_ORIGIN;
    items.push({
      id: `network:${origin}`,
      label: any ? 'すべてのサイトへの通信' : `${origin} への通信`,
      description: any
        ? 'ノードから任意のサイトへ通信します。'
        : 'ノードから、このサイトへ通信します。',
      dangerous: any,
    });
  }

  return items;
}

export function PluginPermissionList({ permissions }: PluginPermissionListProps) {
  const items = listPermissionItems(permissions);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">特別な権限は必要ありません。</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="break-all">{item.label}</span>
            {item.dangerous && <Badge variant="destructive">強い権限</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
