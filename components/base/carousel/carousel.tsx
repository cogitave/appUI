'use client';

import { Children, cloneElement, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { IconButton } from '@/components/base/buttons/icon-button';
import { cx } from '@/utils/cx';

export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onScroll'> & {
  children: ReactNode;
  'aria-label': string;
  showArrows?: boolean;
  showDots?: boolean;
  align?: 'start' | 'center';
  gap?: number;
};

export type CarouselItemProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function CarouselItem({ children, className, ...props }: CarouselItemProps) {
  return <div role="group" aria-roledescription="slide" className={cx('ui-carousel__item w-full shrink-0', className)} {...props}>{children}</div>;
}

export function Carousel({ children, showArrows = true, showDots = true, align = 'start', gap = 16, className, ...props }: CarouselProps) {
  const slides = Children.toArray(children).filter(isValidElement);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(slides.length <= 1);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const start = track.scrollLeft <= 1;
    const end = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    setAtStart(start);
    setAtEnd(end);
    if (!items.length) return;
    if (start) return setActive(0);
    if (end) return setActive(items.length - 1);
    const viewportCenter = track.scrollLeft + track.clientWidth / 2;
    const nearest = items.reduce((best, item, index) => {
      const center = item.offsetLeft + item.clientWidth / 2;
      const bestItem = items[best];
      const bestCenter = bestItem.offsetLeft + bestItem.clientWidth / 2;
      return Math.abs(center - viewportCenter) < Math.abs(bestCenter - viewportCenter) ? index : best;
    }, 0);
    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    Array.from(track.children).forEach(item => observer.observe(item));
    track.addEventListener('scroll', measure, { passive: true });
    measure();
    return () => { observer.disconnect(); track.removeEventListener('scroll', measure); };
  }, [measure, slides.length]);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    const item = track?.children[Math.max(0, Math.min(index, slides.length - 1))] as HTMLElement | undefined;
    if (!track || !item) return;
    const centered = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
    const left = align === 'center' ? centered : item.offsetLeft;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function onTrackKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') { event.preventDefault(); scrollToIndex(active + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToIndex(active - 1); }
    if (event.key === 'Home') { event.preventDefault(); scrollToIndex(0); }
    if (event.key === 'End') { event.preventDefault(); scrollToIndex(slides.length - 1); }
  }

  return <div role="group" aria-roledescription="carousel" className={cx('ui-carousel', className)} {...props}>
    {showArrows && slides.length > 0 && <div className="ui-carousel__controls"><IconButton icon={RiArrowLeftSLine} size="small" aria-label="Previous slide" disabled={atStart} onClick={() => scrollToIndex(active - 1)} /><IconButton icon={RiArrowRightSLine} size="small" aria-label="Next slide" disabled={atEnd} onClick={() => scrollToIndex(active + 1)} /></div>}
    <div ref={trackRef} tabIndex={0} data-align={align} className="ui-carousel__track" style={{ gap }} onKeyDown={onTrackKeyDown}>
      {slides.map((child, index) => cloneElement(child as ReactElement<CarouselItemProps>, { 'aria-label': `${index + 1} of ${slides.length}` }))}
    </div>
    {showDots && slides.length > 1 && <div className="ui-carousel__dots">{slides.map((_, index) => <button key={index} type="button" className={cx('ui-carousel__dot', index === active && 'is-active')} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => scrollToIndex(index)} />)}</div>}
  </div>;
}
