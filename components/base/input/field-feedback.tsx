'use client';

import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { FieldError, FieldErrorContext, Text } from 'react-aria-components';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';

function ErrorContent({ error }: { error?: string }) {
  const present = useIsPresent();
  const element = useRef<HTMLElement>(null);
  const [snapshot, setSnapshot] = useState(error ?? '');
  useLayoutEffect(() => {
    if (present && element.current) {
      const text = element.current.textContent ?? '';
      setSnapshot(previous => previous === text ? previous : text);
    }
  });
  return <div className="ui-field-feedback__error" inert={!present} aria-hidden={!present || undefined}>
    {present ? <FieldError ref={element} className="ui-input-field__message">{error}</FieldError> : <span className="ui-input-field__message">{snapshot}</span>}
  </div>;
}

/** Keep native validation messages associated while animating their actual layout. */
export function FieldFeedback({ hint, error }: { hint?: string; error?: string }) {
  const validation = useContext(FieldErrorContext);
  const reduced = useReducedMotion();
  const invalid = validation?.isInvalid ?? Boolean(error);
  const showHint = Boolean(hint && !error);
  return <div className="ui-field-feedback" data-content={invalid || showHint || undefined}>
    <AnimatedHeight>
      {showHint && <Text slot="description" className="ui-input-field__message">{hint}</Text>}
      <AnimatePresence initial={false} mode="popLayout">
        {invalid && <motion.div key="error" initial={{ opacity: 0, y: reduced ? 0 : 2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -2 }} transition={{ duration: reduced ? 0 : .16, ease: [.2, .75, .25, 1] }}>
          <ErrorContent error={error}/>
        </motion.div>}
      </AnimatePresence>
    </AnimatedHeight>
  </div>;
}
