import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';

export type SpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** Omit the label when a containing busy control already names the operation. */
export function Spinner({ size = 'md', label, className, style }: SpinnerProps) {
  return <span className={cx('ui-spinner', className)} data-size={size} role={label ? 'status' : undefined} aria-label={label} aria-hidden={!label || undefined} style={style}>
    <svg viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity=".18"/><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  </span>;
}
