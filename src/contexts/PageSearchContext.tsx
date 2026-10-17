import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type PageSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const PageSearchContext = createContext<PageSearchContextValue | null>(null);

type PageSearchProviderProps = {
  children: ReactNode;
};

export function PageSearchProvider({ children }: PageSearchProviderProps) {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <PageSearchContext.Provider value={value}>{children}</PageSearchContext.Provider>;
}

export function usePageSearch(): PageSearchContextValue {
  const context = useContext(PageSearchContext);
  if (!context) {
    throw new Error('usePageSearch must be used within a PageSearchProvider.');
  }
  return context;
}
