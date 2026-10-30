'use client';

import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';
import { Spinner } from '@/components/base/spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'outline' | 'solid' | 'quiet';
export type ButtonSize = 'medium' | 'small' | 'xs';

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
type ContentProps =
  | { iconOnly: true; 'aria-label': string; leadingIcon: IconComponent; children?: never }
  | { iconOnly?: false; children: ReactNode; leadingIcon?: IconComponent };

export type ButtonProps = NativeButtonProps & ContentProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  trailingIcon?: IconComponent;
  isLoading?: boolean;
  loadingLabel?: string;
  ref?: Ref<HTMLButtonElement>;
};

const base = 'ui-button inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none outline-none';
const sizes: Record<ButtonSize, string> = {
  medium: 'h-9 rounded-[10px] px-2 gap-0.5',
  small: 'h-8 rounded-lg px-2 gap-0.5',
  xs: 'h-6 rounded-[5px] px-2 gap-0.5',
};
export const buttonIconClassNames: Record<ButtonSize, string> = { medium: 'size-5', small: 'size-[18px]', xs: 'size-3.5' };
export function buttonClassNames(size: ButtonSize, iconOnly = false, className?: string) {
  return cx(base, sizes[size], iconOnly && 'ui-button--icon-only !p-0', className);
}

export function Button({
  variant = 'primary',
  size = 'medium',
  iconOnly = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  children,
  className,
  type = 'button',
  isLoading = false,
  loadingLabel,
  disabled,
  onClick,
  onKeyDown,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={isLoading && type === 'submit' ? 'button' : type}
      disabled={disabled}
      aria-disabled={isLoading || props['aria-disabled'] || undefined}
      aria-busy={isLoading || undefined}
      aria-description={isLoading && loadingLabel ? loadingLabel : props['aria-description']}
      data-variant={variant}
      data-size={size}
      data-icon-only={iconOnly || undefined}
      data-loading={isLoading || undefined}
      data-loading-label={loadingLabel !== undefined || undefined}
      className={buttonClassNames(size, iconOnly, className)}
      onClick={event => { if (isLoading || props['aria-disabled'] === true || props['aria-disabled'] === 'true') { event.preventDefault(); event.stopPropagation(); return; } onClick?.(event); }}
      onKeyDown={event => { if (isLoading && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.stopPropagation(); return; } onKeyDown?.(event); }}
    >
      {LeadingIcon && <span className="ui-button__leading-slot" aria-hidden><LeadingIcon className={cx(buttonIconClassNames[size], 'ui-button__leading-icon')}/></span>}
      {!iconOnly && <span className="ui-button__label">{children}</span>}
      {!iconOnly && TrailingIcon && <TrailingIcon className={buttonIconClassNames[size]} aria-hidden />}
      <Spinner className="ui-button__busy-spinner" size={size === 'xs' ? 'xs' : size === 'small' ? 'sm' : 'md'}/>
    </button>
  );
}
