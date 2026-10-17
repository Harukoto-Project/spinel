import type { KeyboardEvent, ReactNode, Ref } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

type SearchBoxProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  hint?: ReactNode;
};

export function SearchBox({
  value,
  onValueChange,
  placeholder = '検索',
  className,
  inputRef,
  onKeyDown,
  hint,
}: SearchBoxProps) {
  return (
    <InputGroup className={cn('w-full sm:w-64', className)}>
      <InputGroupInput
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="検索をクリア" onClick={() => onValueChange('')}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : hint ? (
        <InputGroupAddon align="inline-end">{hint}</InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
