import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

export type ChipVariant = 'bold' | 'subtle' | 'caption' | 'outline';
export type ChipColor = 'lime' | 'rose' | 'yellow' | 'cyan' | 'blue' | 'purple' | 'neutral' | 'gray' | 'soft' | 'primary';

export type ChipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  variant?: ChipVariant;
  color?: ChipColor;
};

export function Chip({ variant = 'bold', color = 'neutral', className, ...props }: ChipProps) {
  return <span data-variant={variant} data-color={color} className={cx('ui-chip', className)} {...props} />;
}
