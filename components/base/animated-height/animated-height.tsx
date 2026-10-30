'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { cx } from '@/utils/cx';

const layoutProperties = new Set([
  'height', 'block-size', 'min-height', 'max-height', 'min-block-size', 'max-block-size',
  'width', 'inline-size', 'min-width', 'max-width', 'min-inline-size', 'max-inline-size',
  'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'padding-block-start', 'padding-block-end',
  'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'margin-block-start', 'margin-block-end',
  'border-top-width', 'border-bottom-width', 'gap', 'row-gap', 'column-gap', 'grid-template-rows', 'grid-template-columns', 'flex-basis', 'font-size', 'line-height', 'letter-spacing',
]);

/** Animate real layout height so adjacent content follows without being scaled. */
export function AnimatedHeight({ children, className }: { children: ReactNode; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    // Start at the natural size, including when server-rendered content is nonempty.
    frame.style.transition = 'none';
    frame.style.height = `${content.offsetHeight}px`;
    void frame.offsetHeight;
    frame.style.removeProperty('transition');
    let alive = true;
    const observed = new WeakSet<Animation>();
    const affectsLayout = (animation: Animation) => {
      if (animation.playState !== 'running') return false;
      if ('transitionProperty' in animation) return layoutProperties.has(String(animation.transitionProperty));
      return animation.effect instanceof KeyframeEffect && animation.effect.getKeyframes().some(frame =>
        Object.keys(frame).some(property => layoutProperties.has(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)))
      );
    };
    const nestedLayoutIsMoving = () => content.getAnimations({subtree: true}).some(affectsLayout);
    const restore = () => { if (alive && !nestedLayoutIsMoving()) frame.style.removeProperty('transition'); };
    const observeMotion = () => {
      const moving = content.getAnimations({subtree: true}).filter(affectsLayout);
      for (const animation of moving) if (!observed.has(animation)) {
        observed.add(animation);
        animation.finished.then(restore, restore);
      }
      return moving.length > 0;
    };
    const restoreTransition = (event: TransitionEvent) => {
      if (layoutProperties.has(event.propertyName)) restore();
    };
    content.addEventListener('transitionend', restoreTransition);
    content.addEventListener('transitioncancel', restoreTransition);
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize ?? content.offsetHeight;
      // A child can already be animating its real height. Follow that geometry
      // directly, so nested frames do not each add another full transition.
      const following = observeMotion();
      if (following) frame.style.transition = 'none';
      else frame.style.removeProperty('transition');
      frame.style.height = `${height}px`;
    });
    // Helper text and disclosure spacing can change without changing the
    // content box. Observe the same border box that supplies the target height.
    observer.observe(content, { box: 'border-box' });
    return () => {
      alive = false;
      observer.disconnect();
      content.removeEventListener('transitionend', restoreTransition);
      content.removeEventListener('transitioncancel', restoreTransition);
    };
  }, []);
  return <div ref={frameRef} className={cx('ui-animated-height', className)}><div ref={contentRef} className="ui-animated-height__content">{children}</div></div>;
}
