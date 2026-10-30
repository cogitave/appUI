'use client';

import { useEffect, useEffectEvent, type RefObject } from 'react';

/** Keyboard dismissal and focus ownership for an inline responsive drawer. */
export function usePanelFocus(open: boolean, panel: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useEffectEvent(onClose);
  useEffect(() => {
    if (!open || !panel.current) return;
    const element = panel.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const controls = () => Array.from(element.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex]'))
      .filter(control => control.tabIndex >= 0 && !control.matches(':disabled') && !control.closest('[inert]') && control.getClientRects().length && getComputedStyle(control).visibility === 'visible');
    const frame = requestAnimationFrame(() => (controls()[0] ?? element).focus({ preventScroll: true }));
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (!element.contains(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
    document.addEventListener('keydown', keydown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', keydown);
      if (previous?.isConnected && !previous.closest('[inert]') && previous.getClientRects().length) previous.focus({ preventScroll: true });
    };
  }, [open, panel]);
}
