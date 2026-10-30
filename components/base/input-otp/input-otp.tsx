'use client';

import { useState } from 'react';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type InputOTPProps = {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  'aria-label'?: string;
  className?: string;
};

export function InputOTP({ length = 6, value, defaultValue = '', onChange, onComplete, isDisabled: disabled = false, isInvalid = false, 'aria-label': ariaLabel = 'Verification code', className }: InputOTPProps) {
  const isDisabled = useFieldDisabled(disabled);
  const [internal, setInternal] = useState(defaultValue.replace(/\D/g, '').slice(0, length));
  const current = value === undefined ? internal : value.replace(/\D/g, '').slice(0, length);
  function update(next: string) {
    const cleaned = next.replace(/\D/g, '').slice(0, length);
    if (value === undefined) setInternal(cleaned);
    onChange?.(cleaned);
    if (cleaned.length === length && current !== cleaned) onComplete?.(cleaned);
  }
  return <div className={cx('ui-otp', className)} data-disabled={isDisabled || undefined} data-invalid={isInvalid || undefined}>
    <input type="text" className="ui-otp__input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={length} value={current} disabled={isDisabled} aria-label={ariaLabel} aria-invalid={isInvalid || undefined} onChange={event => update(event.target.value)} />
    {Array.from({ length }, (_, index) => <span key={index} className="ui-otp__slot" data-active={index === current.length && current.length < length || undefined} aria-hidden="true">{current[index] || ''}</span>)}
  </div>;
}
