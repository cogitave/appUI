'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { RiCheckLine } from '@remixicon/react';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Stepper } from '@/components/base/stepper/stepper';
import { cx } from '@/utils/cx';

export type Question = {
  id: string;
  prompt: string;
  type: 'single' | 'multiple';
  options: { id: string; label: string; description?: string }[];
  allowOther?: boolean;
  stepLabel?: string;
};

export type QuestionnaireProps = {
  questions: Question[];
  value?: Record<string, string[]>;
  defaultValue?: Record<string, string[]>;
  onChange?: (answers: Record<string, string[]>) => void;
  onComplete?: (answers: Record<string, string[]>, otherAnswers: Record<string, string>) => void;
  onClose?: () => void;
  advanceDelay?: number;
  className?: string;
};

const slideVariants = {
  enter: (travel: number) => ({ opacity: 0, x: travel * 18, filter: 'blur(3px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (travel: number) => ({ opacity: 0, x: travel * -18, filter: 'blur(3px)' }),
};

function QuestionPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present} aria-hidden={!present || undefined}>{children}</div>;
}

export function Questionnaire({ questions, value, defaultValue = {}, onChange, onComplete, onClose, advanceDelay = 180, className }: QuestionnaireProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [otherAnswers, setOtherAnswers] = useState<Record<string, string>>({});
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const reducedMotion = useReducedMotion();
  const answers = value ?? internal;
  const question = questions[index];
  const root = useRef<HTMLDivElement>(null), focusQuestion = useRef(false);
  useLayoutEffect(() => {
    if (!focusQuestion.current) return;
    focusQuestion.current = false;
    [...(root.current?.querySelectorAll<HTMLElement>('.ui-questionnaire__question h2') ?? [])].find(title => !title.closest('[inert]'))?.focus({ preventScroll: true });
  }, [question?.id]);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);
  if (!question) return null;

  function update(next: Record<string, string[]>) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  function goTo(step: number, moveFocus = false) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (step < 0 || step >= questions.length || step === index) return;
    focusQuestion.current = moveFocus;
    setDirection(step > index ? 1 : -1);
    setIndex(step);
  }

  function toggle(option: string) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    const current = answers[question.id] ?? [];
    const selected = current.includes(option);
    const next = question.type === 'single'
      ? [option]
      : selected ? current.filter(id => id !== option) : [...current, option];
    update({ ...answers, [question.id]: next });
    if (question.type === 'single' && option !== 'other' && index < questions.length - 1) {
      advanceTimer.current = setTimeout(() => goTo(index + 1, true), advanceDelay);
    }
  }

  function changeOther(text: string) {
    setOtherAnswers(current => ({ ...current, [question.id]: text }));
    const current = answers[question.id] ?? [];
    if (text && !current.includes('other')) {
      update({ ...answers, [question.id]: question.type === 'single' ? ['other'] : [...current, 'other'] });
    }
  }

  function next() {
    if (index < questions.length - 1) goTo(index + 1, true);
    else onComplete?.(answers, otherAnswers);
  }

  const selected = answers[question.id] ?? [];
  return <div ref={root} className={cx('ui-questionnaire', className)} role="group" aria-label="Questionnaire">
    {onClose && <CloseButton className="ui-questionnaire__close" size="xs" aria-label="Dismiss" onClick={onClose}/>}
    <AnimatedHeight><div id={`${id}-questions`} role="region" aria-label={question.prompt}><AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div key={question.id} className="ui-questionnaire__question" custom={direction} variants={slideVariants} initial={reducedMotion ? false : 'enter'} animate="center" exit={reducedMotion ? undefined : 'exit'} transition={{ duration: reducedMotion ? 0 : .22, ease: [0.2, .75, .25, 1] }}>
        <QuestionPresence>
        <h2 tabIndex={-1}>{question.prompt}</h2>
        <div className="ui-questionnaire__options" role="group" aria-label={question.prompt}>
          {question.options.map(option => <label key={option.id} data-selected={selected.includes(option.id) || undefined}>
            <input className="ui-questionnaire__choice" type={question.type === 'single' ? 'radio' : 'checkbox'} name={`${id}-${question.id}`} value={option.id} checked={selected.includes(option.id)} onChange={() => toggle(option.id)} />
            <span className="ui-questionnaire__option-copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
            <span className="ui-questionnaire__check" aria-hidden><RiCheckLine size={12} /></span>
          </label>)}
          {question.allowOther && <div className="ui-questionnaire__other-row" data-selected={selected.includes('other') || undefined}>
            <div className="ui-questionnaire__option-copy"><strong>Other</strong><input className="ui-questionnaire__other" aria-label="Other answer" value={otherAnswers[question.id] ?? ''} placeholder="Enter your custom answer here" onFocus={() => { if (!selected.includes('other')) toggle('other'); }} onChange={event => changeOther(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); next(); } }} /></div>
            <label className="ui-questionnaire__other-check" aria-label="Select Other"><input className="ui-questionnaire__choice" type={question.type === 'single' ? 'radio' : 'checkbox'} name={`${id}-${question.id}`} value="other" checked={selected.includes('other')} onChange={() => toggle('other')} /><span className="ui-questionnaire__check" aria-hidden><RiCheckLine size={12} /></span></label>
          </div>}
        </div>
        </QuestionPresence>
      </motion.div>
    </AnimatePresence></div></AnimatedHeight>
    <footer><Stepper className="ui-questionnaire__steps" aria-label="Steps" variant="labels" selectedKey={question.id} onSelectionChange={key => goTo(questions.findIndex(item => item.id === key))} steps={questions.map((item, step) => ({ id: item.id, label: item.stepLabel ?? `Step ${step + 1}`, controls: `${id}-questions`, status: (answers[item.id] ?? []).some(answer => answer === 'other' ? Boolean(otherAnswers[item.id]?.trim()) : item.options.some(option => option.id === answer)) ? 'complete' : 'pending' }))}/><Button size="small" variant="secondary" disabled={index === 0} onClick={() => goTo(index - 1, true)}>Previous</Button><Button size="small" variant="solid" className="ui-questionnaire__next" onClick={next}>{index === questions.length - 1 ? 'Done' : 'Next'}</Button></footer>
  </div>;
}
