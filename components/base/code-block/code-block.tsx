'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { RiCheckLine, RiFileCopyLine, RiLoader4Line } from '@remixicon/react';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { IconButton } from '@/components/base/buttons/icon-button';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { cx } from '@/utils/cx';

export type CodeExample = { value: string; label: string; code: string; language?: string };
export type CodeBlockProps = {
  code?: string;
  examples?: CodeExample[];
  label?: string;
  language?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onCopy?: (message: string) => void;
  disabled?: boolean;
  lineNumbers?: boolean;
  startLine?: number;
  highlightedLines?: number[];
  wrap?: boolean;
  maxHeight?: number | string;
  /** Fill a flex parent's remaining height instead of measuring natural height. */
  fill?: boolean;
  density?: 'normal' | 'compact';
  variant?: 'soft' | 'bordered' | 'plain';
  /** Hide the header/actions when the consuming toolbar already provides them. */
  showHeader?: boolean;
  showCopy?: boolean;
  headerAction?: ReactNode;
  /** Supply a highlighter without changing the source copied to the clipboard. */
  renderLine?: (line: string, lineNumber: number) => ReactNode;
  contentKey?: string;
  className?: string;
};

function CodeContent({ source, lineNumbers, startLine, highlightedLines, renderLine }: Pick<CodeBlockProps, 'lineNumbers' | 'highlightedLines' | 'renderLine'> & { source: string; startLine: number }) {
  const present = useIsPresent();
  return <pre className="ui-code-block__source" dir="ltr" inert={!present} aria-hidden={!present || undefined}><code>{source.split('\n').map((line, index) => {
    const number = startLine + index;
    return <span className="ui-code-block__line" key={index} data-highlighted={highlightedLines?.includes(number) || undefined}>
      {lineNumbers && <span className="ui-code-block__number" aria-hidden>{number}</span>}
      <span className="ui-code-block__text">{renderLine ? renderLine(line, number) : line || ' '}</span>
    </span>;
  })}</code></pre>;
}

export function CodeBlock({ code, examples = [], label = 'Code', language, value, defaultValue, onValueChange, onCopy, disabled = false, lineNumbers = false, startLine = 1, highlightedLines, wrap = false, maxHeight, fill = false, density = 'normal', variant = 'soft', showHeader = true, showCopy = true, headerAction, renderLine, contentKey, className }: CodeBlockProps) {
  const [internal, setInternal] = useState(defaultValue ?? examples[0]?.value ?? '');
  const [copied, setCopied] = useState(false), [status, setStatus] = useState(''), [pending, setPending] = useState(false);
  const example = examples.find(item => item.value === (value ?? internal)) ?? examples[0];
  const source = code ?? example?.code ?? '';
  const identity = `${label}:${contentKey ?? (code === undefined ? example?.value : '') ?? ''}:${source}`;
  const currentIdentity = useRef(identity), request = useRef(0), resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    currentIdentity.current = identity;
    request.current += 1;
    clearTimeout(resetTimer.current);
    setCopied(false); setStatus(''); setPending(false);
    return () => { request.current += 1; clearTimeout(resetTimer.current); };
  }, [identity]);
  async function copy() {
    if (disabled || pending || !source) return;
    const sequence = ++request.current, capturedIdentity = identity;
    clearTimeout(resetTimer.current); setPending(true); setCopied(false); setStatus(`Copying ${label.toLowerCase()}…`);
    try {
      await navigator.clipboard.writeText(source);
      if (sequence !== request.current || capturedIdentity !== currentIdentity.current) return;
      setCopied(true); setStatus(`${label} copied.`); onCopy?.(`${label} copied.`);
      resetTimer.current = setTimeout(() => { setCopied(false); setStatus(''); }, 2200);
    } catch {
      if (sequence === request.current && capturedIdentity === currentIdentity.current) setStatus('Could not copy. Select the code to copy it manually.');
    } finally {
      if (sequence === request.current && capturedIdentity === currentIdentity.current) setPending(false);
    }
  }
  const count = source.split('\n').length;
  const firstLine = Number.isFinite(startLine) ? Math.min(Number.MAX_SAFE_INTEGER - count, Math.max(1, Math.trunc(startLine))) : 1;
  return <div className={cx('ui-code-block', className)} data-density={density} data-variant={variant} data-wrap={wrap || undefined} data-fill={fill || undefined} aria-busy={pending || undefined} style={{ '--code-max-height': typeof maxHeight === 'number' ? Number.isFinite(maxHeight) ? `${Math.max(0, maxHeight)}px` : undefined : maxHeight, '--code-number-width': `${Math.max(2, String(firstLine + count - 1).length) + 2}ch` } as CSSProperties}>
    {showHeader && <header className="ui-code-block__header">
      {code === undefined && examples.length > 1 ? <SegmentedControl aria-label={`${label} format`} options={examples} value={example?.value} onValueChange={next => { if (value === undefined) setInternal(next); onValueChange?.(next); }}/> : <span className="ui-code-block__label" title={label}>{label}</span>}
      <div className="ui-code-block__actions">{(language ?? example?.language) && <span className="ui-code-block__language">{language ?? example?.language}</span>}{headerAction}
        {showCopy && <Tooltip content={copied ? 'Copied' : pending ? 'Copying code' : 'Copy code'}><IconButton icon={pending ? RiLoader4Line : copied ? RiCheckLine : RiFileCopyLine} iconKey={pending ? 'pending' : copied ? 'copied' : 'copy'} size="xs" variant="ghost" disabled={disabled || !source} isPending={pending} pendingLabel="Copying code" aria-label={`Copy ${label.toLowerCase()}`} onClick={copy}/></Tooltip>}
      </div>
    </header>}
    <AnimatedHeight className="ui-code-block__body"><ScrollArea label={label} orientation="both" className="ui-code-block__scroll" viewportClassName="ui-code-block__viewport">
      <AnimatePresence initial={false} mode="popLayout"><motion.div key={identity} className="ui-code-block__content" initial={reduced ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: reduced ? 0 : .16, ease: [.2,.75,.25,1] }}>
        <CodeContent source={source} lineNumbers={lineNumbers} startLine={firstLine} highlightedLines={highlightedLines} renderLine={renderLine}/>
      </motion.div></AnimatePresence>
    </ScrollArea></AnimatedHeight>
    <span className="sr-only" role="status">{status}</span>
  </div>;
}
