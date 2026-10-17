type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>;
}
