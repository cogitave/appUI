'use client';

import { useEffect, useState } from 'react';
import { Button as AriaButton, Calendar, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import type { CalendarDate } from '@internationalized/date';
import { RiArrowDownSLine, RiCalendarLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { DateChipInput, formatTriggerDate, MonthPanel } from './shared';

export interface DatePickerProps {
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onChange?: (value: CalendarDate | null) => void;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
}

export function DatePicker({ value, defaultValue = null, onChange, isDisabled: disabled, className, placeholder = 'Select date', 'aria-label': ariaLabel = 'Date' }: DatePickerProps) {
  const isDisabled = useFieldDisabled(disabled);
  const [internalValue, setInternalValue] = useState<CalendarDate | null>(defaultValue);
  const committed = value === undefined ? internalValue : value;
  const [pending, setPending] = useState<CalendarDate | null>(committed);
  const [isOpen, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  useEffect(() => { if (isDisabled) setOpen(false); }, [isDisabled]);

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
      <span>{committed ? formatTriggerDate(committed) : placeholder}</span>
      <RiArrowDownSLine size={16} aria-hidden />
    </AriaButton>
    <Popover placement="bottom end" offset={8} className="ui-date-popover ui-date-popover--single">
      {({isExiting})=><Dialog inert={isExiting || Boolean(isDisabled)} aria-label={ariaLabel} className="ui-date-dialog">
        <Calendar key={openKey} aria-label={ariaLabel} value={pending} onChange={setPending} className="ui-single-calendar">
          <MonthPanel showPrev showNext />
          <div className="ui-date-footer"><div className="ui-date-footer__summary">{pending && <DateChipInput date={pending} label="Selected date" onCommit={setPending} />}</div><div className="ui-date-footer__actions"><Button variant="secondary" onClick={() => openChange(false)}>Cancel</Button><Button disabled={!pending} onClick={apply}>Apply</Button></div></div>
        </Calendar>
      </Dialog>}
    </Popover>
  </DialogTrigger>;
}
