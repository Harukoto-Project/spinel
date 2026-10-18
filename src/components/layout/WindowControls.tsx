import { Copy, Minus, Square, X } from 'lucide-react';
import { WindowControlButton } from '@/components/layout/WindowControlButton';
import { useWindowMaximized } from '@/hooks/use-window-maximized';
import { closeWindow, minimizeWindow, toggleMaximizeWindow } from '@/services/windowControls';

export function WindowControls() {
  const maximized = useWindowMaximized();

  return (
    <div className="flex h-full shrink-0 items-stretch">
      <WindowControlButton label="最小化" onClick={() => void minimizeWindow()}>
        <Minus />
      </WindowControlButton>
      <WindowControlButton label={maximized ? '元に戻す' : '最大化'} onClick={() => void toggleMaximizeWindow()}>
        {maximized ? <Copy className="-scale-x-100" /> : <Square className="size-3.5!" />}
      </WindowControlButton>
      <WindowControlButton label="閉じる" danger onClick={() => void closeWindow()}>
        <X />
      </WindowControlButton>
    </div>
  );
}
