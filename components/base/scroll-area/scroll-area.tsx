'use client';

import { useCallback, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type Ref, type RefObject } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { IconButton } from '@/components/base/buttons/icon-button';
import { cx } from '@/utils/cx';

export type ScrollAreaViewportProps = { ref: Ref<HTMLDivElement>; className: string; children: ReactNode };
export type ScrollAreaProps = {
  children?: ReactNode;
  label: string;
  className?: string;
  viewportClassName?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Let a collection own the scroll viewport, keeping its keyboard scrolling native. */
  renderViewport?: (props: ScrollAreaViewportProps) => ReactElement;
  /** Keep a pointer action in a searchable input without stealing its focus. */
  preservePointerFocus?: boolean;
  /** Restore a virtual collection's input when a focused edge disappears. */
  focusRef?: RefObject<HTMLElement | null>;
  /** Keep arrow controls outside the item viewport in constrained collections. */
  indicatorPlacement?: 'overlay' | 'gutter';
};

/** Keep native scrolling, with directional controls only when content overflows. */
export function ScrollArea({ children, label, className, viewportClassName, renderViewport, orientation = 'vertical', preservePointerFocus = false, focusRef, indicatorPlacement='overlay' }: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const [mountedViewport, setMountedViewport] = useState<HTMLDivElement | null>(null);
  const setViewport = useCallback((element: HTMLDivElement | null) => {
    viewport.current = element;
    setMountedViewport(element);
  }, []);
  const [edges, setEdges] = useState({ up: false, down: false, left: false, right: false });
  const measuredEdges = useRef(edges);
  useLayoutEffect(() => {
    const el = mountedViewport;
    if (!el) return;
    function measure() {
      if (!el) return;
      const up = orientation !== 'horizontal' && el.scrollTop > 1, down = orientation !== 'horizontal' && el.scrollHeight - el.clientHeight - el.scrollTop > 1;
      const rtl = getComputedStyle(el).direction === 'rtl', maximum = el.scrollWidth - el.clientWidth;
      const left = orientation !== 'vertical' && (rtl ? maximum + el.scrollLeft : el.scrollLeft) > 1;
      const right = orientation !== 'vertical' && (rtl ? -el.scrollLeft : maximum - el.scrollLeft) > 1;
      const next = { up, down, left, right };
      const focusedEdge = document.activeElement?.closest('.ui-scroll-area__edge');
      const direction = focusedEdge?.getAttribute('data-direction') as keyof typeof next | undefined;
      if (focusedEdge && el.parentElement?.contains(focusedEdge) && direction && !next[direction]) (focusRef?.current ?? el).focus({ preventScroll: true });
      if (Object.keys(next).some(key => measuredEdges.current[key as keyof typeof next] !== next[key as keyof typeof next])) {
        measuredEdges.current = next;
        setEdges(measuredEdges.current);
      }
    }
    const observer = new ResizeObserver(measure);
    const observed = new Set<Element>();
    function observeContent() {
      if (!el) return;
      // A collection may not allow a wrapper between itself and its sections.
      // Observe those sections directly so filtering and density changes are measured.
      const next = new Set<Element>([el, ...el.children]);
      for (const child of observed) if (!next.has(child)) { observer.unobserve(child); observed.delete(child); }
      for (const child of next) if (!observed.has(child)) { observer.observe(child); observed.add(child); }
      measure();
    }
    const mutations = new MutationObserver(observeContent);
    mutations.observe(el, { childList: true, subtree: true });
    observeContent();
    el.addEventListener('scroll', measure, { passive: true });
    return () => { observer.disconnect(); mutations.disconnect(); el.removeEventListener('scroll', measure); };
  }, [focusRef, mountedViewport, orientation]);
  function scroll(direction: number, horizontal = false) {
    const el = viewport.current;
    if (!el) return;
    el.scrollBy({ [horizontal ? 'left' : 'top']: direction * Math.max(80, (horizontal ? el.clientWidth : el.clientHeight) * .7), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <div className={cx('ui-scroll-area', className)} data-orientation={orientation} data-indicator-placement={indicatorPlacement} data-overflow-y={edges.up || edges.down || undefined}>
    {renderViewport ? renderViewport({ ref: setViewport, className: cx('ui-scroll-area__viewport', viewportClassName), children }) : <div ref={setViewport} className={cx('ui-scroll-area__viewport', viewportClassName)} role="region" aria-label={label} tabIndex={0}><div ref={content} className="ui-scroll-area__content">{children}</div></div>}
    <div className="ui-scroll-area__edge" data-direction="up" data-visible={edges.up || undefined} aria-hidden={!edges.up}><IconButton icon={RiArrowUpSLine} variant="ghost" size="xs" preventFocusOnPress={preservePointerFocus} aria-label={`Scroll ${label.toLowerCase()} up`} disabled={!edges.up} tabIndex={edges.up ? 0 : -1} onClick={() => scroll(-1)}/></div>
    <div className="ui-scroll-area__edge" data-direction="down" data-visible={edges.down || undefined} aria-hidden={!edges.down}><IconButton icon={RiArrowDownSLine} variant="ghost" size="xs" preventFocusOnPress={preservePointerFocus} aria-label={`Scroll ${label.toLowerCase()} down`} disabled={!edges.down} tabIndex={edges.down ? 0 : -1} onClick={() => scroll(1)}/></div>
    {orientation !== 'vertical' && <>
      <div className="ui-scroll-area__edge" data-direction="left" data-visible={edges.left || undefined} aria-hidden={!edges.left}><IconButton icon={RiArrowLeftSLine} variant="ghost" size="xs" preventFocusOnPress={preservePointerFocus} aria-label={`Scroll ${label.toLowerCase()} left`} disabled={!edges.left} tabIndex={edges.left ? 0 : -1} onClick={() => scroll(-1, true)}/></div>
      <div className="ui-scroll-area__edge" data-direction="right" data-visible={edges.right || undefined} aria-hidden={!edges.right}><IconButton icon={RiArrowRightSLine} variant="ghost" size="xs" preventFocusOnPress={preservePointerFocus} aria-label={`Scroll ${label.toLowerCase()} right`} disabled={!edges.right} tabIndex={edges.right ? 0 : -1} onClick={() => scroll(1, true)}/></div>
    </>}
  </div>;
}
