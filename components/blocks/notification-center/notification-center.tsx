'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { RiCheckDoubleLine, RiNotification3Line } from '@remixicon/react';
import { Avatar } from '@/components/base/avatar/avatar';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type InboxNotification = { id: string; category: 'mentions' | 'system' | 'activity'; title: string; description: string; time: string; group?: string; unread?: boolean; status?: 'neutral' | 'information' | 'success' | 'error'; icon?: IconComponent; avatar?: { src?: string; alt: string; initials: string }; action?: { label: string; variant?: 'primary' | 'secondary' | 'danger'; onPress: () => void }; secondaryAction?: { label: string; variant?: 'primary' | 'secondary' | 'danger'; onPress: () => void } };
type Filter = 'all' | 'mentions' | 'system';
export type NotificationCenterProps = { items: InboxNotification[]; tab?: Filter; defaultTab?: Filter; onTabChange?: (tab: Filter) => void; onReadChange?: (id: string, read: boolean) => void; onMarkAllRead?: () => void; onAction?: (notificationId: string, actionLabel: string) => void; className?: string };
export function NotificationCenter({ items, tab, defaultTab = 'all', onTabChange, onReadChange, onMarkAllRead, onAction, className }: NotificationCenterProps) {
  const [internalFilter, setInternalFilter] = useState<Filter>(defaultTab);
  const filter = tab ?? internalFilter;
  const [readIds, setReadIds] = useState<string[]>([]);
  const reducedMotion = useReducedMotion();
  const unread = items.filter(item => item.unread && !readIds.includes(item.id)).length;
  const visible = items.filter(item => filter === 'all' || item.category === filter);
  function markRead(id: string) { if (readIds.includes(id)) return; setReadIds(current => [...current,id]); onReadChange?.(id,true); }
  function markAll() { if (!unread) return; setReadIds(items.map(item => item.id)); onMarkAllRead?.(); }
  return <div className={cx('ui-notification-center', className)}><header><div><h2>Notifications</h2><p>{unread} unread</p></div><button type="button" aria-disabled={!unread} onClick={markAll}>Mark all read</button></header><div className="ui-notification-center__tabs" role="tablist" aria-label="Notification filter">{(['all','mentions','system'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => { if (tab === undefined) setInternalFilter(item); onTabChange?.(item); }}>{item[0].toUpperCase()+item.slice(1)} <span>{item === 'all' ? items.length : items.filter(entry => entry.category === item).length}</span></button>)}</div><div className="ui-notification-center__list"><AnimatePresence mode="popLayout" initial={false}>{visible.length ? visible.map(item => {
    const Icon = item.icon ?? RiNotification3Line;
    const actions = [item.action, item.secondaryAction].filter(action => action !== undefined);
    return <motion.article key={item.id} className="ui-notification-center__item" layout initial={reducedMotion ? false : { opacity: 0, y: 8, filter: 'blur(3px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={reducedMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(3px)' }} transition={{ duration: reducedMotion ? 0 : .28, ease: [0.2, .75, .25, 1] }} data-unread={item.unread && !readIds.includes(item.id) || undefined} data-status={item.status ?? 'neutral'}><div className="ui-notification-center__avatar">{item.avatar ? <Avatar size="md" src={item.avatar.src} alt={item.avatar.alt} initials={item.avatar.initials} /> : <Icon size={20} aria-hidden />}</div><div className="ui-notification-center__copy"><div className="ui-notification-center__headline"><strong>{item.title}</strong><div className="ui-notification-center__meta"><time>{item.time}</time>{item.unread && !readIds.includes(item.id) && <button type="button" aria-label={`Mark ${item.title} as read`} onClick={() => markRead(item.id)} />}</div></div><p>{item.description}</p>{actions.length > 0 && <div className="ui-notification-center__actions">{actions.map((action, index) => <button key={`${item.id}-${index}`} type="button" data-variant={action.variant ?? (index === 0 ? 'primary' : 'secondary')} onClick={() => { action.onPress(); onAction?.(item.id, action.label); markRead(item.id); }}>{action.label}</button>)}</div>}</div></motion.article>;
  }) : <div className="ui-notification-center__empty" key="empty"><RiCheckDoubleLine size={25} aria-hidden /><strong>All caught up</strong><span>There’s nothing new in this view.</span></div>}</AnimatePresence></div></div>;
}
