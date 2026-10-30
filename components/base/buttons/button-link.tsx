import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { buttonClassNames, buttonIconClassNames, type ButtonSize, type ButtonVariant } from './button';

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  as?: ElementType;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
};

/** Anchor semantics and the same presentation as Button. Router adapters are optional. */
export function ButtonLink({ as: Component = 'a', children, variant = 'secondary', size = 'medium', leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, className, ...props }: ButtonLinkProps) {
  return <Component {...props} className={buttonClassNames(size, false, className)} data-variant={variant} data-size={size}>
    {LeadingIcon && <LeadingIcon className={buttonIconClassNames[size]} aria-hidden />}
    <span className="ui-button__label">{children}</span>
    {TrailingIcon && <TrailingIcon className={buttonIconClassNames[size]} aria-hidden />}
  </Component>;
}
