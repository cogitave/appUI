'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RiArrowDownSLine, RiLightbulbLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { AgentThinking } from '@/components/blocks/agent-thinking/agent-thinking';
import { SocialMark, type SocialProvider } from '@/components/base/social-button/social-button';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type SearchSource = {
  id: string;
  title: string;
  url?: string;
  href?: string;
  domain?: string;
  description?: string;
  brand?: SocialProvider;
  icon?: IconComponent;
};

export type SearchStep = {
  id: string;
  label?: string;
  query?: string;
  meta?: string;
  brand?: SocialProvider;
  icon?: IconComponent;
  heading?: boolean;
  dwell?: number;
  status?: 'searching' | 'complete';
  sources?: SearchSource[];
};

export type WebSearchProps = {
  steps: SearchStep[];
  title?: string;
  startDelay?: number;
  stepInterval?: number;
  /** Kept for existing consumers. Prefer stepInterval. */
  streamIntervalMs?: number;
  /** Number of visible rows. A step with sources counts as two rows. */
  revealed?: number;
  working?: string | false;
  onComplete?: () => void;
  onRunAgain?: () => void;
  className?: string;
};

const revealFrom = { opacity: 0, height: 0, y: 6, filter: 'blur(4px)' };
const revealTo = { opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' };
const revealTransition = { duration: 0.34, ease: [0.2, 0.75, 0.25, 1] as const };

function sourceDomain(source: SearchSource) {
  if (source.domain) return source.domain;
  try { return new URL(source.href ?? source.url ?? '').hostname; } catch { return ''; }
}

function sourceBrand(source: SearchSource): SocialProvider | undefined {
  if (source.brand) return source.brand;
  const domain = sourceDomain(source);
  if (domain.includes('reddit.')) return 'reddit';
  if (domain.includes('linkedin.')) return 'linkedin';
  if (domain.includes('github.')) return 'github';
  if (domain.includes('figma.')) return 'figma';
  if (domain.includes('notion.')) return 'notion';
  if (domain.includes('google.')) return 'google';
  if (domain.includes('x.com') || domain.includes('twitter.')) return 'x';
  return undefined;
}

function SourceMark({ source }: { source: SearchSource }) {
  const Icon = source.icon;
  return <span className="ui-web-search__mark" title={`${source.title}${sourceDomain(source) ? ` · ${sourceDomain(source)}` : ''}`}>
    {Icon ? <Icon size={13} aria-hidden /> : <SocialMark provider={sourceBrand(source)} size={13} />}
  </span>;
}

function StepIcon({ step }: { step: SearchStep }) {
  if (step.icon) { const Icon = step.icon; return <Icon size={16} aria-hidden />; }
  if (step.brand) return <SocialMark provider={step.brand} size={16} />;
  return step.heading ? <RiSearchLine size={16} aria-hidden /> : <RiLightbulbLine size={16} aria-hidden />;
}

export function WebSearch({
  steps,
  title,
  startDelay = 100,
  stepInterval,
  streamIntervalMs,
  revealed,
  working = 'Working',
  onComplete,
  onRunAgain,
  className,
}: WebSearchProps) {
  const reducedMotion = useReducedMotion();
  const interval = stepInterval ?? streamIntervalMs ?? 900;
  const heading = useMemo<SearchStep>(() => steps[0]?.heading ? steps[0] : { id: 'search-heading', label: title ?? `Ran ${steps.filter(step => step.query || step.brand || step.sources?.length).length} searches`, heading: true, dwell: interval }, [steps, title, interval]);
  const trail = useMemo(() => steps[0]?.heading ? steps.slice(1) : steps, [steps]);
  const rows = useMemo(() => [
    { id: heading.id, after: heading.dwell ?? interval },
    ...trail.flatMap(step => [
      { id: step.id, after: step.sources?.length ? 520 : step.dwell ?? interval },
      ...(step.sources?.length ? [{ id: `${step.id}-sources`, after: step.dwell ?? interval }] : []),
    ]),
  ], [heading.id, heading.dwell, interval, trail]);
  const totalUnits = rows.length;
  const [internalRevealed, setInternalRevealed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [openSources, setOpenSources] = useState<string[]>([]);
  const completeRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (revealed !== undefined) {
      setFinished(revealed >= totalUnits);
      return;
    }
    if (reducedMotion) {
      setInternalRevealed(totalUnits);
      setFinished(true);
      return;
    }
    setInternalRevealed(0);
    setFinished(false);
    let timer: number;
    let shown = 0;
    const showNext = () => {
      shown += 1;
      setInternalRevealed(shown);
      if (shown >= totalUnits) {
        timer = window.setTimeout(() => setFinished(true), Math.min(rows[shown - 1]?.after ?? interval, 1200));
      } else {
        timer = window.setTimeout(showNext, rows[shown - 1]?.after ?? interval);
      }
    };
    timer = window.setTimeout(showNext, Math.max(0, startDelay));
    return () => window.clearTimeout(timer);
  }, [interval, reducedMotion, revealed, rows, startDelay, totalUnits]);

  const visibleUnits = Math.max(0, Math.min(totalUnits, revealed ?? internalRevealed));
  const isFinished = revealed !== undefined ? visibleUnits >= totalUnits : finished;
  useEffect(() => {
    if (!isFinished) { completeRef.current = false; return; }
    if (completeRef.current) return;
    completeRef.current = true;
    onCompleteRef.current?.();
  }, [isFinished]);

  let cursor = 1;
  return <div className={cx('ui-web-search', className)} role="group" aria-label={title ?? heading.label ?? 'Web search activity'}>
    <AnimatePresence initial={false}>
      {visibleUnits > 0 && <motion.div className="ui-web-search__heading" key={heading.id} initial={reducedMotion ? false : revealFrom} animate={revealTo} exit={revealFrom} transition={reducedMotion ? { duration: 0 } : revealTransition}>
        <StepIcon step={heading} />
        <span>{title ?? heading.label}</span>
      </motion.div>}
    </AnimatePresence>

    <ol className="ui-web-search__steps" aria-live="polite">
      <AnimatePresence initial={false}>
        {trail.map(step => {
          const stepUnit = ++cursor;
          const sourceUnit = step.sources?.length ? ++cursor : 0;
          if (visibleUnits < stepUnit) return null;
          const sourcesVisible = sourceUnit > 0 && visibleUnits >= sourceUnit;
          const isActive = !isFinished && visibleUnits === stepUnit;
          const sourceOpen = openSources.includes(step.id);
          return <motion.li className="ui-web-search__step" key={step.id} initial={reducedMotion ? false : revealFrom} animate={revealTo} exit={revealFrom} transition={reducedMotion ? { duration: 0 } : revealTransition}>
            <div className="ui-web-search__row" data-active={isActive || step.status === 'searching' || undefined}>
              <span className="ui-web-search__icon"><StepIcon step={step} /></span>
              <span className="ui-web-search__label">{step.label ?? step.query}{step.label && step.query && <code>{step.query}</code>}</span>
              {(step.meta || step.sources?.length) && <span className="ui-web-search__meta">{step.meta ?? `${step.sources?.length} results`}</span>}
            </div>
            <AnimatePresence initial={false}>
              {sourcesVisible && <motion.div className="ui-web-search__source-branch" initial={reducedMotion ? false : revealFrom} animate={revealTo} exit={revealFrom} transition={reducedMotion ? { duration: 0 } : revealTransition}>
                <button type="button" className="ui-web-search__source-trigger" aria-expanded={sourceOpen} aria-label={`Sources for ${step.label ?? step.query}`} onClick={() => setOpenSources(current => current.includes(step.id) ? current.filter(id => id !== step.id) : [...current, step.id])}>
                  <span>Sources</span>
                  <span className="ui-web-search__marks" aria-hidden>
                    {step.sources?.slice(0, 6).map(source => <SourceMark key={source.id} source={source} />)}
                    {(step.sources?.length ?? 0) > 6 && <span className="ui-web-search__mark ui-web-search__mark--extra">+{(step.sources?.length ?? 0) - 6}</span>}
                  </span>
                  <RiArrowDownSLine size={16} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {sourceOpen && <motion.ul className="ui-web-search__source-links" initial={reducedMotion ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.27, ease: [0.2, 0.75, 0.25, 1] }}>
                    {step.sources?.map(source => {
                      const content = <><SourceMark source={source} /><span className="ui-web-search__source-title">{source.title}</span><small>{sourceDomain(source)}</small></>;
                      const href = source.href ?? source.url;
                      return <li key={source.id}>{href ? <a href={href} target="_blank" rel="noopener noreferrer" title={source.description}>{content}</a> : <span className="ui-web-search__source-static" title={source.description}>{content}</span>}</li>;
                    })}
                  </motion.ul>}
                </AnimatePresence>
              </motion.div>}
            </AnimatePresence>
          </motion.li>;
        })}
      </AnimatePresence>
    </ol>

    <AnimatePresence initial={false}>
      {!isFinished && working !== false && <motion.div key="working" className="ui-web-search__tail" initial={reducedMotion ? false : revealFrom} animate={revealTo} exit={revealFrom} transition={reducedMotion ? { duration: 0 } : revealTransition}><AgentThinking variant="stars" label={working} /></motion.div>}
      {isFinished && onRunAgain && <motion.button key="restart" type="button" className="ui-web-search__restart" onClick={onRunAgain} initial={reducedMotion ? false : revealFrom} animate={revealTo} exit={revealFrom} transition={reducedMotion ? { duration: 0 } : revealTransition}><RiRefreshLine size={16} aria-hidden />Run again</motion.button>}
    </AnimatePresence>
  </div>;
}
