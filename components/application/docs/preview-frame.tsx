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

/** Animate the real frame height so following sections move with its border. */
export function PreviewFrame({ mode, children, surface = 'default' }: { mode: 'preview' | 'code'; children: ReactNode; surface?: 'default' | 'muted' }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    let alive = true;
    const observed = new WeakSet<Animation>();
    const activeLayoutAnimations = () => content.getAnimations({subtree:true}).filter(animation => {
      if (animation.playState !== 'running') return false;
      if ('transitionProperty' in animation) return layoutProperties.has(String(animation.transitionProperty));
      return animation.effect instanceof KeyframeEffect && animation.effect.getKeyframes().some(keyframe =>
        Object.keys(keyframe).some(property => layoutProperties.has(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)))
      );
    });

    function measure() {
      if (!alive) return;
      const moving = activeLayoutAnimations();
      if (moving.length) frame!.dataset.contentResizing = '';
      else delete frame!.dataset.contentResizing;
      for (const animation of moving) if (!observed.has(animation)) {
        observed.add(animation);
        animation.finished.then(measure, measure);
      }
      const style = getComputedStyle(frame!);
      const inset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      // Measure natural layout, independent of descendants' slide/scale animations.
      const nextHeight = Math.max(content!.offsetHeight + inset, parseFloat(style.minHeight) || 0);
      // ResizeObserver runs before paint. Write the measured height directly
      // so a reduced-motion disclosure cannot paint inside the old frame.
      frame!.style.height = `${nextHeight}px`;
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content, {box:'border-box'});
    // Follow child layout motion directly, including Web Animations, and
    // restore this frame's own transition when the child finishes or reverses.
    return () => {
      alive = false;
      observer.disconnect();
      delete frame.dataset.contentResizing;
    };
  }, [mode]);

  return <div ref={frameRef} id="example-panel" role="tabpanel" aria-labelledby={`${mode}-tab`} tabIndex={0} data-surface={surface} className={cx('docs-preview', mode === 'code' && 'is-code')}>
    <div ref={contentRef} className="docs-preview__content">{children}</div>
  </div>;
}
