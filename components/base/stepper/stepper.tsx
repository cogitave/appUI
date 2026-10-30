'use client';

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { RiCheckLine, RiErrorWarningLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { useMotionTokens } from '@/hooks/use-motion-tokens';
import { cx } from '@/utils/cx';

export type StepperStep = { id: string; label: string; description?: string; controls?: string; status?: 'pending' | 'complete' | 'error'; isOptional?: boolean; isDisabled?: boolean };
export type StepperProps = {
  steps: StepperStep[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  variant?: 'numbered' | 'labels';
  orientation?: 'horizontal' | 'vertical';
  isReadOnly?: boolean;
  className?: string;
  'aria-label'?: string;
};

/** Selection describes location; only caller-supplied status describes completion. */
export function Stepper({ steps, selectedKey, defaultSelectedKey, onSelectionChange, variant = 'numbered', orientation = 'horizontal', isReadOnly = false, className, 'aria-label': label = 'Progress steps' }: StepperProps) {
  const [internal, setInternal] = useState(defaultSelectedKey ?? steps.find(step => !step.isDisabled)?.id ?? '');
  const [focused, setFocused] = useState<string | null>(null);
  const selected = selectedKey ?? internal;
  const enabled = steps.filter(step => !step.isDisabled);
  const tabStop = enabled.find(step => step.id === focused)?.id ?? enabled.find(step => step.id === selected)?.id ?? enabled[0]?.id;
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const id = useId(), reduced = useReducedMotion(), root = useRef<HTMLElement>(null), tokens = useMotionTokens(root);
  const geometry = JSON.stringify(steps.map(step => [step.id, step.label, step.description, step.isOptional]));
  useLayoutEffect(() => {
    const element = root.current;
    if (!element || variant === 'labels') return;
    const items = [...element.querySelectorAll<HTMLElement>('.ui-stepper__item')];
    function measure() {
      const rtl = getComputedStyle(element!).direction === 'rtl';
      const marks = items.map(item => item.querySelector<HTMLElement>('.ui-stepper__mark')!.getBoundingClientRect());
      items.forEach((item, index) => {
        const mark = marks[index], next = marks[index + 1], box = item.getBoundingClientRect();
        if (!next) return;
        const vertical = Math.abs(next.top - mark.top) > Math.abs(next.left - mark.left);
        const center = mark.left + mark.width / 2, nextCenter = next.left + next.width / 2;
        const inlineCenter = rtl ? box.right - center : center - box.left;
        item.style.setProperty('--step-line-inline', `${vertical ? inlineCenter : inlineCenter + 21}px`);
        item.style.setProperty('--step-line-top', `${mark.top - box.top + mark.height / 2 + (vertical ? 21 : 0)}px`);
        item.style.setProperty('--step-line-width', `${vertical ? 1 : Math.max(0, (rtl ? center - nextCenter : nextCenter - center) - 42)}px`);
        item.style.setProperty('--step-line-height', `${vertical ? Math.max(0, next.top - mark.top - 42) : 1}px`);
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element, {box:'border-box'});
    items.forEach(item => observer.observe(item, {box:'border-box'}));
    element.querySelectorAll('.ui-stepper__content').forEach(content => observer.observe(content, {box:'border-box'}));
    const direction = new MutationObserver(measure);
    for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) direction.observe(parent, {attributes:true, attributeFilter:['dir','class']});
    return () => { observer.disconnect(); direction.disconnect(); };
  }, [geometry, orientation, variant]);
  function choose(key: string) {
    if (isReadOnly || key === selected || !enabled.some(step => step.id === key)) return;
    if (selectedKey === undefined) setInternal(key);
    onSelectionChange?.(key);
  }
  function navigate(event: KeyboardEvent<HTMLElement>) {
    if (isReadOnly || event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key) || !enabled.length) return;
    const key = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-step-key]')?.dataset.stepKey;
    if (!key) return;
    event.preventDefault();
    const current = enabled.findIndex(step => step.id === key);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = event.key === 'ArrowDown' || (event.key === 'ArrowRight' && !rtl) || (event.key === 'ArrowLeft' && rtl);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (current + (forward ? 1 : -1) + enabled.length) % enabled.length;
    buttons.current.get(enabled[index].id)?.focus();
  }
  return <nav ref={root} className={cx('ui-stepper', className)} data-variant={variant} data-orientation={orientation} data-readonly={isReadOnly || undefined} aria-label={label} onKeyDown={navigate}>
    <ol className="ui-stepper__list">{steps.map((step, index) => {
      const current = selected === step.id, status = step.status ?? 'pending', detailId = `${id}-${index}`;
      const content = <><span className="ui-stepper__content"><span className="ui-stepper__mark" aria-hidden>{(['pending','complete','error'] as const).map(kind => <span className="ui-stepper__glyph" key={kind} data-status={kind} data-active={status === kind || undefined}>{kind === 'complete' ? <RiCheckLine/> : kind === 'error' ? <RiErrorWarningLine/> : index + 1}</span>)}</span><span className="ui-stepper__copy"><span className="ui-stepper__title">{step.label}</span>{step.isOptional && <span className="ui-stepper__optional">Optional</span>}{step.description && <span className="ui-stepper__description">{step.description}</span>}</span></span>{variant === 'labels' && current && <motion.span className="ui-stepper__indicator" layoutId={`${id}-step`} transition={{ duration: reduced ? 0 : tokens.standard, ease: tokens.ease }}/>}</>;
      return <li key={step.id} className="ui-stepper__item" data-current={current || undefined} data-status={status} data-disabled={step.isDisabled || undefined}>
        {isReadOnly ? <div className="ui-stepper__control" aria-current={current ? 'step' : undefined} aria-describedby={detailId}>{content}</div> : <Button ref={element => { if (element) buttons.current.set(step.id, element); else buttons.current.delete(step.id); }} variant="ghost" size="small" className="ui-stepper__control" data-step-key={step.id} tabIndex={tabStop === step.id ? 0 : -1} disabled={step.isDisabled} aria-label={step.label} aria-describedby={detailId} aria-controls={step.controls} aria-current={current ? 'step' : undefined} onFocus={() => setFocused(step.id)} onBlur={event => { if (!event.currentTarget.closest('.ui-stepper')?.contains(event.relatedTarget)) setFocused(null); }} onClick={() => choose(step.id)}>{content}</Button>}
        <span id={detailId} className="sr-only">Step {index + 1} of {steps.length}.{current ? ' Current step.' : ''}{status === 'complete' ? ' Complete.' : status === 'error' ? ' Needs attention.' : ''}{step.isOptional ? ' Optional.' : ''}{step.isDisabled ? ' Unavailable.' : ''}{step.description ? ` ${step.description}` : ''}</span>
      </li>;
    })}</ol>
  </nav>;
}
