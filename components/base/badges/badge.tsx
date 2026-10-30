import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

export type BadgeColor = 'primary' | 'neutral' | 'new';
export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & { color?: BadgeColor; variant?: 'count' | 'label' | 'pill' | 'subtle' | 'index' };

export function Badge({ color = 'neutral', variant = 'count', className, ...props }: BadgeProps) {
  return <span data-color={color} data-variant={variant} className={cx('ui-badge', className)} {...props} />;
}
