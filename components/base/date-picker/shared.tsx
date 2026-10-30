'use client';

import { useContext, useEffect, useState } from 'react';
import { Button as AriaButton, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, CalendarStateContext, RangeCalendarStateContext } from 'react-aria-components';
import type { CalendarCellRenderProps } from 'react-aria-components';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

export function formatTriggerDate(date: CalendarDate) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date.toDate(getLocalTimeZone()));
}

export function formatChipDate(date: CalendarDate) {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
}

export function parseChipDate(value: string) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const test = new Date(Date.UTC(year, month - 1, day));
  if (test.getUTCFullYear() !== year || test.getUTCMonth() !== month - 1 || test.getUTCDate() !== day) return null;
  return new CalendarDate(year, month, day);
}

export function DateChipInput({ date, label, onCommit }: { date: CalendarDate; label: string; onCommit: (value: CalendarDate) => void }) {
  const formatted = formatChipDate(date);
  const [draft, setDraft] = useState(formatted);
  useEffect(() => setDraft(formatted), [formatted]);

  function commit() {
    const parsed = parseChipDate(draft);
    if (parsed) onCommit(parsed);
    else setDraft(formatted);
  }

  return <input className="ui-date-chip" type="text" inputMode="numeric" aria-label={label} value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setDraft(formatted); }} />;
}

function DayCell({ state, isRange }: { state: CalendarCellRenderProps; isRange: boolean }) {
  if (state.isOutsideMonth) return <span className="ui-calendar-day is-outside" aria-hidden="true" />;
  const edge = isRange ? state.isSelectionStart || state.isSelectionEnd : state.isSelected;
  return <span className="ui-calendar-day" data-selected={state.isSelected || undefined} data-edge={edge || undefined} data-disabled={state.isDisabled || undefined} data-focus-visible={state.isFocusVisible || undefined}>{state.formattedDate}</span>;
}

export function MonthPanel({ offset = 0, showPrev = false, showNext = false }: { offset?: number; showPrev?: boolean; showNext?: boolean }) {
  const rangeState = useContext(RangeCalendarStateContext);
  const singleState = useContext(CalendarStateContext);
  const state = rangeState ?? singleState;
  const month = state?.visibleRange.start.add({ months: offset });
  const title = month ? new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(month.toDate(getLocalTimeZone())) : '';

  return <div className="ui-month-panel">
    <div className="ui-month-panel__heading">
      {showPrev ? <AriaButton slot="previous" aria-label="Previous month" className="ui-month-panel__nav"><RiArrowLeftSLine size={19} aria-hidden /></AriaButton> : <span className="ui-month-panel__spacer" />}
      <strong>{title}</strong>
      {showNext ? <AriaButton slot="next" aria-label="Next month" className="ui-month-panel__nav ui-month-panel__nav--next"><RiArrowRightSLine size={19} aria-hidden /></AriaButton> : <span className="ui-month-panel__spacer" />}
    </div>
    <CalendarGrid offset={{ months: offset }} weekdayStyle="short" className="ui-month-panel__grid">
      <CalendarGridHeader>{day => <CalendarHeaderCell className="ui-month-panel__weekday">{day.slice(0, 2)}</CalendarHeaderCell>}</CalendarGridHeader>
      <CalendarGridBody>{date => <CalendarCell date={date} className="ui-month-panel__cell">{cellState => <DayCell state={cellState} isRange={rangeState != null} />}</CalendarCell>}</CalendarGridBody>
    </CalendarGrid>
  </div>;
}
