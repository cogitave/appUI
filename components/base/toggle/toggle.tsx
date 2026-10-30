'use client';

import { createContext, useContext, type ReactNode, type Ref } from 'react';
import { ToggleButton, ToggleButtonGroup, type ToggleButtonProps, type ToggleButtonGroupProps } from 'react-aria-components';
import { cx } from '@/utils/cx';

export type ToggleVariant = 'soft' | 'outline' | 'plain';
export type ToggleSize = 'small' | 'medium' | 'large';
type ToggleAppearance = { variant?: ToggleVariant; size?: ToggleSize };
const ToggleAppearanceContext = createContext<ToggleAppearance>({});

export type ToggleProps = Omit<ToggleButtonProps, 'children' | 'className'> & ToggleAppearance & {
  children: ReactNode;
  iconOnly?: boolean;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
};

/** A pressed action. Supply an accessible name for icon-only controls. */
export function Toggle({ children, variant, size, iconOnly = false, className, ...props }: ToggleProps) {
  const group = useContext(ToggleAppearanceContext);
  return <ToggleButton {...props} className={cx('ui-toggle', className)} data-variant={variant ?? group.variant ?? 'soft'} data-size={size ?? group.size ?? 'medium'} data-icon-only={iconOnly || undefined}>{children}</ToggleButton>;
}

export type ToggleGroupProps = Omit<ToggleButtonGroupProps, 'children' | 'className'> & ToggleAppearance & {
  children: ReactNode;
  layout?: 'separated' | 'joined';
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

/** React Aria owns selection and roving focus, including logical RTL navigation. */
export function ToggleGroup({ children, variant = 'soft', size = 'medium', layout = 'separated', className, ...props }: ToggleGroupProps) {
  return <ToggleAppearanceContext value={{variant, size}}><ToggleButtonGroup {...props} data-layout={layout} className={cx('ui-toggle-group', className)}>{children}</ToggleButtonGroup></ToggleAppearanceContext>;
}
