'use client';

import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';

export type ThemeChangeEvent = Pick<MouseEvent<HTMLElement>, 'clientX' | 'clientY' | 'currentTarget'>;
let transitioning = false;

/** Reveal the new appearance from the pointer, or the control center for keyboards. */
export async function transitionTheme(update: () => void, event?: ThemeChangeEvent) {
  if (transitioning) return;
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }

  const bounds = event?.currentTarget.getBoundingClientRect();
  const pointer = event && (event.clientX !== 0 || event.clientY !== 0);
  const x = Math.max(0, Math.min(window.innerWidth, pointer ? event.clientX : bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2));
  const y = Math.max(0, Math.min(window.innerHeight, pointer ? event.clientY : bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2));
  const diameter = 2.5 * Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const root = document.documentElement;
  const mask = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="50" cy="50" r="42" fill="white" filter="url(#soft)"/></svg>';
  const properties = {
    '--theme-reveal-x': `${x}px`,
    '--theme-reveal-y': `${y}px`,
    '--theme-reveal-left': `${x - diameter / 2}px`,
    '--theme-reveal-top': `${y - diameter / 2}px`,
    '--theme-reveal-size': `${diameter}px`,
    '--theme-reveal-mask': `url("data:image/svg+xml,${encodeURIComponent(mask)}")`,
  };
  transitioning = true;
  Object.entries(properties).forEach(([key, value]) => root.style.setProperty(key, value));
  root.classList.add('ui-theme-transitioning');
  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    flushSync(update);
  };
  try {
    const transition = document.startViewTransition(commit);
    await transition.ready;
    await transition.finished;
  } catch {
    // A hidden tab or interrupted snapshot still needs the requested appearance.
    commit();
  } finally {
    root.classList.remove('ui-theme-transitioning');
    Object.keys(properties).forEach(key => root.style.removeProperty(key));
    transitioning = false;
  }
}
