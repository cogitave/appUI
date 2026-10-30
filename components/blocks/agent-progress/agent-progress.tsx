'use client';

import { useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RiCheckLine, RiSubtractLine, RiExpandVerticalLine } from '@remixicon/react';
import { cx } from '@/utils/cx';

export type AgentProgressStep = { id: string; label: string; status?: 'pending' | 'active' | 'complete'; progress?: number; duration?: string };
export type AgentProgressProps = { steps: AgentProgressStep[]; revealedCount?: number; defaultCollapsed?: boolean; stepDuration?: number; onStepClick?: (id: string) => void; className?: string };
const settleEase = [0.22, 1, 0.36, 1] as const;
export function AgentProgress({ steps, revealedCount, defaultCollapsed = false, stepDuration = 2400, onStepClick, className }: AgentProgressProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const reducedMotion = useReducedMotion();
  const completed = steps.filter(step => step.status === 'complete').length;
  const remaining = steps.length - completed;
  const style = { '--ui-step-duration': `${stepDuration}ms` } as CSSProperties;

  return <div className={cx('ui-agent-progress', className)} data-collapsed={collapsed || undefined} data-complete={!remaining || undefined} style={style}>
    <div className="ui-agent-progress__head">
      <svg className="ui-agent-progress__overall" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="7" style={{ strokeDashoffset: 44 * (1 - Math.max(completed / Math.max(steps.length, 1), remaining ? .06 : 1)) }} /></svg>
      <span className="ui-agent-progress__count" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.span key={remaining} initial={reducedMotion ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: reducedMotion ? 0 : .18, ease: settleEase }}>{remaining ? `${remaining} steps left` : 'All steps complete'}</motion.span></AnimatePresence></span>
      <button type="button" aria-label={collapsed ? 'Expand progress' : 'Collapse progress'} aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}>{collapsed ? <RiExpandVerticalLine size={16} aria-hidden /> : <RiSubtractLine size={16} aria-hidden />}</button>
    </div>
    <motion.div className="ui-agent-progress__steps" initial={false} animate={{ height: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, marginTop: collapsed ? 0 : 9 }} transition={{ duration: reducedMotion ? 0 : .24, ease: [0.2, .75, .25, 1] }} inert={collapsed}>
      <AnimatePresence initial={false}>{steps.slice(0, revealedCount ?? steps.length).map(step => <motion.button type="button" key={step.id} disabled={!onStepClick} initial={reducedMotion ? false : { opacity: 0, height: 0, filter: 'blur(3px)' }} animate={{ opacity: 1, height: 32, filter: 'blur(0px)' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reducedMotion ? 0 : .28, ease: settleEase }} className="ui-agent-progress__step" data-status={step.status ?? 'pending'} onClick={() => onStepClick?.(step.id)}>
        <span className="ui-agent-progress__mark" aria-hidden="true"><AnimatePresence mode="wait" initial={false}><motion.span key={step.status ?? 'pending'} initial={reducedMotion ? false : { opacity: 0, scale: .65 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .65 }} transition={{ duration: reducedMotion ? 0 : .2, ease: settleEase }}>{step.status === 'complete' ? <RiCheckLine size={11} /> : step.status === 'active' ? <svg viewBox="0 0 20 20" data-controlled={step.progress !== undefined || undefined}><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="7" style={step.progress === undefined ? undefined : { strokeDashoffset: 44 * (1 - Math.min(1, Math.max(0, step.progress))) }} /></svg> : null}</motion.span></AnimatePresence></span>
        <span className="ui-agent-progress__label"><span className="ui-agent-progress__label-text">{step.label}<motion.span className="ui-agent-progress__strike" initial={false} animate={{ scaleX: step.status === 'complete' ? 1 : 0, opacity: step.status === 'complete' ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : .32, delay: reducedMotion ? 0 : step.status === 'complete' ? .08 : 0, ease: settleEase }} /></span></span>{step.duration && <small>{step.duration}</small>}
      </motion.button>)}</AnimatePresence>
    </motion.div>
  </div>;
}
