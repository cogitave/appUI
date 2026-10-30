'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { ButtonLink } from '@/components/base/buttons/button-link';
import { HoverCard } from '@/components/base/hover-card/hover-card';
import { InlineCitation, Sources, type Source } from '@/components/blocks/sources/sources';
import { ToolCall, type ToolCallStatus } from '@/components/blocks/tool-call/tool-call';
import { DocExampleSection as Section } from './doc-example-section';
import type { AiContentSlug } from './ai-content-pages';

const sources: Source[] = [
  {id:'react-aria',title:'Accessible overlay behavior',url:'https://react-aria.adobe.com/Popover',publisher:'React Aria',description:'Keyboard interaction, focus management and positioning for anchored content.'},
  {id:'react',title:'Keeping component state predictable',url:'https://react.dev/learn/preserving-and-resetting-state',publisher:'React',description:'How component identity affects the state retained between renders.'},
  {id:'mdn',title:'Respecting motion preferences',url:'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',publisher:'MDN',description:'Use the operating system preference to reduce unnecessary motion.'},
];
const args = JSON.stringify({query:'release plan',limit:3},null,2);

function ProfilePreview({ placement = 'top', delay = 400 }: { placement?: 'top'|'bottom'|'left'|'right'; delay?: number }) {
  return <HoverCard trigger={<Button variant="secondary" size="small">{placement === 'top' ? 'Maya Chen' : `${placement} preview`}</Button>} placement={placement} delay={delay} title="Project owner"><div className="docs-hover-profile"><Avatar src={publicPath("/avatars/studio-portrait.png")} alt="Maya Chen" initials="MC" size="lg"/><div><strong>Maya Chen</strong><p>Design lead · Studio team</p></div></div><p>Working on the next release and the shared component library.</p><ButtonLink href={publicPath("/components/ai-profile")} size="small" variant="outline">View profile template</ButtonLink></HoverCard>;
}

function SourcesDemo({variant='grid'}: {variant?:'list'|'grid'}) {
  return <div className="docs-ai-width"><p className="docs-ai-answer">Keep a preview connected to its trigger and make its actions reachable from the keyboard.<InlineCitation source={sources[0]} index={1}/>Preserve the user's work when a section closes.<InlineCitation source={sources[1]} index={2}/></p><Sources sources={sources.slice(0,2)} variant={variant}/></div>;
}

function OperationDemo({ initialStatus = 'completed' }: { initialStatus?: ToolCallStatus }) {
  const [status,setStatus] = useState<ToolCallStatus>(initialStatus);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function run() { if(timer.current)clearTimeout(timer.current);setStatus('running');timer.current=setTimeout(()=>setStatus('completed'),1600); }
  function cancel() { if(timer.current)clearTimeout(timer.current);setStatus('cancelled'); }
  return <div className="docs-ai-width docs-extended-stack"><ToolCall name="search_documents" title="Search project documents" status={status} arguments={args} defaultExpanded={initialStatus !== 'completed'} durationMs={status === 'completed' ? 1600 : undefined} result={status === 'completed' ? <p>Found 3 documents: Release plan, Design checklist and Launch notes.</p> : undefined} error="The document index is temporarily unavailable." approvalPrompt="Search the documents in your current project?" onApprove={run} onReject={()=>setStatus('cancelled')} onRetry={run} onCancel={cancel}/><div className="docs-extended-actions"><Button size="small" variant="secondary" onClick={run} disabled={status === 'running'}>Run example</Button><Button size="small" variant="ghost" onClick={()=>{cancel();setStatus('requires-action');}}>Request approval</Button></div></div>;
}

export function AiContentPreview({slug}: {slug:AiContentSlug}) {
  if(slug==='hover-card')return <ProfilePreview/>;
  if(slug==='sources')return <div className="docs-extended-preview docs-extended-preview--wide"><SourcesDemo/></div>;
  return <div className="docs-extended-preview docs-extended-preview--wide"><OperationDemo/></div>;
}

export function AiContentExamples({slug}: {slug:AiContentSlug}) {
  if(slug==='hover-card')return <><Section title="Interactive previews" description="Hovering leaves the current focus in place. From a focused trigger, Tab can enter the preview; Escape returns to the trigger."><ProfilePreview/></Section><Section title="Delay and placement" description="Use a short delay to avoid opening every preview while the pointer crosses a list."><div className="docs-extended-actions">{(['bottom','left','right'] as const).map(placement=><ProfilePreview key={placement} placement={placement} delay={250}/>)}</div></Section></>;
  if(slug==='sources')return <><Section title="Inline citations" description="The small marker opens the same source record shown in the list."><p className="docs-ai-answer">Reduce decorative motion when the user requests it.<InlineCitation source={sources[2]} index={3}/></p></Section><Section title="List and grid" description="Both layouts share their card, destination and disclosure behavior."><SourcesDemo variant="list"/></Section><Section title="Document sources" description="An uploaded source can have a title and description without a public URL."><Sources sources={[{id:'document',title:'Studio release notes',type:'document',publisher:'Project documents',description:'Internal planning notes for the upcoming launch.',date:'Updated today'}]} defaultExpanded={false}/></Section></>;
  return <><Section title="Operation states" description="Status comes from your application. The card retains its open state while the operation changes."><div className="docs-ai-width docs-extended-stack">{(['pending','running','completed','failed','cancelled'] as const).map(status=><ToolCall key={status} name="lookup_project" title="Look up project" status={status} durationMs={status==='completed'?840:undefined} arguments={JSON.stringify({project:'studio'},null,2)}/>)}</div></Section><Section title="Approval" description="A new approval state opens its details so the review and actions are visible."><OperationDemo initialStatus="requires-action"/></Section><Section title="Recovery and cancellation" description="Retry updates the same operation; cancelling stops this example's timer."><OperationDemo initialStatus="failed"/></Section></>;
}
