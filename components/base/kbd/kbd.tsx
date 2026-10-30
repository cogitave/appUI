import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

export type KbdProps = HTMLAttributes<HTMLElement> & {
  variant?: 'soft' | 'outline';
  size?: 'small' | 'medium';
};

export function Kbd({ className, variant = 'soft', size = 'small', ...props }: KbdProps) {
  return <kbd className={cx('ui-kbd', className)} data-variant={variant} data-size={size} {...props} />;
}

/** Supply an aria-label when the visible keys use platform-specific symbols. */
export function KbdGroup({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cx('ui-kbd-group', className)} {...props}/>;
}
