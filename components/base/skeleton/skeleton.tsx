import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/utils/cx';

export type SkeletonProps = {
  children?: ReactNode;
  isLoading?: boolean;
  shape?: 'line' | 'circle' | 'rectangle';
  animation?: 'shimmer' | 'pulse' | 'none';
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ children, isLoading = true, shape = 'line', animation = 'shimmer', width, height, className, style }: SkeletonProps) {
  const hasContent = children != null;
  if (!isLoading && !hasContent) return null;
  // Real content stays mounted and owns the layout throughout the crossfade.
  // Optional dimensions size the placeholder without narrowing its content.
  const dimensions = hasContent ? {
    '--skeleton-width': typeof width === 'number' ? `${width}px` : width,
    '--skeleton-height': typeof height === 'number' ? `${height}px` : height,
  } as CSSProperties : { width, height };
  return <div className={cx('ui-skeleton', className)} data-shape={shape} data-animation={animation} data-loading={isLoading} data-has-content={hasContent || undefined} aria-hidden={isLoading || undefined} style={{ ...dimensions, ...style }}>
    <div className="ui-skeleton__placeholder" aria-hidden />
    {hasContent && <div className="ui-skeleton__content" inert={isLoading}>{children}</div>}
  </div>;
}

export function SkeletonGroup({ children, isLoading = true, label = 'Loading content', className }: { children: ReactNode; isLoading?: boolean; label?: string; className?: string }) {
  return <div className={cx('ui-skeleton-group', className)} data-loading={isLoading} aria-busy={isLoading} aria-label={label} role="region">{children}<span role="status" className="sr-only">{isLoading ? label : 'Content loaded'}</span></div>;
}
