type WidgetLabelProps = {
  label: string | null;
};

export function WidgetLabel({ label }: WidgetLabelProps) {
  if (label === null) return null;
  return <p className="text-sm text-muted-foreground">{label}</p>;
}
