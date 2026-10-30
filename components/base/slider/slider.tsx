'use client';

import { useId, useState } from 'react';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';

type Common = { min?: number; max?: number; step?: number; isDisabled?: boolean; className?: string; formatValue?: (value: number) => string };
export type SliderProps = Common & { label: string; value?: number; defaultValue?: number; onChange?: (value: number) => void };
export type RangeSliderProps = Common & { label: string; value?: [number, number]; defaultValue?: [number, number]; onChange?: (value: [number, number]) => void };
const percent = (value: number, min: number, max: number) => (value - min) / Math.max(1, max - min) * 100;

export function Slider({ label, min = 0, max = 100, step = 1, value, defaultValue = min, onChange, isDisabled: disabled, className, formatValue = String }: SliderProps) {
  const isDisabled = useFieldDisabled(disabled);
  const inputId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function update(next: number) { if (value === undefined) setInternal(next); onChange?.(next); }
  return <div className={cx('ui-slider', className)} data-disabled={isDisabled || undefined}><div className="ui-slider__head"><label htmlFor={inputId}>{label}</label><output>{formatValue(current)}</output></div><div className="ui-slider__track" style={{ '--start': '0%', '--end': `${percent(current,min,max)}%` } as React.CSSProperties}><span className="ui-slider__fill" /><input id={inputId} type="range" min={min} max={max} step={step} value={current} disabled={isDisabled} aria-valuetext={formatValue(current)} onChange={event => update(Number(event.target.value))} /></div></div>;
}

export function RangeSlider({ label, min = 0, max = 100, step = 1, value, defaultValue = [min, max], onChange, isDisabled: disabled, className, formatValue = String }: RangeSliderProps) {
  const isDisabled = useFieldDisabled(disabled);
  const [internal, setInternal] = useState<[number, number]>(defaultValue);
  const current = value ?? internal;
  function update(next: [number, number]) { if (value === undefined) setInternal(next); onChange?.(next); }
  return <div className={cx('ui-slider ui-slider--range', className)} data-disabled={isDisabled || undefined}><div className="ui-slider__head"><span>{label}</span><span className="ui-slider__values"><output>{formatValue(current[0])}</output><output>{formatValue(current[1])}</output></span></div><div className="ui-slider__track" style={{ '--start': `${percent(current[0],min,max)}%`, '--end': `${percent(current[1],min,max)}%` } as React.CSSProperties}><span className="ui-slider__fill" /><input type="range" min={min} max={current[1]} step={step} value={current[0]} disabled={isDisabled} aria-label={`${label} minimum`} aria-valuetext={formatValue(current[0])} onChange={event => update([Math.min(Number(event.target.value), current[1]), current[1]])} /><input type="range" min={current[0]} max={max} step={step} value={current[1]} disabled={isDisabled} aria-label={`${label} maximum`} aria-valuetext={formatValue(current[1])} onChange={event => update([current[0], Math.max(Number(event.target.value), current[0])])} /></div></div>;
}
