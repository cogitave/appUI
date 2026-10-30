'use client';

import { useLayoutEffect } from 'react';
import { isAccent } from '@/config/appearance';

export function AppearanceInitializer() {
  useLayoutEffect(() => {
    function applyStoredAppearance() {
      try {
        document.documentElement.classList.toggle('dark', localStorage.getItem('appui:theme') === 'dark');
        const accent = localStorage.getItem('appui:accent');
        if (isAccent(accent) && accent !== 'blue') document.documentElement.dataset.accent = accent;
        else delete document.documentElement.dataset.accent;
      } catch { /* Storage may be unavailable in private browsing. */ }
    }
    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === 'appui:theme' || event.key === 'appui:accent') applyStoredAppearance();
    }
    applyStoredAppearance();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return null;
}
