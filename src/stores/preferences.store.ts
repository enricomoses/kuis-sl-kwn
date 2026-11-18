import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { PREFERENCES_STORAGE_KEY } from '@/constants/game.constant';
import { preferencesSchema } from '@/validations/preferences.schema';

export interface PreferencesState {
  lastPlayerName: string | null;
  hideLiveScores: boolean;
  setLastPlayerName: (name: string | null) => void;
  setHideLiveScores: (hide: boolean) => void;
  toggleHideLiveScores: () => void;
}

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;

export function createPreferencesStore() {
  return createStore<PreferencesState>()(
    persist(
      (set) => ({
        lastPlayerName: null,
        hideLiveScores: false,
        setLastPlayerName: (lastPlayerName) => set({ lastPlayerName }),
        setHideLiveScores: (hideLiveScores) => set({ hideLiveScores }),
        toggleHideLiveScores: () =>
          set((state) => ({ hideLiveScores: !state.hideLiveScores })),
      }),
      {
        name: PREFERENCES_STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => ({
          getItem: (name) => {
            if (typeof window === 'undefined') return null;
            return window.localStorage.getItem(name);
          },
          setItem: (name, value) => {
            if (typeof window === 'undefined') return;
            window.localStorage.setItem(name, value);
          },
          removeItem: (name) => {
            if (typeof window === 'undefined') return;
            window.localStorage.removeItem(name);
          },
        })),
        skipHydration: true,
        partialize: (state) => ({
          lastPlayerName: state.lastPlayerName,
          hideLiveScores: state.hideLiveScores,
        }),
        merge: (stored, current) => {
          const parsed = preferencesSchema.safeParse(stored);
          if (!parsed.success) {
            return {
              ...current,
              lastPlayerName: null,
              hideLiveScores: false,
            };
          }
          return {
            ...current,
            lastPlayerName: parsed.data.lastPlayerName,
            hideLiveScores: parsed.data.hideLiveScores,
          };
        },
      },
    ),
  );
}
