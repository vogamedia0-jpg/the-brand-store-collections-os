import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Admin colour-scheme controller.
 *
 * The public catalogue is always the light editorial presentation; this provider
 * is mounted around the admin routes only and toggles the `dark` class on the
 * document root, which every admin surface reads through the shared tokens.
 */

export type ThemeChoice = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'the-brand-store:admin-theme';

type ThemeContextValue = {
  choice: ThemeChoice;
  resolved: Resolved;
  setChoice: (choice: ThemeChoice) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const systemTheme = (): Resolved =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const readStoredChoice = (): ThemeChoice => {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
};

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => readStoredChoice());
  const [system, setSystem] = useState<Resolved>(() => systemTheme());

  const resolved: Resolved = choice === 'system' ? system : choice;

  // Follow the OS while the preference is "system".
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = () => setSystem(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Apply before paint so the admin never flashes the wrong scheme.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.dataset.adminTheme = resolved;
    root.style.colorScheme = resolved;
    return () => {
      root.classList.remove('dark');
      root.style.colorScheme = '';
    };
  }, [resolved]);

  const setChoice = useCallback((next: ThemeChoice) => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 260);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* preference simply is not persisted when storage is unavailable */
    }
    setChoiceState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      choice,
      resolved,
      setChoice,
      toggle: () => setChoice(resolved === 'dark' ? 'light' : 'dark'),
    }),
    [choice, resolved, setChoice],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAdminTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAdminTheme must be used inside AdminThemeProvider');
  return context;
}
