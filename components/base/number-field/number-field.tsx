'use client';

import { NumberField as AriaNumberField, Group, Input, Label, Button, type NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components';
import { RiAddLine, RiSubtractLine } from '@remixicon/react';
import { cx } from '@/utils/cx';
import { FieldFeedback } from '@/components/base/input/field-feedback';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type NumberFieldProps = Omit<AriaNumberFieldProps, 'children' | 'className'> & {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  size?: 'medium' | 'small';
  stepper?: 'split' | 'end' | 'none';
  className?: string;
};

export function NumberField({ label, hideLabel = false, hint, error, isInvalid, size = 'medium', stepper = 'split', className, ...props }: NumberFieldProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaNumberField {...props} isDisabled={isDisabled} isInvalid={error ? true : isInvalid} className={cx('ui-number-field', className)} data-size={size} data-stepper={stepper}>
    <Label className={cx('ui-input-field__label', hideLabel && 'sr-only')}>{label}{props.isRequired && <span aria-hidden>*</span>}</Label>
    <Group className="ui-number-field__control">
      {stepper !== 'none' && stepper === 'split' && <Button slot="decrement" className="ui-number-field__step"><RiSubtractLine size={16} aria-hidden/></Button>}
      <Input className="ui-number-field__input"/>
      {stepper === 'end' && <Button slot="decrement" className="ui-number-field__step"><RiSubtractLine size={16} aria-hidden/></Button>}
      {stepper !== 'none' && <Button slot="increment" className="ui-number-field__step"><RiAddLine size={16} aria-hidden/></Button>}
    </Group>
    <FieldFeedback hint={hint} error={error}/>
  </AriaNumberField>;
}
