'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useId, useState } from 'react';
import { RiAddLine, RiArrowDownSLine, RiCheckLine, RiFolderLine, RiInboxLine, RiSearchLine, RiSettings4Line, RiTeamLine } from '@remixicon/react';
import { Accordion, type AccordionItem } from '@/components/base/accordion/accordion';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { ButtonLink } from '@/components/base/buttons/button-link';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import { Input } from '@/components/base/input/input';
import { Progress } from '@/components/base/progress/progress';
import { Skeleton, SkeletonGroup } from '@/components/base/skeleton/skeleton';
import {Select} from '@/components/base/select/select';
import { Spinner } from '@/components/base/spinner/spinner';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { DocExampleSection as Section } from './doc-example-section';
import type { ExtendedBaseSlug } from './extended-base-pages';

const sections: AccordionItem[] = [
  { id: 'overview', title: 'What comes with the library?', leading: <RiFolderLine size={18}/>, content: <p>Editable React source, shared light and dark themes, accessible controls and motion that follows your preference.</p> },
  { id: 'projects', title: 'Can I use it across my projects?', leading: <RiTeamLine size={18}/>, content: <p>Compose base controls into blocks, then reuse those blocks throughout dashboards, shops, internal tools and AI interfaces.</p> },
  { id: 'customize', title: 'How do I customize it?', leading: <RiSettings4Line size={18}/>, content: <p>Start with the semantic color and type roles. Choose component variants and edit the source where your product needs something specific.</p> },
];

export function ButtonLoadingExample({ leading = false, iconOnly = false }: { leading?: boolean; iconOnly?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [requests,setRequests] = useState(0);
  function start() {setRequests(count=>count+1);setLoading(true);}
  useEffect(() => { if (!loading) return; const timer = window.setTimeout(() => setLoading(false), 1600); return () => window.clearTimeout(timer); }, [loading]);
  if (iconOnly) return <Button variant="secondary" iconOnly leadingIcon={RiCheckLine} aria-label="Confirm task" isLoading={loading} data-requests={requests} onClick={start}/>;
  if (leading) return <Button variant="secondary" leadingIcon={RiFolderLine} isLoading={loading} data-requests={requests} onClick={start}>Sync project</Button>;
  return <Button variant="solid" isLoading={loading} loadingLabel="Saving" data-requests={requests} onClick={start}>Save changes</Button>;
}

export function PendingSubmitExample() {
  const [draft,setDraft] = useState('Studio launch'),[pending,setPending] = useState<string|null>(null),[saved,setSaved] = useState(''),[requests,setRequests] = useState(0);
  useEffect(() => { if (pending === null) return; const timer = window.setTimeout(() => {setSaved(pending);setPending(null);},1600);return ()=>window.clearTimeout(timer); },[pending]);
  return <form className="docs-pending-form" data-demo="pending-submit" data-requests={requests} onSubmit={event=>{event.preventDefault();if(pending!==null || !draft.trim())return;setPending(draft.trim());setRequests(count=>count+1);}}>
    <Input label="Workspace name" name="workspace" value={draft} onChange={setDraft} isRequired/>
    <Button type="submit" isLoading={pending!==null} loadingLabel="Saving workspace" disabled={!draft.trim() && pending===null}>Save workspace</Button>
    <AnimatedHeight><p className="docs-extended-note" role="status">{pending!==null ? 'Saving your workspace name…' : saved ? `Saved “${saved}”.` : 'Save the current name in this local example.'}</p></AnimatedHeight>
  </form>;
}

function ProgressDemo() {
  const [value, setValue] = useState(65);
  return <div className="docs-extended-stack"><Progress label="Processing files" value={value}/><div className="docs-extended-actions"><Button size="small" variant="soft" onClick={() => setValue(current => Math.min(100, current + 15))} disabled={value === 100}>Advance progress</Button><Button size="small" variant="ghost" onClick={() => setValue(0)}>Reset</Button></div></div>;
}

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 1800); return () => window.clearTimeout(timer); }, []);
  return <SkeletonGroup label="Loading profile" isLoading={loading} className="docs-skeleton-card">
    <div className="docs-skeleton-card__person"><Skeleton isLoading={loading} shape="circle"><Avatar size="lg" initials="MC" color="blue"/></Skeleton><div className="docs-skeleton-card__details"><Skeleton isLoading={loading} width="65%" height={20}><strong>Maya Chen</strong></Skeleton><Skeleton isLoading={loading} width="48%" height={16}><span>Product designer</span></Skeleton></div></div>
    <Skeleton isLoading={loading} shape="rectangle"><p>Building thoughtful products with a shared system of controls, content and motion.</p></Skeleton>
    <Skeleton isLoading={loading} height={36}><ButtonLink href={publicPath("/components/ai-profile")} variant="secondary">View profile</ButtonLink></Skeleton>
  </SkeletonGroup>;
}

const updates = ['Design review completed', 'Mobile navigation refined', 'Component styles updated', 'Template layout reviewed', 'Chart interactions checked', 'Keyboard navigation improved', 'Theme roles aligned', 'Documentation refreshed', 'Release notes prepared'];
function ScrollAreaDemo({ short = false }: { short?: boolean }) {
  return <ScrollArea label="Project updates" className="docs-scroll-area"><ul className="docs-scroll-area__updates">{(short ? updates.slice(0, 3) : updates).map((update, index) => <li key={update}><span>{update}</span><small>{index + 1} min ago</small></li>)}</ul></ScrollArea>;
}

function CollapsibleDemo({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen); const id = useId();
  return <div className="docs-collapse-stack"><Button variant="secondary" trailingIcon={RiArrowDownSLine} aria-controls={id} aria-expanded={open} onClick={() => setOpen(current => !current)}>Project details</Button><Collapsible id={id} isOpen={open} className="docs-collapse-demo"><div className="docs-collapse-demo__spacing"><div className="docs-collapse-demo__body"><Input label="Project name" defaultValue="Studio launch"/><Input label="Owner" defaultValue="Maya Chen"/></div></div></Collapsible><p className="docs-extended-note">This text follows the panel as its height changes.</p></div>;
}

function EmptyCollectionDemo() {
  const [created, setCreated] = useState(false);
  return created ? <div className="docs-extended-stack"><div className="docs-created-project"><span><RiFolderLine size={20} aria-hidden/></span><div><strong>Untitled project</strong><p>Your first project is ready to organize.</p></div><RiCheckLine size={18} aria-label="Created"/></div><Button size="small" variant="ghost" onClick={() => setCreated(false)}>Reset example</Button></div> : <EmptyState title="Make room for your next idea" description="Create your first project to organize work, bring in your team and keep the details together." icon={<RiFolderLine/>} actions={<Button leadingIcon={RiAddLine} onClick={() => setCreated(true)}>Create a project</Button>}/>;
}


export function ExtendedBasePreview({ slug }: { slug: ExtendedBaseSlug }) {
  switch (slug) {
    case 'accordion': return <div className="docs-extended-preview"><Accordion items={sections} defaultExpandedKeys={['overview']}/></div>;
    case 'collapsible': return <div className="docs-extended-preview"><CollapsibleDemo/></div>;
    case 'empty-state': return <div className="docs-extended-preview"><EmptyCollectionDemo/></div>;
    case 'progress': return <div className="docs-extended-preview"><ProgressDemo/></div>;
    case 'skeleton': return <div className="docs-extended-preview"><SkeletonDemo/></div>;
    case 'spinner': return <div className="docs-extended-preview"><div className="docs-spinner-specimens">{(['xs','sm','md','lg'] as const).map(size=><div key={size}><Spinner size={size} label={`Loading ${size} example`}/><span>{size}</span></div>)}</div></div>;
    case 'scroll-area': return <div className="docs-extended-preview"><ScrollAreaDemo/></div>;
  }
}

export function ExtendedBaseExamples({ slug, onNotify }: { slug: ExtendedBaseSlug; onNotify: (message: string) => void }) {
  switch (slug) {
    case 'accordion': return <>
      <Section title="Multiple sections" description="Open several sections together. Each panel preserves its content and owns its trigger relationship."><Accordion items={sections} allowsMultipleExpanded defaultExpandedKeys={['overview','projects']}/></Section>
      <Section title="Variants" description="Choose a single border, separated cards or plain dividers. Compact rows keep the same type hierarchy."><div className="docs-extended-grid"><Accordion items={sections.slice(0,2)} variant="separated" size="small"/><Accordion items={sections.slice(0,2)} variant="plain" size="small"/></div></Section>
      <Section title="Disabled section" description="Unavailable sections are announced as disabled and skipped by Up, Down, Home and End navigation."><Accordion items={[sections[0],{...sections[1],isDisabled:true},sections[2]]}/></Section>
    </>;
    case 'collapsible': return <>
      <Section title="Preserved content" description="Type a value, close the panel and reopen it. The input stays mounted and retains what you typed."><CollapsibleDemo/></Section>
      <Section title="Layout flow" description="The region occupies zero height when closed. Adjacent content follows the transition without scaling or leaving a placeholder."><CollapsibleDemo defaultOpen={false}/></Section>
    </>;
    case 'empty-state': return <>
      <Section title="First use and no results" description="Explain the current situation and offer an action that resolves it."><div className="docs-extended-grid"><EmptyState size="small" title="No results found" description="Try a different phrase or clear your filters." icon={<RiSearchLine/>} actions={<Button size="small" variant="secondary" onClick={() => onNotify('Filters cleared.')}>Clear filters</Button>}/><EmptyState size="small" title="You're all caught up" description="New messages will appear here when they arrive." icon={<RiInboxLine/>}/></div></Section>
      <Section title="Sizes and surfaces" description="A compact state fits a small panel; a larger surface can introduce a full collection."><div className="docs-extended-grid"><EmptyState size="small" variant="bordered" title="No saved items" description="Keep useful work close by." icon={<RiFolderLine/>}/><EmptyState variant="soft" title="Start a conversation" description="Ask a question or choose a suggestion to begin." icon={<RiTeamLine/>}/></div></Section>
    </>;
    case 'progress': return <>
      <Section title="Indeterminate" description="Use a waiting state when the total is unknown. The control has no fabricated numeric value."><div className="docs-extended-stack"><Progress label="Connecting to your workspace" isIndeterminate/><Progress label="Preparing results" isIndeterminate variant="ring"/></div></Section>
      <Section title="Rings and sizes" description="The same range and accessibility contract powers a ring. Its diameter follows the size option."><div className="docs-extended-actions">{(['small','medium','large'] as const).map(size=><Progress key={size} label={size} variant="ring" value={72} size={size}/>)}</div></Section>
      <Section title="Ranges and tones" description="Provide the original range. Color reinforces the label rather than replacing it."><div className="docs-extended-stack"><Progress label="18 of 24 tasks" value={18} maxValue={24} valueLabel="18 of 24" tone="success"/><Progress label="Storage nearing capacity" value={86} tone="warning" size="large"/><Progress label="Retry limit" value={4} maxValue={5} tone="danger" size="small"/></div></Section>
    </>;
    case 'skeleton': return <>
      <Section title="Shapes and motion" description="Choose shapes that match the eventual content. Motion becomes static when reduced motion is requested."><div className="docs-extended-grid">{(['shimmer','pulse','none'] as const).map(animation=><div className="docs-extended-stack" key={animation}><span className="docs-extended-note">{animation}</span><Skeleton shape="circle" animation={animation}/><Skeleton width="72%" animation={animation}/><Skeleton shape="rectangle" height={72} animation={animation}/></div>)}</div></Section>
      <Section title="Preserve dimensions" description="Wrap real content when its dimensions are already known. Loading children remain hidden and cannot receive focus."><div className="docs-extended-actions"><Skeleton><Button variant="secondary">Open project</Button></Skeleton><Skeleton shape="circle"><Avatar initials="MC" size="lg"/></Skeleton></div></Section>
    </>;
    case 'scroll-area': return <>
      <Section title="Content that fits" description="Directional controls stay hidden when the list fits. Resizing and content changes update the same scroll boundary measurements."><ScrollAreaDemo short/></Section>
      <Section title="Horizontal scrolling" description="Horizontal or both orientations add left/right controls while retaining native scrolling and text direction."><ScrollArea label="Project stages" orientation="horizontal" className="docs-scroll-area docs-scroll-area--horizontal"><ol className="docs-scroll-area__stages">{['Plan','Design','Build','Review','Release','Measure'].map((stage,index)=><li key={stage}><small>Stage {index+1}</small><strong>{stage}</strong></li>)}</ol></ScrollArea></Section>
      <Section title="Keyboard and focus" description="Focus the region to use Page Up, Page Down, Home and End. Arrow controls scroll smoothly and return focus to the region when they reach their edge."><ScrollAreaDemo/></Section>
    </>;
    case 'spinner': return <>
      <Section title="Sizes" description="Four diameters fit inline labels, actions, small panels and larger waiting states."><div className="docs-extended-actions">{(['xs','sm','md','lg'] as const).map(size=><div className="docs-spinner-size" key={size}><Spinner size={size} label={`Loading ${size}`}/><span>{size}</span></div>)}</div></Section>
      <Section title="Inside actions" description="A centered spinner replaces the visible label and glyphs while keeping the action’s dimensions and keyboard focus. Idle buttons reserve no extra spinner space."><div className="docs-extended-actions"><ButtonLoadingExample/><Button variant="secondary" isLoading>Loading</Button></div></Section>
    </>;
  }
}
