'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { TextField, Label, TextArea as AriaTextArea, type TextFieldProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { FieldFeedback } from '@/components/base/input/field-feedback';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type TextareaProps = Omit<TextFieldProps, 'children' | 'className'> & {
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
  className?: string;
  hideLabel?: boolean;
  variant?: 'default' | 'plain';
  blockStart?: ReactNode;
  blockEnd?: ReactNode;
};

export function Textarea({ label, placeholder, hint, error, rows = 4, maxLength, showCount = false, autoResize = false, className, isInvalid, value, defaultValue, onChange, hideLabel = false, variant = 'default', blockStart, blockEnd, ...props }: TextareaProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  const ref = useRef<HTMLTextAreaElement>(null);
  const [count, setCount] = useState(String(value ?? defaultValue ?? '').length);
  useLayoutEffect(() => {
    if (!autoResize || !ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [autoResize, value, count]);
  const stacked = blockStart !== undefined || blockEnd !== undefined;
  const control = <AriaTextArea ref={ref} className="ui-textarea-field__control" placeholder={placeholder} rows={rows} maxLength={maxLength} />;
  return <TextField {...props} isDisabled={isDisabled} data-variant={variant} value={value} defaultValue={defaultValue} onChange={next => { setCount(next.length); onChange?.(next); }} isInvalid={error ? true : isInvalid} className={cx('ui-textarea-field', className)}>
    <Label className={cx('ui-input-field__label', hideLabel && 'sr-only')}>{label}{props.isRequired && <span aria-hidden="true">*</span>}</Label>
    {stacked ? <div className="ui-textarea-field__surface">{blockStart !== undefined && <div className="ui-input-group__block" data-align="start">{blockStart}</div>}{control}{blockEnd !== undefined && <div className="ui-input-group__block" data-align="end">{blockEnd}</div>}</div> : control}
    {showCount ? <div className="ui-textarea-field__foot"><FieldFeedback hint={hint} error={error}/><output aria-label="Character count">{count}{maxLength !== undefined && ` / ${maxLength}`}</output></div> : <FieldFeedback hint={hint} error={error}/>}
  </TextField>;
}
