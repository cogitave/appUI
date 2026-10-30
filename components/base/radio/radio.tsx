'use client';

import type { ReactNode } from 'react';
import { RadioGroup as AriaRadioGroup, Radio as AriaRadio, type RadioGroupProps as AriaRadioGroupProps, type RadioProps as AriaRadioProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type RadioGroupProps = AriaRadioGroupProps & { children: ReactNode; className?: string };
export function RadioGroup({ children, className, ...props }: RadioGroupProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaRadioGroup {...props} isDisabled={isDisabled} className={cx('ui-radio-group', className)}>{children}</AriaRadioGroup>;
}

export type RadioProps = AriaRadioProps & { children: ReactNode; size?: 'md' | 'sm'; className?: string };
export function Radio({ children, size = 'md', className, ...props }: RadioProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaRadio {...props} isDisabled={isDisabled} className={cx('ui-radio', className)} data-size={size}><span className="ui-radio__control" aria-hidden="true" /><span>{children}</span></AriaRadio>;
}
