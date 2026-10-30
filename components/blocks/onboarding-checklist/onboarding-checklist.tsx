'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { RiArrowDownSLine } from '@remixicon/react';
import { Button, type ButtonProps } from '@/components/base/buttons/button';
import { Card, CardHeader, type CardProps } from '@/components/base/card/card';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Progress } from '@/components/base/progress/progress';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import { cx } from '@/utils/cx';

export type OnboardingTask = {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
  isDisabled?: boolean;
  action?: { label: string; onPress: () => void; isLoading?: boolean; variant?: ButtonProps['variant'] };
};
export type OnboardingChecklistProps = {
  items: OnboardingTask[];
  title?: string;
  description?: string;
  completedKeys?: string[];
  defaultCompletedKeys?: string[];
  onCompletedChange?: (keys: string[]) => void;
  onComplete?: () => void;
  isReadOnly?: boolean;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  density?: 'normal' | 'compact';
  variant?: 'bordered' | 'soft' | 'raised';
  footer?: ReactNode;
  className?: string;
};

function ChecklistSurface(props: CardProps) {
  const present = useIsPresent();
  return <Card {...props} inert={!present} aria-hidden={!present || undefined}/>;
}

export function OnboardingChecklist({ items, title = 'Set up your workspace', description, completedKeys, defaultCompletedKeys = [], onCompletedChange, onComplete, isReadOnly = false, isExpanded, defaultExpanded = true, onExpandedChange, isOpen, defaultOpen = true, onOpenChange, dismissible = false, onDismiss, density = 'normal', variant = 'bordered', footer, className }: OnboardingChecklistProps) {
  const [internalKeys, setInternalKeys] = useState(defaultCompletedKeys);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const completed = completedKeys ?? internalKeys, expanded = isExpanded ?? internalExpanded, open = isOpen ?? internalOpen;
  const required = items.filter(item => !item.isOptional), done = required.filter(item => completed.includes(item.id)).length;
  const complete = required.length > 0 && done === required.length;
  const wasComplete = useRef(complete), completeCallback = useRef(onComplete);
  completeCallback.current = onComplete;
  const id = useId(), reduced = useReducedMotion();
  useEffect(() => {
    if (complete && !wasComplete.current) completeCallback.current?.();
    wasComplete.current = complete;
  }, [complete]);
  function changeCompleted(key: string, selected: boolean) {
    const item = items.find(item => item.id === key);
    if (isReadOnly || !item || item.isDisabled) return;
    const next = selected ? [...new Set([...completed, key])] : completed.filter(id => id !== key);
    if (completedKeys === undefined) setInternalKeys(next);
    onCompletedChange?.(next);
  }
  function toggleExpanded() {
    if (isExpanded === undefined) setInternalExpanded(!expanded);
    onExpandedChange?.(!expanded);
  }
  function dismiss() {
    if (isOpen === undefined) setInternalOpen(false);
    onOpenChange?.(false);
    onDismiss?.();
  }
  return <AnimatePresence initial={false}>{open && <motion.div className={cx('ui-onboarding-checklist', className)} initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .24, ease: [.2,.75,.25,1] }}>
    <ChecklistSurface variant={variant} padding="none" data-density={density}>
      <CardHeader title={title} description={description} actions={<>{!!items.length && <IconButton icon={RiArrowDownSLine} variant="ghost" size="xs" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`} aria-expanded={expanded} aria-controls={id} onClick={toggleExpanded}/>}{dismissible && <CloseButton size="xs" aria-label={`Dismiss ${title}`} onClick={dismiss}/>}</>}/>
      {!!required.length && <Progress label={title} hideLabel value={done} maxValue={required.length} valueLabel={`${done} of ${required.length} complete`} tone={complete ? 'success' : 'accent'} className="ui-onboarding-checklist__progress"/>}
      {items.length ? <Collapsible id={id} isOpen={expanded}><ol className="ui-onboarding-checklist__list">{items.map((item, index) => <li key={item.id} data-complete={completed.includes(item.id) || undefined}>
        <Checkbox aria-label={item.title} aria-describedby={[item.isOptional && `${id}-${index}-optional`, item.description && `${id}-${index}-description`].filter(Boolean).join(' ') || undefined} isSelected={completed.includes(item.id)} isDisabled={item.isDisabled} isReadOnly={isReadOnly} onChange={selected => changeCompleted(item.id, selected)}><strong>{item.title}</strong>{item.isOptional && <span id={`${id}-${index}-optional`} className="ui-onboarding-checklist__optional">Optional</span>}{item.description && <span id={`${id}-${index}-description`} className="ui-onboarding-checklist__description">{item.description}</span>}</Checkbox>
        {item.action && <Button size="small" variant={item.action.variant ?? 'outline'} disabled={item.isDisabled} isLoading={item.action.isLoading} onClick={item.action.onPress}>{item.action.label}</Button>}
      </li>)}</ol></Collapsible> : <EmptyState size="small" title="No setup tasks" description="Your workspace has no pending setup tasks."/>}
      {footer && <div className="ui-onboarding-checklist__footer">{footer}</div>}
    </ChecklistSurface>
  </motion.div>}</AnimatePresence>;
}
