import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';

export type DividerVariant = 'single' | 'double' | 'fill';
export type DividerAlign = 'start' | 'center' | 'end';
export type DividerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  variant?: DividerVariant;
  align?: DividerAlign;
};

export function Divider({ children, variant = 'single', align = 'center', className, ...props }: DividerProps) {
  const hasContent = children !== undefined && children !== null && children !== false;
  return <div {...props} role={hasContent ? undefined : 'separator'} aria-orientation={hasContent ? undefined : 'horizontal'} data-variant={variant} data-align={align} data-content={hasContent || undefined} className={cx('ui-divider', className)}>{hasContent && <span className="ui-divider__content">{children}</span>}</div>;
}
