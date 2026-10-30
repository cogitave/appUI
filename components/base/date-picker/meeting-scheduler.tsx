'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button as AriaButton, Calendar, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { RiArrowDownSLine, RiCalendarLine, RiGlobalLine, RiTimeLine, RiVideoOnLine } from '@remixicon/react';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { MonthPanel } from './shared';
import { Select } from '@/components/base/select/select';

export interface MeetingSelection { date: CalendarDate; time: string; timezone: string }
export interface MeetingSchedulerProps {
  host?: { name: string; initials: string; role?: string };
  meeting?: { title: string; description?: string; durationMinutes: number; location?: string };
  value?: MeetingSelection | null;
  defaultValue?: MeetingSelection | null;
  onChange?: (value: MeetingSelection) => void;
  timezone?: string;
  timezones?: string[];
  startHour?: number;
  endHour?: number;
  slotMinutes?: number;
  className?: string;
  isDisabled?: boolean;
}

const defaultHost = { name: 'Maya Chen', initials: 'MC', role: 'Product designer' };
const defaultMeeting = { title: 'Introductory call', description: 'A short conversation about what you are building.', durationMinutes: 30, location: 'Video meeting' };

function timeLabel(time: string, is24Hour: boolean) {
  if (is24Hour) return time;
  const [hour, minute] = time.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function MeetingScheduler({ host = defaultHost, meeting = defaultMeeting, value, defaultValue = null, onChange, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, timezones, startHour = 9, endHour = 18, slotMinutes = 30, className, isDisabled: disabled }: MeetingSchedulerProps) {
  const isDisabled = useFieldDisabled(disabled);
  const [internalValue, setInternalValue] = useState<MeetingSelection | null>(defaultValue);
  const committed = value === undefined ? internalValue : value;
  const [isOpen, setOpen] = useState(false);
  const [date, setDate] = useState<CalendarDate>(committed?.date ?? today(getLocalTimeZone()));
  const [selectedTime, setSelectedTime] = useState(committed?.time ?? '');
  const [selectedTimezone, setSelectedTimezone] = useState(committed?.timezone ?? timezone);
  const [is24Hour, set24Hour] = useState(true);
  const [openKey, setOpenKey] = useState(0);
  useEffect(() => { if (isDisabled) setOpen(false); }, [isDisabled]);
  const availableTimezones = timezones?.length ? timezones : Array.from(new Set([timezone, 'UTC', 'America/New_York', 'Europe/London', 'Europe/Istanbul']));
  const slots = useMemo(() => {
    const result: string[] = [];
    for (let minutes = startHour * 60; minutes < endHour * 60; minutes += slotMinutes) result.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
    return result;
  }, [startHour, endHour, slotMinutes]);

  function openChange(next: boolean) {
    if (next) {
      setDate(committed?.date ?? today(getLocalTimeZone()));
      setSelectedTime(committed?.time ?? '');
      setSelectedTimezone(committed?.timezone ?? timezone);
      setOpenKey(key => key + 1);
    }
    setOpen(next);
  }

  function chooseTime(time: string) {
    setSelectedTime(time);
    const next = { date, time, timezone: selectedTimezone };
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  }

  return <DialogTrigger isOpen={isOpen} onOpenChange={openChange}>
    <AriaButton isDisabled={isDisabled} className={cx('ui-date-trigger', className)}><RiCalendarLine size={18} aria-hidden /><span>{committed ? `${committed.date.month}/${committed.date.day} · ${timeLabel(committed.time, is24Hour)}` : 'Schedule a meeting'}</span><RiArrowDownSLine size={16} aria-hidden /></AriaButton>
    <Popover placement="bottom start" offset={8} className="ui-date-popover ui-scheduler-popover">
      {({isExiting})=><Dialog inert={isExiting || Boolean(isDisabled)} aria-label="Schedule a meeting" className="ui-date-dialog">
        <div className="ui-scheduler">
          <div className="ui-scheduler__details">
            <span className="ui-scheduler__avatar" aria-hidden>{host.initials}</span>
            <span className="ui-scheduler__host">{host.name}</span>
            {host.role && <span className="ui-scheduler__role">{host.role}</span>}
            <h3>{meeting.title}</h3>
            {meeting.description && <p>{meeting.description}</p>}
            <span className="ui-scheduler__info"><RiTimeLine size={17} aria-hidden />{meeting.durationMinutes} minutes</span>
            <span className="ui-scheduler__info"><RiVideoOnLine size={17} aria-hidden />{meeting.location ?? 'Video meeting'}</span>
          </div>
          <Calendar key={openKey} aria-label="Meeting date" value={date} onChange={setDate} minValue={today(getLocalTimeZone())} className="ui-scheduler__calendar"><MonthPanel showPrev showNext /></Calendar>
          <div className="ui-scheduler__times">
            <strong>Available times</strong>
            <div className="ui-scheduler__timezone"><Select aria-label="Time zone" selectedKey={selectedTimezone} onSelectionChange={value=>{if(value)setSelectedTimezone(value);}} options={availableTimezones.map(item=>({id:item,label:item.replaceAll('_', ' '),leading:<RiGlobalLine size={16} aria-hidden/>}))}/></div>
            <div className="ui-scheduler__format" aria-label="Time format"><button type="button" aria-pressed={!is24Hour} onClick={() => set24Hour(false)}>12h</button><button type="button" aria-pressed={is24Hour} onClick={() => set24Hour(true)}>24h</button></div>
            <div className="ui-scheduler__slots" aria-label="Available time slots">{slots.map(time => <button key={time} type="button" aria-pressed={selectedTime === time} onClick={() => chooseTime(time)}>{timeLabel(time, is24Hour)}</button>)}</div>
          </div>
        </div>
      </Dialog>}
    </Popover>
  </DialogTrigger>;
}
