'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useId, useRef, useState } from 'react';
import { RiAlignCenter, RiAlignLeft, RiAlignRight, RiBold, RiBookmarkLine, RiCheckLine, RiFileCopyLine, RiItalic, RiSearchLine, RiUnderline } from '@remixicon/react';
import { AspectRatio } from '@/components/base/aspect-ratio/aspect-ratio';
import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { ImageArtwork } from '@/components/base/image-artwork/image-artwork';
import { InputGroup } from '@/components/base/input-group/input-group';
import { Kbd, KbdGroup } from '@/components/base/kbd/kbd';
import { Toggle, ToggleGroup, type ToggleVariant } from '@/components/base/toggle/toggle';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Spinner } from '@/components/base/spinner/spinner';
import { DocExampleSection as Section } from './doc-example-section';
import type { CompositionSlug } from './composition-pages';

const art = {src: publicPath("/carousel/coral-arch.webp")};
const formattingItems = [{id:'bold',label:'Bold',Icon:RiBold},{id:'italic',label:'Italic',Icon:RiItalic},{id:'underline',label:'Underline',Icon:RiUnderline}];

function FormattingDemo({ disabled = false }: { disabled?: boolean }) {
  const [formatting, setFormatting] = useState<Set<string|number>>(new Set(['bold']));
  const [text, setText] = useState('A shared place to plan the next release.');
  return <div className="docs-composition-editor">
    <ToggleGroup aria-label="Text formatting" selectionMode="multiple" selectedKeys={formatting} onSelectionChange={setFormatting} layout="joined" size="small">
      {formattingItems.map(({id,label,Icon})=><Toggle key={id} id={id} iconOnly aria-label={label} isDisabled={disabled && id==='underline'}><Icon aria-hidden/></Toggle>)}
    </ToggleGroup>
    <InputGroup kind="textarea" label="Preview text" value={text} onChange={setText} rows={2} autoResize/>
    <p className="docs-composition-editor__result" style={{fontWeight:formatting.has('bold')?700:400,fontStyle:formatting.has('italic')?'italic':'normal',textDecoration:formatting.has('underline')?'underline':'none'}}>{text || 'Your text preview appears here.'}</p>
    <span className="sr-only" role="status">{formatting.size?`Formatting: ${[...formatting].join(', ')}`:'Formatting cleared.'}</span>
  </div>;
}

function AlignmentDemo({ orientation = 'horizontal', layout = 'joined' }: {orientation?:'horizontal'|'vertical';layout?:'joined'|'separated'}) {
  const [selected, setSelected] = useState<Set<string|number>>(new Set(['left']));
  return <ToggleGroup aria-label={`${orientation} alignment`} selectedKeys={selected} onSelectionChange={setSelected} disallowEmptySelection orientation={orientation} layout={layout} variant="outline">
    {[{id:'left',label:'Align left',Icon:RiAlignLeft},{id:'center',label:'Align center',Icon:RiAlignCenter},{id:'right',label:'Align right',Icon:RiAlignRight}].map(({id,label,Icon})=><Toggle key={id} id={id} aria-label={label} iconOnly><Icon aria-hidden/></Toggle>)}
  </ToggleGroup>;
}

function NoteDemo() {
  const [note,setNote]=useState('Review the new layouts before the release.'),[pending,setPending]=useState(false),[saved,setSaved]=useState('');
  useEffect(()=>{if(!pending)return;const timer=setTimeout(()=>{setSaved(note);setPending(false);},900);return()=>clearTimeout(timer);},[pending,note]);
  return <form className="docs-extended-stack" onSubmit={event=>{event.preventDefault();if(pending)return;setPending(true);}}>
    <InputGroup kind="textarea" label="Project note" name="note" value={note} onChange={setNote} isRequired isReadOnly={pending} rows={3} maxLength={240} showCount
      blockStart={<><span>Team notes</span><Kbd variant="outline">Markdown</Kbd></>}
      blockEnd={<><span>Visible to your workspace</span><Button type="submit" size="small" variant="solid" isLoading={pending} loadingLabel="Saving">Save note</Button></>}/>
    <p className="docs-extended-note" role="status">{saved?'Your note was saved.':'Add a note and save it to try the action.'}</p>
  </form>;
}

function AddressCopySpinner({className}:{className?:string}) { return <Spinner size="sm" className={className}/>; }

function AddressDemo() {
  const [address,setAddress]=useState('studio');
  const [status,setStatus]=useState<'idle'|'copying'|'copied'|'error'>('idle');
  const request=useRef(0),currentAddress=useRef(address),feedbackId=useId();
  useEffect(()=>()=>{request.current++;},[]);
  useEffect(()=>{if(status!=='copied')return;const timer=setTimeout(()=>setStatus('idle'),1600);return()=>clearTimeout(timer);},[status]);
  async function copyAddress() {
    if(status==='copying')return;
    const operation=++request.current,submitted=currentAddress.current;
    setStatus('copying');
    try {
      await navigator.clipboard.writeText(`https://${submitted}.app`);
      if(operation===request.current&&currentAddress.current===submitted)setStatus('copied');
    } catch {
      if(operation===request.current&&currentAddress.current===submitted)setStatus('error');
    }
  }
  const copied=status==='copied',failed=status==='error',pending=status==='copying';
  return <>
    <InputGroup label="Project address" value={address} onChange={next=>{currentAddress.current=next;request.current++;setAddress(next);setStatus('idle');}} leading="https://" trailing=".app" hint={failed?'Could not copy the address. Try again.':undefined} trailingAction={<Tooltip content={copied?'Copied':pending?'Copying address':failed?'Could not copy. Try again.':'Copy address'}><IconButton variant="ghost" size="xs" icon={copied?RiCheckLine:pending?AddressCopySpinner:RiFileCopyLine} iconKey={status} isPending={pending} pendingLabel="Copying address" aria-label={copied?'Address copied':'Copy address'} aria-describedby={copied||failed?feedbackId:undefined} onClick={copyAddress}/></Tooltip>}/>
    <span id={feedbackId} role="status" className="sr-only">{copied?`Copied https://${address}.app`:failed?'Could not copy the address. Try again.':''}</span>
  </>;
}

export function CompositionPreview({slug}: {slug:CompositionSlug}) {
  switch(slug){
    case 'toggle': return <div className="docs-extended-preview"><div className="docs-extended-actions"><Toggle><RiBookmarkLine aria-hidden/>Save for later</Toggle><Toggle variant="outline" defaultSelected>Follow project</Toggle></div></div>;
    case 'toggle-group': return <div className="docs-extended-preview"><FormattingDemo/></div>;
    case 'aspect-ratio': return <div className="docs-extended-preview"><AspectRatio ratio={16/9}><ImageArtwork image={art} alt="Coral paper arch and rounded shapes"/></AspectRatio></div>;
    case 'kbd': return <div className="docs-extended-preview"><div className="docs-extended-actions"><KbdGroup aria-label="Command K"><Kbd variant="outline" size="medium">⌘</Kbd><Kbd variant="outline" size="medium">K</Kbd></KbdGroup><span className="docs-extended-note">Open quick search</span></div></div>;
    case 'input-group': return <div className="docs-extended-preview"><AddressDemo/></div>;
  }
}

export function CompositionExamples({slug}: {slug:CompositionSlug}) {
  switch(slug){
    case 'toggle':return <>
      <Section title="Appearances"><div className="docs-extended-actions">{(['soft','outline','plain'] as ToggleVariant[]).map(variant=><Toggle key={variant} variant={variant} defaultSelected>{variant[0].toUpperCase()+variant.slice(1)}</Toggle>)}</div></Section>
      <Section title="Sizes"><div className="docs-extended-actions">{(['small','medium','large'] as const).map(size=><Toggle key={size} size={size}><RiBookmarkLine aria-hidden/>{size[0].toUpperCase()+size.slice(1)}</Toggle>)}</div></Section>
      <Section title="Icon actions" description="An icon-only action needs an accessible name. The tooltip explains the action on hover or focus."><Tooltip content="Save project"><Toggle iconOnly aria-label="Save project" variant="outline"><RiBookmarkLine aria-hidden/></Toggle></Tooltip></Section>
      <Section title="Disabled"><div className="docs-extended-actions"><Toggle isDisabled>Unavailable</Toggle><Toggle isDisabled defaultSelected variant="outline">Selected and locked</Toggle></div></Section>
    </>;
    case 'toggle-group':return <>
      <Section title="Single selection" description="Arrow keys move through the choices. Keep one choice with disallowEmptySelection."><AlignmentDemo/></Section>
      <Section title="Layouts and orientation"><div className="docs-extended-actions"><AlignmentDemo layout="separated"/><AlignmentDemo orientation="vertical"/></div></Section>
      <Section title="Formatting toolbar" description="Multiple selection controls the same preview text and uses the shared Input Group."><FormattingDemo/></Section>
      <Section title="Disabled items" description="Unavailable controls are skipped during keyboard navigation."><FormattingDemo disabled/></Section>
    </>;
    case 'aspect-ratio':return <>
      <Section title="Ratios"><div className="docs-composition-media-grid">{[{name:'Square · 1:1',ratio:1},{name:'Landscape · 4:3',ratio:4/3},{name:'Portrait · 3:4',ratio:3/4}].map(item=><figure key={item.name}><AspectRatio ratio={item.ratio}><ImageArtwork image={art} alt="Coral paper shapes"/></AspectRatio><figcaption>{item.name}</figcaption></figure>)}</div></Section>
      <Section title="Cover and contain" description="Cover fills the surface; contain keeps the complete artwork visible."><div className="docs-composition-media-grid">{(['cover','contain'] as const).map(fit=><figure key={fit}><AspectRatio ratio={16/9} fit={fit}><ImageArtwork image={art} alt="Coral paper shapes"/></AspectRatio><figcaption>{fit}</figcaption></figure>)}</div></Section>
      <Section title="Corner options"><div className="docs-composition-media-grid">{(['none','small','medium','large'] as const).map(radius=><figure key={radius}><AspectRatio ratio={1} radius={radius}><ImageArtwork image={art} alt="Coral paper shapes"/></AspectRatio><figcaption>{radius}</figcaption></figure>)}</div></Section>
    </>;
    case 'kbd':return <>
      <Section title="Appearances and sizes"><div className="docs-extended-actions"><Kbd>Esc</Kbd><Kbd variant="outline">Enter</Kbd><Kbd size="medium">Space</Kbd><Kbd variant="outline" size="medium">Tab</Kbd></div></Section>
      <Section title="Shortcut groups"><div className="docs-extended-actions"><KbdGroup aria-label="Control Shift P"><Kbd variant="outline">Ctrl</Kbd><Kbd variant="outline">Shift</Kbd><Kbd variant="outline">P</Kbd></KbdGroup><KbdGroup aria-label="Command Enter"><Kbd>⌘</Kbd><Kbd>↵</Kbd></KbdGroup></div></Section>
      <Section title="With controls" description="Hints belong to the same control surface and keep their compact typography."><InputGroup label="Search projects" leading={<RiSearchLine/>} placeholder="Type a project name" trailing={<Kbd>⌘K</Kbd>}/></Section>
    </>;
    case 'input-group':return <>
      <Section title="Inline additions"><div className="docs-extended-grid"><InputGroup label="Search files" leading={<RiSearchLine/>} placeholder="Search files" trailing={<Kbd>⌘K</Kbd>}/><InputGroup label="Monthly budget" leading="$" trailing="USD" inputMode="decimal" placeholder="0.00"/><AddressDemo/></div></Section>
      <Section title="Block additions"><InputGroup label="Repository path" defaultValue="studio/app" blockStart={<span>Workspace repository</span>} blockEnd={<span>Paths are relative to your workspace.</span>}/></Section>
      <Section title="Textarea and actions"><NoteDemo/></Section>
      <Section title="Sizes and states"><div className="docs-extended-grid"><InputGroup label="Compact search" size="small" placeholder="Search" leading={<RiSearchLine/>}/><InputGroup label="Large search" size="large" placeholder="Search" leading={<RiSearchLine/>}/><InputGroup label="Invalid address" defaultValue="not an address" error="Enter a valid project address."/><InputGroup label="Locked address" defaultValue="studio.app" isDisabled/></div></Section>
    </>;
  }
}
