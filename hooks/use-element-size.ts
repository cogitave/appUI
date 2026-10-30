'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/** Keep chart coordinates in CSS pixels so text and markers never stretch. */
export function useElementSize<T extends HTMLElement>(initialWidth: number, initialHeight: number) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    function update(width: number, height: number) {
      if (width <= 0 || height <= 0) return;
      setSize(current => current.width === width && current.height === height ? current : { width, height });
    }
    update(element.clientWidth, element.clientHeight);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width, entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
