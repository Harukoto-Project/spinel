import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';

type ThemeOption = {
  mode: ThemeMode;
  label: string;
  icon: LucideIcon;
};

const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'system', label: '自動', icon: Monitor },
  { mode: 'light', label: 'ライト', icon: Sun },
  { mode: 'dark', label: 'ダーク', icon: Moon },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={mode}
      onValueChange={(value) => {
        if (value) setMode(value as ThemeMode);
      }}
      aria-label="テーマ"
    >
      {THEME_OPTIONS.map(({ mode: optionMode, label, icon: Icon }) => (
        <Tooltip key={optionMode}>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={optionMode} aria-label={label} className="size-8 cursor-pointer px-0">
              <Icon />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
