'use client';

import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string) {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', notify);
    return () => media.removeEventListener('change', notify);
  }, [query]);
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

// Keep these in sync with the navigation and inspector media queries in template CSS.
export const TEMPLATE_NAV_QUERY = '(max-width: 1023px)';
export const TEMPLATE_PANEL_QUERY = '(max-width: 1279px)';
