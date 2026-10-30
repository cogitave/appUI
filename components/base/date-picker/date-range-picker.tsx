'use client';

import { useEffect, useState } from 'react';
import { Button as AriaButton, Dialog, DialogTrigger, Popover, RangeCalendar } from 'react-aria-components';
import { CalendarDate, endOfMonth, endOfYear, getLocalTimeZone, isSameDay, startOfMonth, startOfYear, today } from '@internationalized/date';
import { RiCalendarLine, RiArrowDownSLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { DateChipInput, formatTriggerDate, MonthPanel } from './shared';

export interface DateRangeValue { start: CalendarDate; end: CalendarDate }
export interface DateRangePickerProps {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null) => void;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
}

function presets(): { label: string; range: DateRangeValue }[] {
  const now = today(getLocalTimeZone());
  const yesterday = now.subtract({ days: 1 });
  const lastMonth = now.subtract({ months: 1 });
  const lastYear = now.subtract({ years: 1 });
  return [
    { label: 'Today', range: { start: now, end: now } },
    { label: 'Yesterday', range: { start: yesterday, end: yesterday } },
    { label: 'Last week', range: { start: now.subtract({ days: 7 }), end: yesterday } },
    { label: 'This month', range: { start: startOfMonth(now), end: endOfMonth(now) } },
    { label: 'Last month', range: { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) } },
    { label: 'This year', range: { start: startOfYear(now), end: endOfYear(now) } },
    { label: 'Last year', range: { start: startOfYear(lastYear), end: endOfYear(lastYear) } },
    { label: 'All time', range: { start: now.subtract({ years: 10 }), end: now } },
  ];
}

function daysInRange(range: DateRangeValue) {
  const difference = Date.UTC(range.end.year, range.end.month - 1, range.end.day) - Date.UTC(range.start.year, range.start.month - 1, range.start.day);
  return Math.round(difference / 86_400_000) + 1;
}

export function DateRangePicker({ value, defaultValue = null, onChange, isDisabled: disabled, className, placeholder = 'Select date range', 'aria-label': ariaLabel = 'Date range' }: DateRangePickerProps) {
  const isDisabled = useFieldDisabled(disabled);
  const [internalValue, setInternalValue] = useState<DateRangeValue | null>(defaultValue);
  const committed = value === undefined ? internalValue : value;
  const [pending, setPending] = useState<DateRangeValue | null>(committed);
  const [isOpen, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  const [isCompact, setCompact] = useState(false);
  const choices = presets();
  useEffect(() => { if (isDisabled) setOpen(false); }, [isDisabled]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 880px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  function openChange(next: boolean) {
    if (next) {
      setPending(committed);
      setOpenKey(key => key + 1);
    }
    setOpen(next);
  }

  function apply() {
    if (!pending) return;
    if (value === undefined) setInternalValue(pending);
    onChange?.(pending);
    setOpen(false);
  }

  return <DialogTrigger isOpen={isOpen} onOpenChange={openChange}>
    <AriaButton isDisabled={isDisabled} aria-label={ariaLabel} className={cx('ui-date-trigger', className)}>
      <RiCalendarLine size={18} aria-hidden />
      <span>{committed ? `${formatTriggerDate(committed.start)} – ${formatTriggerDate(committed.end)}` : placeholder}</span>
      <RiArrowDownSLine size={16} aria-hidden />
    </AriaButton>
    <Popover placement="bottom end" offset={8} className="ui-date-popover">
      {({isExiting})=><Dialog inert={isExiting || Boolean(isDisabled)} aria-label={ariaLabel} className="ui-date-dialog">
        <RangeCalendar key={openKey} aria-label={ariaLabel} visibleDuration={{ months: isCompact ? 1 : 2 }} value={pending} onChange={setPending} className="ui-range-calendar">
          <div className="ui-date-range-layout">
            <div className="ui-date-presets" aria-label="Quick date ranges">
              {choices.map(({ label, range }) => <button key={label} type="button" aria-pressed={!!pending && isSameDay(pending.start, range.start) && isSameDay(pending.end, range.end)} onClick={() => setPending(range)}>{label}</button>)}
            </div>
            <div className="ui-date-range-main">
              <div className="ui-date-range-months"><MonthPanel showPrev showNext /><MonthPanel offset={1} showNext /></div>
              <div className="ui-date-footer">
                <div className="ui-date-footer__summary">
                  {pending && <><DateChipInput date={pending.start} label="Start date" onCommit={start => setPending({ start, end: start.compare(pending.end) > 0 ? start : pending.end })} /><span>–</span><DateChipInput date={pending.end} label="End date" onCommit={end => setPending({ start: end.compare(pending.start) < 0 ? end : pending.start, end })} /><span className="ui-date-day-count">{daysInRange(pending)} days selected</span></>}
                </div>
                <div className="ui-date-footer__actions"><Button variant="secondary" onClick={() => openChange(false)}>Cancel</Button><Button disabled={!pending} onClick={apply}>Apply</Button></div>
              </div>
            </div>
          </div>
        </RangeCalendar>
      </Dialog>}
    </Popover>
  </DialogTrigger>;
}
