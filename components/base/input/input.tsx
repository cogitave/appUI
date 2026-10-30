'use client';

import type { AriaAttributes, ReactNode, Ref } from 'react';
import { TextField, Label, Input as AriaInput, type TextFieldProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { FieldFeedback } from '@/components/base/input/field-feedback';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type InputProps = Omit<TextFieldProps, 'children' | 'className'> & {
  'aria-busy'?: AriaAttributes['aria-busy'];
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  trailingAction?: ReactNode;
  leadingAction?: ReactNode;
  blockStart?: ReactNode;
  blockEnd?: ReactNode;
  className?: string;
  hideLabel?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  variant?: 'default' | 'plain' | 'soft';
  size?: 'small' | 'medium' | 'large';
  maxLength?: number;
};

export function Input({ label, placeholder, hint, error, leading, trailing, trailingAction, leadingAction, blockStart, blockEnd, className, isInvalid, hideLabel = false, inputRef, variant = 'default', size = 'medium', maxLength, ...props }: InputProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  const stacked = blockStart !== undefined || blockEnd !== undefined;
  const control = <>{leadingAction && <span className="ui-input-field__action">{leadingAction}</span>}{leading && <span className="ui-input-field__adornment" aria-hidden="true">{leading}</span>}<AriaInput ref={inputRef} maxLength={maxLength} aria-busy={props['aria-busy']} className="ui-input-field__input" placeholder={placeholder} />{trailing && <span className="ui-input-field__adornment" aria-hidden="true">{trailing}</span>}{trailingAction && <span className="ui-input-field__action">{trailingAction}</span>}</>;
  return <TextField {...props} isDisabled={isDisabled} data-variant={variant} data-size={size} isInvalid={error ? true : isInvalid} className={cx('ui-input-field', className)}>
    <Label className={cx('ui-input-field__label', hideLabel && 'sr-only')}>{label}{props.isRequired && <span aria-hidden="true">*</span>}</Label>
    <div className={cx('ui-input-field__control', stacked && 'ui-input-field__control--stacked')}>{blockStart !== undefined && <div className="ui-input-group__block" data-align="start">{blockStart}</div>}{stacked ? <div className="ui-input-field__row">{control}</div> : control}{blockEnd !== undefined && <div className="ui-input-group__block" data-align="end">{blockEnd}</div>}</div>
    <FieldFeedback hint={hint} error={error}/>
  </TextField>;
}
