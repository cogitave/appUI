'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiAddLine, RiArrowLeftSLine, RiArrowRightLine, RiArrowRightSLine, RiCloseLine, RiGlobalLine, RiGroupLine, RiInbox2Line, RiNotification3Line, RiTimeLine, RiVideoChatLine } from '@remixicon/react';
import { Dropdown, DropdownIconTrigger, DropdownPopover } from '@/components/base/dropdown/dropdown';
import { NotificationCenter, type InboxNotification } from '@/components/blocks/notification-center/notification-center';
import { cx } from '@/utils/cx';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  color?: 'blue' | 'pink' | 'lime' | 'purple' | 'cyan';
  description?: string;
  attendees?: string[];
  meetingUrl?: string;
  meetingCode?: string;
  meetingProvider?: string;
  timezone?: string;
  reminder?: string;
};
export type CalendarNotification = Pick<InboxNotification, 'id' | 'title'> & Partial<Pick<InboxNotification, 'category' | 'time' | 'avatar' | 'status' | 'action' | 'secondaryAction'>> & { detail?: string; read?: boolean };
export type CalendarProps = {
  events: CalendarEvent[];
  notifications?: CalendarNotification[];
  month?: Date;
  defaultMonth?: Date;
  onNotificationReadChange?: (id: string, read: boolean) => void;
  onMonthChange?: (month: Date) => void;
  onNewEvent?: (date?: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onJoinMeeting?: (event: CalendarEvent) => void;
  className?: string;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const keyOf = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const monthName = (date: Date) => new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
const eventDate = (value: string) => new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(value + 'T12:00:00'));
function durationText(start: string, end: string) {
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  const minutes = ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes) + 1440) % 1440;
  return [Math.floor(minutes / 60) ? Math.floor(minutes / 60) + 'h' : '', minutes % 60 ? minutes % 60 + 'm' : ''].join('');
}

export function Calendar({ events, notifications = [], month, defaultMonth = new Date(), onMonthChange, onNewEvent, onEventClick, onJoinMeeting, onNotificationReadChange, className }: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState(new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1));
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [feed, setFeed] = useState<'notifications' | 'inbox' | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0 });
  const gridRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const current = month ?? internalMonth;
  const first = new Date(current.getFullYear(), current.getMonth(), 1);
  const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index));
  const byDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    for (const event of events) grouped.set(event.date, [...(grouped.get(event.date) ?? []), event]);
    return grouped;
  }, [events]);
  const notificationItems: InboxNotification[] = notifications.map(item => ({ ...item, category: item.category ?? 'activity', time: item.time ?? '', description: item.detail ?? '', unread: !item.read && !readIds.includes(item.id) }));
  const unread = notificationItems.filter(item => item.unread).length;
  function markRead(ids: string[]) {
    setReadIds(current => [...new Set([...current, ...ids])]);
    ids.forEach(id => onNotificationReadChange?.(id, true));
  }
  const monthEvents = events.filter(item => item.date.slice(0, 7) === keyOf(first).slice(0, 7)).slice(0, 4);

  function move(offset: number) {
    const next = new Date(first.getFullYear(), first.getMonth() + offset, 1);
    if (!month) setInternalMonth(next);
    onMonthChange?.(next);
    setSelected(null);
    setFeed(null);
  }

  function positionPopover() {
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const width = Math.min(302, window.innerWidth - 24);
    const left = window.innerWidth < 680 ? Math.max(12, (window.innerWidth - width) / 2) : Math.min(window.innerWidth - width - 12, anchor.right + 8);
    const gridTop = gridRef.current?.getBoundingClientRect().top ?? anchor.top;
    const desiredTop = Math.max(gridTop, anchor.top - 104);
    const actualHeight = popoverRef.current?.getBoundingClientRect().height ?? 412;
    const top = Math.max(12, Math.min(desiredTop, window.innerHeight - actualHeight - 12));
    setPopoverPosition({ left, top });
  }

  useLayoutEffect(() => {
    if (!selected) return;
    positionPopover();
    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, true);
    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover, true);
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    function dismiss(event: PointerEvent) {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !gridRef.current?.contains(target)) setSelected(null);
    }
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') setSelected(null); }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selected]);

  function openEvent(event: CalendarEvent, anchor: HTMLButtonElement) {
    anchorRef.current = anchor;
    setSelected(event);
    setFeed(null);
    onEventClick?.(event);
  }

  return <div className={cx('ui-calendar', className)}>
    <div className="ui-calendar__head">
      <h2>{monthName(first)}</h2>
      <div className="ui-calendar__head-actions">
        <div className="ui-calendar__feed-wrap">
          <Dropdown isOpen={feed === 'notifications'} onOpenChange={open => setFeed(current => open ? 'notifications' : current === 'notifications' ? null : current)}>
            <DropdownIconTrigger icon={RiNotification3Line} aria-label="Notifications" badge={unread} />
            <DropdownPopover aria-label="Calendar notifications" placement="bottom end" offset={8} className="ui-calendar__notifications-popover">
              <NotificationCenter items={notificationItems} onReadChange={id => markRead([id])} onMarkAllRead={() => markRead(notificationItems.filter(item => item.unread).map(item => item.id))} />
            </DropdownPopover>
          </Dropdown>
          <Dropdown isOpen={feed === 'inbox'} onOpenChange={open => setFeed(current => open ? 'inbox' : current === 'inbox' ? null : current)}>
            <DropdownIconTrigger icon={RiInbox2Line} aria-label="Inbox" />
            <DropdownPopover aria-label="Events this month" placement="bottom end" offset={8} className="ui-calendar__inbox-popover"><div className="ui-calendar__inbox"><strong>Events this month</strong>{monthEvents.length ? monthEvents.map(item => <div key={item.id}><b>{item.title}</b><small>{eventDate(item.date)}</small></div>) : <p>No events this month</p>}</div></DropdownPopover>
          </Dropdown>
        </div>
        <div className="ui-calendar__tools"><button type="button" aria-label="Previous month" onClick={() => move(-1)}><RiArrowLeftSLine size={18} aria-hidden /></button><span>{monthName(first)}</span><button type="button" aria-label="Next month" onClick={() => move(1)}><RiArrowRightSLine size={18} aria-hidden /></button></div>
        {onNewEvent && <button className="ui-calendar__new" type="button" onClick={() => onNewEvent()}><RiAddLine size={17} aria-hidden /> New event</button>}
      </div>
    </div>
    <div className="ui-calendar__scroller"><div className="ui-calendar__grid" ref={gridRef}>
      <div className="ui-calendar__weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="ui-calendar__days">{days.map(date => {
        const key = keyOf(date);
        const dayEvents = byDate.get(key) ?? [];
        const outside = date.getMonth() !== first.getMonth();
        return <div key={key} className="ui-calendar__day" data-outside={outside || undefined} data-today={key === keyOf(new Date()) || undefined}>
          <button className="ui-calendar__day-number" type="button" disabled={!onNewEvent} aria-label={new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date)} onClick={() => { setSelected(null); onNewEvent?.(key); }}>{date.getDate()}</button>
          <div className="ui-calendar__events">
            {dayEvents.length > 4 && <button className="ui-calendar__more" type="button" onClick={event => openEvent(dayEvents[4], event.currentTarget)}>+{dayEvents.length - 4} more</button>}
            {dayEvents.slice(0, 4).map(event => <button key={event.id} type="button" data-color={event.color ?? 'blue'} aria-label={[event.title, key, event.time].filter(Boolean).join(' · ')} onClick={click => openEvent(event, click.currentTarget)}><span>{event.title}</span>{event.time && <time>{event.time}</time>}</button>)}
          </div>
        </div>;
      })}</div>
    </div></div>
    {selected && typeof document !== 'undefined' && createPortal(<aside className="ui-calendar__popover" ref={popoverRef} role="dialog" aria-modal="false" aria-label={selected.title + ' details'} style={popoverPosition}>
      <div className="ui-calendar__popover-head"><div><strong>{selected.title}</strong><span>{eventDate(selected.date)}</span></div><button type="button" aria-label="Close event details" onClick={() => setSelected(null)}><RiCloseLine size={17} /></button></div>
      {selected.meetingProvider && <div className="ui-calendar__popover-row ui-calendar__popover-meeting"><RiVideoChatLine size={16} aria-hidden /><span>{selected.meetingProvider}</span>{selected.meetingCode && <code>{selected.meetingCode}</code>}{(selected.meetingUrl || onJoinMeeting) && (selected.meetingUrl ? <a href={selected.meetingUrl} target="_blank" rel="noreferrer">Join</a> : <button type="button" onClick={() => onJoinMeeting?.(selected)}>Join</button>)}</div>}
      {selected.time && <div className="ui-calendar__popover-row"><RiTimeLine size={16} aria-hidden /><span>{selected.time}</span>{selected.endTime && <><RiArrowRightLine size={16} aria-hidden /><span>{selected.endTime}</span></>}{selected.endTime && <small>{durationText(selected.time, selected.endTime)}</small>}</div>}
      {selected.timezone && <div className="ui-calendar__popover-row"><RiGlobalLine size={16} aria-hidden /><span>{selected.timezone}</span></div>}
      {selected.attendees?.length ? <div className="ui-calendar__popover-row ui-calendar__popover-participants"><div className="ui-calendar__popover-section-title"><RiGroupLine size={16} aria-hidden /><span>Participants</span></div>{selected.attendees.map((person, index) => <div className="ui-calendar__person" key={person}><span data-index={index % 4}>{person[0]?.toUpperCase()}</span>{person}</div>)}</div> : null}
      {selected.reminder && <div className="ui-calendar__popover-row"><RiNotification3Line size={16} aria-hidden /><span>Reminders</span><b>{selected.reminder}</b></div>}
      {selected.description && <p className="ui-calendar__popover-description">{selected.description}</p>}
    </aside>, document.body)}
  </div>;
}
