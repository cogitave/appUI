'use client';

import { useId, useState } from 'react';
import { RiArrowDownSLine, RiArrowRightLine } from '@remixicon/react';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Meter, type MeterProps } from '@/components/base/meter/meter';
import { cx } from '@/utils/cx';

type UsageTone = NonNullable<MeterProps['tone']>;
export type AgentLimit = { id: string; label: string; used: number; maximum: number; resetLabel?: string; members?: { name: string; used: number }[]; tone?: UsageTone };
export type AgentLimitsCardProps = {
  contextUsed: number;
  contextMaximum: number;
  buckets?: { label: string; amount: number; color: string }[];
  limits: AgentLimit[];
  contextLabel?: string;
  limitsLabel?: string;
  density?: 'normal' | 'compact';
  variant?: 'soft' | 'bordered';
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  defaultOpenLimit?: string | null;
  openLimit?: string | null;
  onOpenLimitChange?: (id: string | null) => void;
  formatValue?: (value: number) => string;
  onPlanClick?: () => void;
  className?: string;
};
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const formatCompact = (value: number) => compactFormatter.format(value);
const finiteAmount = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const percentage = (used: number, maximum: number) => maximum > 0 && Number.isFinite(maximum) ? Math.min(100, finiteAmount(used) / maximum * 100) : 0;
const toneFor = (value: number): UsageTone => value >= 95 ? 'danger' : value >= 80 ? 'warning' : 'accent';

export function AgentLimitsCard({ contextUsed, contextMaximum, buckets = [], limits, contextLabel = 'Context window', limitsLabel = 'Plan usage limits', density = 'normal', variant = 'soft', defaultExpanded = false, isExpanded, onExpandedChange, defaultOpenLimit = null, openLimit, onOpenLimitChange, formatValue = formatCompact, onPlanClick, className }: AgentLimitsCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [internalLimit, setInternalLimit] = useState<string | null>(defaultOpenLimit);
  const expanded = isExpanded ?? internalExpanded;
  const activeLimit = openLimit === undefined ? internalLimit : openLimit;
  const id = useId(), detailsId = `${id}-context`;
  const used = finiteAmount(contextUsed), maximum = finiteAmount(contextMaximum);
  const contextPercent = percentage(used, maximum);
  function toggleExpanded() {
    if (isExpanded === undefined) setInternalExpanded(!expanded);
    onExpandedChange?.(!expanded);
  }
  function toggleLimit(limit: string) {
    const next = activeLimit === limit ? null : limit;
    if (openLimit === undefined) setInternalLimit(next);
    onOpenLimitChange?.(next);
  }
  return <div className={cx('ui-agent-limits', className)} data-density={density} data-variant={variant}>
    <button type="button" className="ui-agent-limits__summary" aria-expanded={expanded} aria-controls={detailsId} onClick={toggleExpanded}>
      <span>{contextLabel}</span><strong>{formatValue(used)} / {maximum > 0 ? formatValue(maximum) : '—'}{maximum > 0 && ` (${Math.round(contextPercent)}%)`}</strong><RiArrowDownSLine size={16} aria-hidden/>
    </button>
    <Meter label={`${contextLabel} usage`} hideLabel showValue={false} value={Math.min(used, maximum)} maxValue={maximum || 1} valueLabel={maximum > 0 ? `${formatValue(used)} of ${formatValue(maximum)} used` : 'Limit not configured'} tone={toneFor(contextPercent)} className="ui-agent-limits__segments" segments={buckets.map((bucket, index) => ({ id: `${index}:${bucket.label}`, label: bucket.label, value: bucket.amount, color: bucket.color }))}/>
    {!!limits.length && <div className="ui-agent-limits__body"><div className="ui-agent-limits__heading"><span>{limitsLabel}</span>{onPlanClick && <IconButton icon={RiArrowRightLine} size="xs" variant="ghost" aria-label="View plan" onClick={onPlanClick}/>}</div>
      {limits.map((limit, index) => {
        const limitMaximum = finiteAmount(limit.maximum), percent = percentage(limit.used, limitMaximum), hasMembers = Boolean(limit.members?.length), detailId = `${id}-limit-${index}`;
        const heading = <><strong>{limit.label}</strong>{limit.resetLabel && <span>{limit.resetLabel}</span>}<b>{limitMaximum > 0 ? `${Math.round(percent)}%` : '—'}</b>{hasMembers && <RiArrowDownSLine size={14} aria-hidden/>}</>;
        return <div className="ui-agent-limits__limit" key={limit.id}>
          {hasMembers ? <button type="button" className="ui-agent-limits__limit-head" aria-expanded={activeLimit === limit.id} aria-controls={detailId} onClick={() => toggleLimit(limit.id)}>{heading}</button> : <div className="ui-agent-limits__limit-head">{heading}</div>}
          <Meter label={limit.label} value={finiteAmount(limit.used)} maxValue={limitMaximum || 1} valueLabel={limitMaximum > 0 ? `${formatValue(finiteAmount(limit.used))} of ${formatValue(limitMaximum)} used` : 'Limit not configured'} hideLabel showValue={false} size="small" tone={limit.tone ?? toneFor(percent)} className="ui-agent-limits__bar"/>
          {hasMembers && <Collapsible isOpen={activeLimit === limit.id} id={detailId}><div className="ui-agent-limits__members">{limit.members!.map((member, index) => <div className="ui-agent-limits__member" key={`${index}:${member.name}`}><span>{member.name}</span><span>{formatValue(finiteAmount(member.used))}</span></div>)}</div></Collapsible>}
        </div>;
      })}
    </div>}
    <Collapsible isOpen={expanded} id={detailsId}><div className="ui-agent-limits__details"><strong>Usage breakdown</strong>{buckets.map((bucket, index) => <div key={`${index}:${bucket.label}`}><span><i style={{ background: bucket.color }}/>{bucket.label}</span><b>{Math.round(percentage(bucket.amount, maximum))}%</b></div>)}<div><span>Available</span><b>{maximum > 0 ? formatValue(Math.max(0, maximum - used)) : '—'}</b></div></div></Collapsible>
  </div>;
}
