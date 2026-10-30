import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

export type StatusDotColor = 'green' | 'yellow' | 'indigo';
export type StatusDotProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  color?: StatusDotColor;
  label?: string;
};

export function StatusDot({ color = 'green', label, className, ...props }: StatusDotProps) {
  return <span data-color={color} className={cx('ui-status-dot', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} {...props}><span /></span>;
}
