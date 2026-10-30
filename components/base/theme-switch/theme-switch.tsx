'use client';

import { RiMoonLine, RiSunLine } from '@remixicon/react';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeSwitch({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useAppearance();
  return <div className={`ui-theme-switch ${className}`} role="group" aria-label="Appearance">
    <button type="button" aria-label="Light appearance" aria-pressed={theme === 'light'} onClick={event => setTheme('light', event)}><RiSunLine size={17}/></button>
    <button type="button" aria-label="Dark appearance" aria-pressed={theme === 'dark'} onClick={event => setTheme('dark', event)}><RiMoonLine size={17}/></button>
  </div>;
}
