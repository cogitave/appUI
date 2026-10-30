'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  RiArrowDownSLine,
  RiCodeLine,
  RiFileTextLine,
  RiLoader4Line,
  RiReactjsLine,
  RiSearchLine,
  RiSparklingLine,
} from '@remixicon/react';
import { cx } from '@/utils/cx';

export type AgentTaskEvent = {
  id: string;
  label: string;
  resource?: string;
  resourceIcon?: 'file' | 'react';
};

export type AgentTask = {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: string;
  detail?: string;
  resource?: string;
  kind?: 'file' | 'search' | 'code';
  events?: AgentTaskEvent[];
};

export type TaskListProps = {
  tasks: AgentTask[];
  title?: string;
  defaultExpanded?: boolean;
  startDelay?: number;
  stepInterval?: number;
  /** Kept for existing consumers. Prefer stepInterval. */
  streamIntervalMs?: number;
  collapseOnComplete?: boolean;
  /** Number of visible headers and events. Pass this to drive the log from real events. */
  revealed?: number;
  onComplete?: () => void;
  className?: string;
};

const icons = { file: RiFileTextLine, search: RiSearchLine, code: RiCodeLine };
const enter = { opacity: 0, height: 0, y: 6, filter: 'blur(4px)' };
const visible = { opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' };
const transition = { duration: 0.34, ease: [0.2, 0.75, 0.25, 1] as const };

function taskEvents(task: AgentTask): AgentTaskEvent[] {
  return [
    ...(task.events ?? []),
    ...(task.detail ? [{ id: `${task.id}-detail`, label: task.detail }] : []),
    ...(task.resource ? [{ id: `${task.id}-resource`, label: 'Working in', resource: task.resource }] : []),
  ];
}

export function TaskList({
  tasks,
  title = 'Working on your request',
  defaultExpanded = true,
  startDelay = 0,
  stepInterval,
  streamIntervalMs,
  collapseOnComplete = false,
  revealed,
  onComplete,
  className,
}: TaskListProps) {
  const reducedMotion = useReducedMotion();
  const interval = stepInterval ?? streamIntervalMs;
  const totalUnits = tasks.reduce((count, task) => count + 1 + taskEvents(task).length, 0);
  const [internalRevealed, setInternalRevealed] = useState(interval === undefined ? totalUnits : 0);
  const [toggled, setToggled] = useState<string[]>([]);
  const [autoCollapsed, setAutoCollapsed] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasRunningTask = tasks.some(task => task.status === 'running');

  useEffect(() => {
    if (!hasRunningTask) return;
    startedAt.current = Date.now();
    const timer = window.setInterval(() => {
      if (startedAt.current !== null) setElapsed((Date.now() - startedAt.current) / 1000);
    }, 100);
    return () => window.clearInterval(timer);
  }, [hasRunningTask]);

  useEffect(() => {
    if (revealed !== undefined) return;
    if (interval === undefined || reducedMotion) {
      setInternalRevealed(totalUnits);
      return;
    }
    setInternalRevealed(0);
    let ticker: number | undefined;
    const delay = window.setTimeout(() => {
      setInternalRevealed(1);
      ticker = window.setInterval(() => setInternalRevealed(current => {
        if (current + 1 >= totalUnits) window.clearInterval(ticker);
        return Math.min(totalUnits, current + 1);
      }), Math.max(80, interval));
    }, Math.max(0, startDelay));
    return () => {
      window.clearTimeout(delay);
      window.clearInterval(ticker);
    };
  }, [interval, startDelay, totalUnits, revealed, reducedMotion]);

  const visibleUnits = Math.max(0, Math.min(totalUnits, revealed ?? internalRevealed));
  const allDone = tasks.every(task => task.status === 'complete' || task.status === 'error');
  useEffect(() => {
    if (visibleUnits < totalUnits || !allDone) {
      completed.current = false;
      return;
    }
    if (completed.current) return;
    completed.current = true;
    onCompleteRef.current?.();
  }, [allDone, totalUnits, visibleUnits]);

  let eligibleCursor = 0;
  const eligibleToCollapse = tasks.flatMap(task => {
    eligibleCursor += 1 + taskEvents(task).length;
    return collapseOnComplete && task.status === 'complete' && visibleUnits >= eligibleCursor ? [task.id] : [];
  });
  const collapseKey = eligibleToCollapse.join('|');
  useEffect(() => {
    if (!collapseKey) return;
    const timer = window.setTimeout(() => {
      const ids = collapseKey.split('|');
      setAutoCollapsed(current => [...new Set([...current, ...ids])]);
    }, reducedMotion ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [collapseKey, reducedMotion]);

  let cursor = 0;
  return <div className={cx('ui-task-list', className)} role="group" aria-label={title}>
    <ol className="ui-task-list__tree">
      <AnimatePresence initial={false}>
        {tasks.map(task => {
          const events = taskEvents(task);
          const headerUnit = ++cursor;
          const eventEnd = cursor + events.length;
          const visibleEvents = Math.max(0, Math.min(events.length, visibleUnits - cursor));
          cursor = eventEnd;
          if (visibleUnits < headerUnit) return null;

          const Icon = task.kind ? icons[task.kind] : RiSparklingLine;
          const effectiveStatus = visibleEvents < events.length && task.status === 'complete' ? 'running' : task.status;
          const expanded = (defaultExpanded && !autoCollapsed.includes(task.id)) !== toggled.includes(task.id);
          const hasChildren = events.length > 0;
          const displayDuration = task.duration ?? (task.status === 'running' ? `${elapsed.toFixed(1)}s` : undefined);

          return <motion.li
            key={task.id}
            data-status={effectiveStatus}
            className="ui-task-list__task"
            initial={reducedMotion ? false : enter}
            animate={visible}
            exit={enter}
            transition={reducedMotion ? { duration: 0 } : transition}
          >
            <button
              type="button"
              className="ui-task-list__heading"
              aria-expanded={hasChildren ? expanded : undefined}
              onClick={() => hasChildren && setToggled(current => current.includes(task.id) ? current.filter(id => id !== task.id) : [...current, task.id])}
            >
              <span className="ui-task-list__status" aria-hidden>
                {task.status === 'running' ? <RiLoader4Line size={15} className="ui-task-list__spin" /> : <Icon size={15} />}
              </span>
              <strong>{task.title}</strong>
              {displayDuration && <time>{displayDuration}</time>}
              {hasChildren && <RiArrowDownSLine className="ui-task-list__chevron" size={16} aria-hidden />}
            </button>
            <AnimatePresence initial={false}>
              {hasChildren && expanded && visibleEvents > 0 && <motion.ul
                className="ui-task-list__events"
                initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.24 }}
              >
                <AnimatePresence initial={false}>
                  {events.slice(0, visibleEvents).map(event => {
                    const ResourceIcon = event.resourceIcon === 'react' || event.resource?.endsWith('.tsx') ? RiReactjsLine : RiFileTextLine;
                    return <motion.li
                      key={event.id}
                      initial={reducedMotion ? false : enter}
                      animate={visible}
                      exit={enter}
                      transition={reducedMotion ? { duration: 0 } : transition}
                    >
                      <span className="ui-task-list__event-label">{event.label}</span>
                      {event.resource && <span className="ui-task-list__resource" title={event.resource}>
                        <ResourceIcon size={13} aria-hidden />
                        <span>{event.resource}</span>
                      </span>}
                    </motion.li>;
                  })}
                </AnimatePresence>
              </motion.ul>}
            </AnimatePresence>
          </motion.li>;
        })}
      </AnimatePresence>
    </ol>
  </div>;
}
