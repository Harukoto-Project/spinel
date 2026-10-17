import type { LucideIcon } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function NavItem({ icon: Icon, label, active = false, onClick }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} tooltip={label} onClick={onClick} aria-current={active ? 'page' : undefined}>
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
