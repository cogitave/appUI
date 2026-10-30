'use client';

import { useEffect, useState } from 'react';
import { cx } from '@/utils/cx';

export type AgentThinkingProps = {
  variant?: 'wave' | 'spin' | 'stars' | 'infinity' | 'orb';
  label?: string;
  active?: boolean;
  showTimer?: boolean;
  shimmer?: boolean;
  tone?: 'subtle' | 'accent';
  className?: string;
};

const orbitOrder = [0, 1, 2, 7, -1, 3, 6, 5, 4];

function ThinkingIndicator({ variant }: { variant: NonNullable<AgentThinkingProps['variant']> }) {
  if (variant === 'wave' || variant === 'spin') {
    return <span className="ui-agent-thinking__dots">{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ animationDelay: variant === 'wave' ? `${(Math.floor(index / 3) + index % 3) * 95}ms` : `${orbitOrder[index] * -165}ms` }} />)}</span>;
  }
  if (variant === 'stars') return <span className="ui-agent-thinking__stars">{Array.from({ length: 5 }, (_, index) => <i key={index} style={{ animationDelay: `${index * -320}ms` }} />)}</span>;
  if (variant === 'infinity') return <svg className="ui-agent-thinking__infinity" viewBox="0 0 30 18" fill="none" aria-hidden="true"><path className="ui-agent-thinking__infinity-track" d="M15 9C10 1 1 1 1 9s9 8 14 0c5-8 14-8 14 0s-9 8-14 0" pathLength="100" /><path className="ui-agent-thinking__infinity-head" d="M15 9C10 1 1 1 1 9s9 8 14 0c5-8 14-8 14 0s-9 8-14 0" pathLength="100" /></svg>;
  return <span className="ui-agent-thinking__orb"><i /><i /><i /></span>;
}

export function AgentThinking({ variant = 'wave', label = 'Thinking', active = true, showTimer = true, shimmer = true, tone = 'subtle', className }: AgentThinkingProps) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active || !showTimer) return;
    const start = performance.now();
    const timer = window.setInterval(() => setElapsed((performance.now() - start) / 1000), 100);
    return () => window.clearInterval(timer);
  }, [active, showTimer]);

  return <div className={cx('ui-agent-thinking', className)} data-variant={variant} data-active={active} data-tone={tone} role="status" aria-live="polite"><span className="ui-agent-thinking__indicator" aria-hidden="true"><ThinkingIndicator variant={variant} /></span><span className={cx('ui-agent-thinking__label', shimmer && active && 'ui-agent-thinking__label--shimmer')}>{active ? label : 'Ready'}</span>{active && showTimer && <time aria-hidden="true">{elapsed.toFixed(1)}s</time>}</div>;
}
