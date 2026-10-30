'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {Select} from '@/components/base/select/select';
import { AgentCreator, type AgentIdentity } from '@/components/blocks/agent-creator/agent-creator';
import { AgentLimitsPreview, AgentLimitsExamples } from './usage-previews';
import { AgentProgress } from '@/components/blocks/agent-progress/agent-progress';
import { AgentThinking, type AgentThinkingProps } from '@/components/blocks/agent-thinking/agent-thinking';
import { Composer } from '@/components/blocks/composer/composer';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { BlockMoreExamples, BlockMorePreview } from './block-more-previews';

type Props = { slug: DocSlug; onNotify: (message: string) => void };
const identity: AgentIdentity = { name: 'Cloud engineer', label: 'Cloud', color: '#f3bca5', shape: 'cloud', emotion: 'Thinking', description: 'Helps with server architecture, cloud infrastructure, deployments, and reliable services.', voice: 'System voice', language: 'Auto-detect', notifications: true };
const stepLabels = ['Read project files', 'Update light mode tokens', 'Implement dark mode tokens', 'Register the theme toggle', 'Run lint and production build'];
const thinkingVariants=['wave','spin','stars','infinity','orb'] as const;
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p>{children}</section>; }


export function BlockPreview({ slug, onNotify }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [variant, setVariant] = useState<NonNullable<AgentThinkingProps['variant']>>('wave');
  useEffect(() => { if (slug !== 'agent-progress') return; const start = window.setInterval(() => setVisibleSteps(value => Math.min(value + 1, stepLabels.length)), 430); const advance = window.setInterval(() => setStepIndex(value => Math.min(value + 1, stepLabels.length)), 2400); return () => { window.clearInterval(start); window.clearInterval(advance); }; }, [slug]);
  switch (slug) {
    case 'agent-creator': return <div className="docs-preview__block"><AgentCreator defaultValue={identity} /></div>;
    case 'agent-limits-card': return <AgentLimitsPreview/>;
    case 'agent-progress': return <div className="docs-preview__progress"><AgentProgress revealedCount={visibleSteps} steps={stepLabels.map((label,index) => ({ id: String(index), label, status: index < stepIndex ? 'complete' : index === stepIndex ? 'active' : 'pending' }))} onStepClick={id => setStepIndex(Number(id))} /></div>;
    case 'agent-thinking': return <div className="docs-preview__thinking"><SegmentedControl aria-label="Thinking animation" options={thinkingVariants.map(item => ({ value: item, label: item[0].toUpperCase() + item.slice(1) }))} value={variant} onValueChange={value => setVariant(value as typeof variant)} /><div className="docs-preview__thinking-chat"><p>Redesign the workspace and tighten the welcome message.</p><AgentThinking variant={variant} /><Composer models={[{id:'fable',label:'Fable 5'},{id:'mini',label:'GPT-5.6 Mini'}]} branch="Main" project="project-sea" agentLabel="Agent" contextPercent={57} onVoice={() => onNotify('Voice input selected.')} onSend={message => onNotify(`Sent: ${message}`)} /></div></div>;
    default: return <BlockMorePreview slug={slug} onNotify={onNotify} />;
  }
}

export function BlockExamples({ slug, onNotify }: Props) {
  const [saved, setSaved] = useState<AgentIdentity | null>(null);
  switch (slug) {
    case 'agent-creator': return <>
      <Section title="Identity options" description="Shape, color, and fields belong to one controlled or uncontrolled value."><div className="docs-example__surface docs-example__block"><AgentCreator defaultValue={identity} onChange={setSaved} />{saved && <span className="docs-example__date-result">{saved.label} · {saved.voice} · {saved.language}</span>}</div></Section>
      <Section title="Save action" description="The host application decides how to persist an agent identity."><div className="docs-example__surface docs-example__block"><AgentCreator defaultValue={{ ...identity, name: 'Research guide', label: 'Research', shape: 'spark', color: '#7959d9' }} onSave={agent => onNotify(`${agent.name} saved.`)} /></div></Section>
    </>;
    case 'agent-limits-card': return <AgentLimitsExamples/>;
    case 'agent-progress': return <>
      <Section title="Custom steps" description="Steps and their status come from the agent workflow, not from the visual component."><div className="docs-example__surface"><AgentProgress steps={[{ id: 'fetch', label: 'Fetch project files', status: 'complete', duration: '0.8s' }, { id: 'plan', label: 'Plan the update', status: 'active' }, { id: 'write', label: 'Write changes', status: 'pending' }]} onStepClick={id => onNotify(`${id} selected.`)} /></div></Section>
      <Section title="Collapsed state" description="A compact header keeps the remaining count visible while the list is hidden."><div className="docs-example__surface"><AgentProgress steps={stepLabels.map((label,index) => ({ id: String(index), label, status: index === 0 ? 'active' as const : 'pending' as const }))} defaultCollapsed /></div></Section>
    </>;
    case 'agent-thinking': return <>
      <Section title="Variants" description="Choose a motion style that suits the context without changing the status API."><div className="docs-example__surface docs-example__thinking-variants">{thinkingVariants.map(variant => <AgentThinking key={variant} variant={variant} label={variant[0].toUpperCase() + variant.slice(1)} />)}</div></Section>
      <Section title="Label and timer" description="The elapsed time updates while active and stops when the work ends."><div className="docs-example__surface"><AgentThinking variant="stars" label="Reviewing files" /></div></Section>
    </>;
    default: return <BlockMoreExamples slug={slug} onNotify={onNotify} />;
  }
}
