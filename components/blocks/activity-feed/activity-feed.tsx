'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { RiArrowDownSLine, RiTimeLine } from '@remixicon/react';
import { Avatar, type AvatarProps } from '@/components/base/avatar/avatar';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Button, type ButtonProps } from '@/components/base/buttons/button';
import { Card, CardHeader } from '@/components/base/card/card';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { Spinner } from '@/components/base/spinner/spinner';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type ActivityEntry = {
  id: string;
  title: string;
  description?: ReactNode;
  time: string;
  dateTime?: string;
  group?: string;
  actor?: Pick<AvatarProps, 'src' | 'initials' | 'color'> & { name: string };
  icon?: IconComponent;
  detail?: ReactNode;
  action?: { label: string; onPress: () => void; isDisabled?: boolean; isLoading?: boolean; variant?: ButtonProps['variant'] };
};
export type ActivityFeedProps = {
  items: ActivityEntry[];
  label?: string;
  description?: string;
  density?: 'normal' | 'compact';
  variant?: 'bordered' | 'soft' | 'raised';
  height?: number | string;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  headerActions?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
};

function ActivityPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present} aria-hidden={!present || undefined}>{children}</div>;
}

export function ActivityFeed({ items, label = 'Project activity', description, density = 'normal', variant = 'bordered', height, expandedKeys, defaultExpandedKeys = [], onExpandedChange, headerActions, footer, isLoading = false, emptyTitle = 'No activity yet', emptyDescription = 'Updates will appear here as work moves forward.', emptyAction, className }: ActivityFeedProps) {
  const [internalKeys, setInternalKeys] = useState(defaultExpandedKeys);
  const expanded = expandedKeys ?? internalKeys;
  const id = useId(), reduced = useReducedMotion();
  function toggle(key: string) {
    const next = expanded.includes(key) ? expanded.filter(item => item !== key) : [...expanded, key];
    if (expandedKeys === undefined) setInternalKeys(next);
    onExpandedChange?.(next);
  }
  const groupCounts = new Map<string, number>();
  const content = items.length ? <ol className="ui-activity-feed__list" aria-label={label}>
    <AnimatePresence initial={false} mode="popLayout">{items.flatMap((item, index) => {
      const Icon = item.icon ?? RiTimeLine, detailId = `${id}-${index}`, isExpanded = expanded.includes(item.id);
      const startsGroup = Boolean(item.group && item.group !== items[index - 1]?.group);
      const endsGroup = index === items.length - 1 || item.group !== items[index + 1]?.group;
      const entry = <motion.li key={`entry-${item.id}`} className="ui-activity-feed__item" layout="position" data-last-group={endsGroup || undefined} initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .24, ease: [.2,.75,.25,1] }}>
        <ActivityPresence>
        <div className="ui-activity-feed__row">
          <div className="ui-activity-feed__mark">{item.actor ? <Avatar size="md" src={item.actor.src} initials={item.actor.initials ?? item.actor.name.split(' ').map(word => word[0]).join('').slice(0,2)} alt={item.actor.name} color={item.actor.color}/> : <span className="ui-activity-feed__system" aria-hidden><Icon/></span>}</div>
          <div className="ui-activity-feed__copy"><div className="ui-activity-feed__heading"><p>{item.actor ? <><strong>{item.actor.name}</strong> {item.title}</> : <strong>{item.title}</strong>}</p><time dateTime={item.dateTime}>{item.time}</time></div>
            {item.description && <div className="ui-activity-feed__description">{item.description}</div>}
            {(item.detail || item.action) && <div className="ui-activity-feed__actions">{item.detail && <Button size="xs" variant="ghost" trailingIcon={RiArrowDownSLine} aria-label={`Details for ${item.title}`} aria-expanded={isExpanded} aria-controls={detailId} onClick={() => toggle(item.id)}>Details</Button>}{item.action && <Button size="xs" variant={item.action.variant ?? 'outline'} disabled={item.action.isDisabled} isLoading={item.action.isLoading} onClick={item.action.onPress}>{item.action.label}</Button>}</div>}
            {item.detail && <Collapsible id={detailId} isOpen={isExpanded}><div className="ui-activity-feed__detail">{item.detail}</div></Collapsible>}
          </div>
        </div></ActivityPresence>
      </motion.li>;
      if (!startsGroup) return [entry];
      const occurrence = (groupCounts.get(item.group!) ?? 0) + 1;
      groupCounts.set(item.group!, occurrence);
      return [<motion.li key={`group-${item.group}-${occurrence}`} role="presentation" className="ui-activity-feed__group" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16 }}><ActivityPresence><h4>{item.group}</h4></ActivityPresence></motion.li>, entry];
    })}</AnimatePresence>
  </ol> : <EmptyState size="small" title={isLoading ? 'Loading activity…' : emptyTitle} description={isLoading ? 'Updates will appear here.' : emptyDescription} icon={isLoading ? <Spinner/> : <RiTimeLine/>} actions={!isLoading ? emptyAction : undefined}/>;
  const body = <AnimatePresence initial={false} mode="popLayout"><motion.div key={items.length ? 'entries' : 'empty'} className="ui-activity-feed__view" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16 }}><ActivityPresence>{content}</ActivityPresence></motion.div></AnimatePresence>;
  return <Card className={cx('ui-activity-feed', className)} variant={variant} padding="none" data-density={density} data-constrained={height !== undefined || undefined} aria-busy={isLoading || undefined} style={{ '--activity-height': typeof height === 'number' ? `${height}px` : height } as CSSProperties}>
    <CardHeader title={label} description={description} actions={headerActions}/>
    {height !== undefined ? <ScrollArea label={label} className="ui-activity-feed__scroll">{body}</ScrollArea> : <div className="ui-activity-feed__content"><AnimatedHeight>{body}</AnimatedHeight></div>}
    {footer && <div className="ui-activity-feed__footer">{footer}</div>}
  </Card>;
}
