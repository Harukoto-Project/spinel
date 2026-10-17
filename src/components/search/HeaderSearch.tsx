import { useRef, type KeyboardEvent } from 'react';
import { SearchBox } from '@/components/search/SearchBox';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { isMacPlatform, useHotkey } from '@/hooks/use-hotkey';
import { usePageSearch } from '@/contexts/PageSearchContext';

const SHORTCUT_KEY = 'k';

export function HeaderSearch() {
  const { query, setQuery } = usePageSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkey(
    (event) => {
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    { key: SHORTCUT_KEY },
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    if (query) {
      setQuery('');
    } else {
      event.currentTarget.blur();
    }
  };

  return (
    <SearchBox
      value={query}
      onValueChange={setQuery}
      placeholder="ページ内を検索"
      inputRef={inputRef}
      onKeyDown={handleKeyDown}
      className="ml-auto w-40 sm:w-64"
      hint={
        <KbdGroup className="max-sm:hidden">
          <Kbd>{isMacPlatform() ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      }
    />
  );
}
