import * as React from 'react';

type HotkeyOptions = {
  key: string;
  withModifier?: boolean;
};

export function useHotkey(handler: (event: KeyboardEvent) => void, options: HotkeyOptions) {
  const { key, withModifier = true } = options;
  const handlerRef = React.useRef(handler);

  React.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (withModifier && !(event.metaKey || event.ctrlKey)) return;
      handlerRef.current(event);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, withModifier]);
}

export function isMacPlatform(): boolean {
  return /Mac|iPhone|iPad/i.test(navigator.userAgent);
}
