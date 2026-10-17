type SidebarTitleProps = {
  title: string;
};

export function SidebarTitle({ title }: SidebarTitleProps) {
  return <span className="truncate font-semibold">{title}</span>;
}
