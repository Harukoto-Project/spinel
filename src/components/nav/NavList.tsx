import { NavItem } from '@/components/nav/NavItem';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import type { NavItemConfig } from '@/config/navigation';

type NavListProps = {
  label?: string;
  items: NavItemConfig[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function NavList({ label, items, activeId, onSelect }: NavListProps) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      {label ? (
        <SidebarGroupLabel className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={item.id === activeId}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
