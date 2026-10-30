'use client';

import { createContext, useContext } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type ButtonGroupSize = 'medium' | 'small';

const SizeContext = createContext<ButtonGroupSize>('medium');

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  size?: ButtonGroupSize;
  children: ReactNode;
};

export function ButtonGroup({ size = 'medium', children, className, ...props }: ButtonGroupProps) {
  return <SizeContext.Provider value={size}><div role="group" data-size={size} className={cx('ui-button-group', className)} {...props}>{children}</div></SizeContext.Provider>;
}

type ItemContent =
  | { iconOnly: true; 'aria-label': string; leadingIcon: IconComponent; children?: never }
  | { iconOnly?: false; children: ReactNode; leadingIcon?: IconComponent };

export type ButtonGroupItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & ItemContent & {
  size?: ButtonGroupSize;
  selected?: boolean;
  trailingIcon?: IconComponent;
};

export function ButtonGroupItem({ size: sizeProp, selected = false, iconOnly = false, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, children, className, type = 'button', ...props }: ButtonGroupItemProps) {
  const inheritedSize = useContext(SizeContext);
  const size = sizeProp ?? inheritedSize;
  return <button type={type} aria-pressed={selected} data-size={size} data-selected={selected || undefined} data-icon-only={iconOnly || undefined} className={cx('ui-button-group__item', className)} {...props}>
    {LeadingIcon && <LeadingIcon className="ui-button-group__icon" aria-hidden />}
    {!iconOnly && children}
    {!iconOnly && TrailingIcon && <TrailingIcon className="ui-button-group__icon" aria-hidden />}
  </button>;
}
