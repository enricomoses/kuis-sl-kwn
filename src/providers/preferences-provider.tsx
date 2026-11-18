'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { createPreferencesStore } from '@/stores/preferences.store';
import type {
  PreferencesState,
  PreferencesStore,
} from '@/stores/preferences.store';

interface PreferencesContextValue {
  store: PreferencesStore;
  hydrated: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [store] = useState(createPreferencesStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve(store.persist.rehydrate())
      .then(() => {
        if (mounted) setHydrated(true);
      })
      .catch(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, [store]);

  return (
    <PreferencesContext.Provider value={{ store, hydrated }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences<T>(selector: (state: PreferencesState) => T): T {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider.');
  }
  return useStore(context.store, selector);
}

export function usePreferencesHydrated(): boolean {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      'usePreferencesHydrated must be used within PreferencesProvider.',
    );
  }
  return context.hydrated;
}
