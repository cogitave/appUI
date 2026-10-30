'use client';

import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Meter } from '@/components/base/meter/meter';
import { Slider } from '@/components/base/slider/slider';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { AgentLimitsCard, type AgentLimitsCardProps } from '@/components/blocks/agent-limits/agent-limits-card';
import { SettingsModal } from '@/components/blocks/settings-modal/settings-modal';
import { DocExampleSection as Section } from './doc-example-section';

const buckets = [{ label: 'System', amount: 520000, color: 'var(--chart-blue)' }, { label: 'Messages', amount: 100000, color: 'var(--chart-violet)' }, { label: 'Files', amount: 75000, color: 'var(--chart-pink)' }, { label: 'Tools', amount: 55000, color: 'var(--chart-lime)' }, { label: 'Response', amount: 70000, color: 'var(--chart-teal)' }];
const limits = [{ id: 'five-hour', label: '5-hour limit', used: 38, maximum: 100, resetLabel: 'Resets in 2 hr 46 min', members: [{ name: 'Maya Chen', used: 28 }, { name: 'Noah Garcia', used: 10 }] }, { id: 'weekly', label: 'Weekly · all models', used: 3, maximum: 100, resetLabel: 'Resets Tue 3:00 PM' }, { id: 'pro', label: 'Weekly · Pro', used: 5, maximum: 100, resetLabel: 'Resets Tue 3:00 PM' }];
const usage = { contextUsed: 820000, contextMaximum: 1000000, buckets, limits };

function MeterDemo({ segmented = false }: { segmented?: boolean }) {
  const [value, setValue] = useState(64);
  return <div className="docs-usage-demo"><Meter label="Storage used" value={value} maxValue={100} formatOptions={{ style: 'unit', unit: 'gigabyte' }} tone={value >= 95 ? 'danger' : value >= 80 ? 'warning' : 'accent'} segments={segmented ? [{ id: 'files', label: 'Files', value: value * .55, color: 'var(--chart-blue)' }, { id: 'media', label: 'Media', value: value * .3, color: 'var(--chart-violet)' }] : undefined}/><Slider label="Adjust storage" value={value} onChange={setValue} formatValue={value => `${value} GB`}/></div>;
}
export function MeterPreview() { return <div className="docs-usage-preview"><MeterDemo/></div>; }
export function MeterExamples() { return <>
  <Section title="Tones and sizes" description="Semantic tones and three track sizes share the same type and motion roles."><div className="docs-usage-grid"><Meter label="Requests" value={32} size="small"/><Meter label="Seats" value={68} tone="success"/><Meter label="Storage" value={84} tone="warning"/><Meter label="Monthly quota" value={97} tone="danger" size="large"/></div></Section>
  <Section title="Segments" description="Parts follow the same value scale. Unassigned usage keeps the base tone, and every segment remains within the total."><MeterDemo segmented/></Section>
  <Section title="Units and ranges" description="Use the existing internationalized value formatting with units or a non-zero minimum."><div className="docs-usage-grid"><Meter label="Data transfer" value={250} maxValue={500} formatOptions={{ style: 'unit', unit: 'megabyte' }}/><Meter label="Temperature" value={18} minValue={-10} maxValue={40} formatOptions={{ style: 'unit', unit: 'celsius' }}/></div></Section>
  <Section title="Edge values" description="Empty, full and unavailable readings retain finite values and bounded tracks."><div className="docs-usage-grid"><Meter label="Unused capacity" value={0}/><Meter label="Full capacity" value={150}/><Meter label="No reading" value={NaN} maxValue={0} valueLabel="Not available"/><Meter label="Bounded segments" value={60} segments={[{id:'first',label:'First group',value:100,color:'var(--chart-blue)'},{id:'second',label:'Second group',value:50,color:'var(--chart-violet)'}]}/></div></Section>
</>; }

function LimitsDemo({ options = false, live = false, ...props }: Partial<AgentLimitsCardProps> & { options?: boolean; live?: boolean }) {
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');
  const [amount, setAmount] = useState(82);
  const [expanded, setExpanded] = useState(false);
  const [member, setMember] = useState<string | null>(null);
  const [plan, setPlan] = useState(false);
  return <div className="docs-usage-demo">
    {options && <SegmentedControl aria-label="Usage density" value={density} options={[{value:'normal',label:'Normal'},{value:'compact',label:'Compact'}]} onValueChange={value => setDensity(value as typeof density)}/>}
    <AgentLimitsCard {...usage} {...props} density={density} contextUsed={live ? amount * 10000 : props.contextUsed ?? usage.contextUsed} buckets={live ? [] : props.buckets ?? usage.buckets} isExpanded={expanded} onExpandedChange={setExpanded} openLimit={member} onOpenLimitChange={setMember} onPlanClick={() => setPlan(true)}/>
    {live && <Slider label="Context usage" value={amount} onChange={setAmount} formatValue={value => `${value}%`}/>}
    <p className="docs-extended-note" role="status">{plan ? 'Plan details selected.' : member ? 'Member usage expanded.' : expanded ? 'Usage breakdown expanded.' : 'Select a summary to see its detail.'}</p>
  </div>;
}
function BillingDemo() {
  const [open, setOpen] = useState(false);
  return <div className="docs-usage-demo"><Button variant="outline" onClick={() => setOpen(true)}>Open billing usage</Button><SettingsModal isOpen={open} onClose={() => setOpen(false)} initialPage="billing" workspaceName="Studio workspace" usageLimits={{ ...usage, variant: 'bordered' }}/></div>;
}
export function AgentLimitsPreview() { return <LimitsDemo/>; }
export function AgentLimitsExamples() { return <>
  <Section title="Context breakdown" description="The shared Collapsible animates detail height and spacing in normal document flow."><LimitsDemo/></Section>
  <Section title="Member detail" description="Only limits with supplied member detail are interactive. Controlled callbacks retain the selected detail."><LimitsDemo contextUsed={430000} buckets={[]}/></Section>
  <Section title="Density and surfaces" description="Compact density animates padding and spacing. Labels and value formatting also support general product quotas."><LimitsDemo options variant="bordered" contextUsed={64} contextMaximum={100} contextLabel="Storage used" limitsLabel="Workspace quotas" formatValue={value => `${value} GB`} buckets={[]} limits={[{id:'uploads',label:'Monthly uploads',used:84,maximum:100,resetLabel:'Resets in 8 days'},{id:'downloads',label:'Monthly downloads',used:98,maximum:100}]}/></Section>
  <Section title="Live usage" description="Changing data updates the actual meter with a smooth width transition and automatic warning and danger tones."><LimitsDemo live/></Section>
  <Section title="In Settings" description="The same usage card can be supplied to the Settings billing page, inside its native scrolling content."><BillingDemo/></Section>
</>; }
