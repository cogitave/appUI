'use client';

import { useId, useMemo } from 'react';
import { Label, Meter as AriaMeter, useLocale, type MeterProps as AriaMeterProps } from 'react-aria-components';
import { cx } from '@/utils/cx';

export type MeterSegment = { id: string; label: string; value: number; color?: string };
export type MeterProps = Omit<AriaMeterProps, 'children' | 'className'> & {
  label: string;
  hideLabel?: boolean;
  showValue?: boolean;
  size?: 'small' | 'medium' | 'large';
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** Quantities within the displayed amount; remaining usage keeps the base tone. */
  segments?: MeterSegment[];
  className?: string;
};

/** A bounded quantity, with optional parts that share the same value scale. */
export function Meter({ label, hideLabel = false, showValue = true, size = 'medium', tone = 'accent', segments, className, value = 0, minValue = 0, maxValue = 100, 'aria-describedby': describedBy, ...props }: MeterProps) {
  const detailsId = useId();
  const { locale } = useLocale();
  const partFormatter = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const minimum = Number.isFinite(minValue) ? minValue : 0;
  const maximum = Number.isFinite(maxValue) && maxValue > minimum ? maxValue : minimum + 1;
  const current = Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
  const range = maximum - minimum;
  let remaining = current - minimum;
  const parts = segments?.map(segment => {
    const amount = Math.min(remaining, Math.max(0, Number.isFinite(segment.value) ? segment.value : 0));
    remaining -= amount;
    return { ...segment, amount, width: amount / range * 100 };
  });
  return <AriaMeter {...props} value={current} minValue={minimum} maxValue={maximum} aria-describedby={[describedBy, parts?.length ? detailsId : undefined].filter(Boolean).join(' ') || undefined} className={cx('ui-meter', className)} data-size={size} data-tone={tone}>
    {({ percentage, valueText }) => <>
      <div className="ui-meter__heading"><Label className={cx('ui-meter__label', hideLabel && 'sr-only')}>{label}</Label>{showValue && <span className="ui-meter__value" aria-hidden>{valueText}</span>}</div>
      <div className="ui-meter__track" aria-hidden>
        {parts?.length ? <>{parts.map(part => <span key={part.id} className="ui-meter__segment" style={{ width: `${part.width}%`, background: part.color }}/>)}<span className="ui-meter__segment ui-meter__remainder" style={{ width: `${remaining / range * 100}%` }}/></> : <span className="ui-meter__fill" style={{ width: `${percentage}%` }}/>}
      </div>
      {!!parts?.length && <span id={detailsId} className="sr-only">{parts.map(part => `${part.label}: ${partFormatter.format(part.amount)}`).join('; ')}{remaining > 0 ? `; Other: ${partFormatter.format(remaining)}` : ''}</span>}
    </>}
  </AriaMeter>;
}
