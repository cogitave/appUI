'use client';

import { ProgressBar, Label, type ProgressBarProps } from 'react-aria-components';
import { cx } from '@/utils/cx';

export type ProgressProps = Omit<ProgressBarProps, 'children' | 'className'> & {
  label: string;
  hideLabel?: boolean;
  showValue?: boolean;
  variant?: 'bar' | 'ring';
  size?: 'small' | 'medium' | 'large';
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
};

export function Progress({ label, hideLabel = false, showValue = true, variant = 'bar', size = 'medium', tone = 'accent', className, value, minValue = 0, maxValue = 100, isIndeterminate = false, ...props }: ProgressProps) {
  const minimum = Number.isFinite(minValue) ? minValue : 0;
  const maximum = Number.isFinite(maxValue) && maxValue > minimum ? maxValue : minimum + 100;
  const indefinite = isIndeterminate || value == null || !Number.isFinite(value);
  const boundedValue = indefinite ? undefined : Math.max(minimum, Math.min(maximum, value!));
  return <ProgressBar {...props} value={boundedValue} minValue={minimum} maxValue={maximum} isIndeterminate={indefinite} className={cx('ui-progress', className)} data-variant={variant} data-size={size} data-tone={tone}>
    {({ percentage, valueText }) => <>
      <div className="ui-progress__heading"><Label className={cx('ui-progress__label', hideLabel && 'sr-only')}>{label}</Label>{showValue && variant === 'bar' && !indefinite && <span className="ui-progress__value" aria-hidden>{valueText}</span>}</div>
      {variant === 'ring' ? <div className="ui-progress__ring" data-indeterminate={indefinite || undefined}>
        <svg viewBox="0 0 48 48" aria-hidden><circle cx="24" cy="24" r="20" className="ui-progress__track-circle"/><circle cx="24" cy="24" r="20" className="ui-progress__fill-circle" pathLength="100" strokeDasharray={indefinite ? '24 76' : '100'} strokeDashoffset={indefinite ? 0 : 100 - (percentage ?? 0)}/></svg>
        {showValue && !indefinite && <span aria-hidden>{valueText}</span>}
      </div> : <div className="ui-progress__track" data-indeterminate={indefinite || undefined}><span className="ui-progress__fill" style={{ width: indefinite ? '36%' : `${percentage ?? 0}%` }}/></div>}
    </>}
  </ProgressBar>;
}
