'use client';

import type { ReactNode } from 'react';
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type SwitchProps = AriaSwitchProps & { children?: ReactNode; size?: 'sm' | 'md' | 'lg'; shape?: 'pill' | 'rectangle'; className?: string };
export function Switch({ children, size = 'md', shape = 'pill', className, ...props }: SwitchProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaSwitch {...props} isDisabled={isDisabled} data-size={size} data-shape={shape} className={cx('ui-switch', className)}><span className="ui-switch__track" aria-hidden="true"><span className="ui-switch__thumb" /></span>{children && <span className="ui-switch__label">{children}</span>}</AriaSwitch>;
}
