import { createContext, useContext, useMemo, type ReactNode } from 'react';

type NavigationContextValue = {
  activeId: string;
  navigate: (id: string) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

type NavigationProviderProps = {
  activeId: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
};

export function NavigationProvider({ activeId, onNavigate, children }: NavigationProviderProps) {
  const value = useMemo(() => ({ activeId, navigate: onNavigate }), [activeId, onNavigate]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider.');
  }
  return context;
}
