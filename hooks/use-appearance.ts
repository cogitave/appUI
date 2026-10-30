'use client';

import { useEffect, useState } from 'react';
import { transitionTheme, type ThemeChangeEvent } from '@/utils/theme-transition';
import { isAccent, type Accent } from '@/config/appearance';

export type Theme = 'light' | 'dark';
export type { Accent } from '@/config/appearance';

export function useAppearance() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [accent, setAccentState] = useState<Accent>('blue');

  useEffect(() => {
    function syncAppearance() {
      setThemeState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      const current = document.documentElement.dataset.accent;
      setAccentState(isAccent(current) ? current : 'blue');
    }
    syncAppearance();
    const observer = new MutationObserver(syncAppearance);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-accent'] });
    return () => observer.disconnect();
  }, []);

  function setTheme(next: Theme, event?: ThemeChangeEvent) {
    if (document.documentElement.classList.contains('dark') === (next === 'dark')) return;
    void transitionTheme(() => {
      document.documentElement.classList.toggle('dark', next === 'dark');
      try { window.localStorage.setItem('appui:theme', next); } catch { /* Appearance also works without storage. */ }
      setThemeState(next);
    }, event);
  }

  function setAccent(next: Accent) {
    if (next === 'blue') delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = next;
    try { window.localStorage.setItem('appui:accent', next); } catch { /* Appearance also works without storage. */ }
    setAccentState(next);
  }

  return { theme, accent, setTheme, setAccent };
}
