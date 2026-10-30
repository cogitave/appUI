import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';
import { RiArrowRightLine } from '@remixicon/react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  as?: ElementType;
  children: ReactNode;
  variant?: 'primary' | 'neutral' | 'subtle';
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent | false;
};

export function LinkButton({ as: Component = 'a', children, variant = 'primary', leadingIcon: LeadingIcon, trailingIcon: TrailingIcon = RiArrowRightLine, className, ...props }: LinkButtonProps) {
  return <Component {...props} className={cx('ui-link-button', className)} data-variant={variant}>{LeadingIcon && <LeadingIcon size={16} aria-hidden />}<span>{children}</span>{TrailingIcon && <TrailingIcon size={16} aria-hidden />}</Component>;
}
