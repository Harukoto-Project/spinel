import { Puzzle, icons, type LucideIcon } from 'lucide-react';

const iconMap = icons as unknown as Record<string, LucideIcon | undefined>;

function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

export function resolvePageIcon(name: string | undefined): LucideIcon {
  if (!name) return Puzzle;
  return iconMap[name] ?? iconMap[toPascalCase(name)] ?? Puzzle;
}
