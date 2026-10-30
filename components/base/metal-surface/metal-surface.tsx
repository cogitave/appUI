import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/utils/cx';

/** A shared CSS/SVG metallic treatment. Decorative motion respects reduced motion. */
export function MetalSurface({ children, size = 56, className }: { children: ReactNode; size?: number; className?: string }) {
  return <span className={cx('ui-metal-surface', className)} style={{'--metal-size':`${size}px`} as CSSProperties} aria-hidden><span className="ui-metal-surface__sweep"/><span className="ui-metal-surface__content">{children}</span></span>;
}
