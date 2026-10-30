'use client';

import { useEffect, useId, useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { RiArrowDownSLine, RiFileCopyLine, RiFileTextLine, RiFolderOpenLine, RiDeleteBinLine, RiShareLine } from '@remixicon/react';
import { ContextMenu, ContextMenuTrigger, ActionMenu, ActionMenuItem, ActionMenuPopover, ActionMenuSection, ActionMenuSeparator, ActionSubmenu } from '@/components/base/context-menu/context-menu';
import { ActionMenuRoot, ActionMenuTrigger } from '@/components/base/action-menu/action-menu';
import { Kbd, KbdGroup } from '@/components/base/kbd/kbd';
import { Menubar } from '@/components/base/menubar/menubar';
import { InputGroup } from '@/components/base/input-group/input-group';
import { Button } from '@/components/base/buttons/button';
import { Direction } from '@/components/base/direction/direction';
import { NavigationMenu, NavigationMenuLink } from '@/components/base/navigation-menu/navigation-menu';
import { Select } from '@/components/base/select/select';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { DocExampleSection as Section } from './doc-example-section';
import type { NavigationSlug } from './navigation-pages';
import { downloadText } from '@/utils/download-text';

function SiteNavigation({presentation='dropdown',hover=false,controlled=false}:{presentation?:'dropdown'|'inline';hover?:boolean;controlled?:boolean}) {
  const destinationId=useId();
  const [open,setOpen]=useState<string|null>(null),[destination,setDestination]=useState('Overview');
  const destinations=[{id:'projects',label:'Projects',description:'Keep tasks, ownership and release progress together.'},{id:'calendar',label:'Calendar',description:'Connect team events with the work they support.'},{id:'chat',label:'Conversations',description:'Continue a discussion with its full context.'}];
  return <div className="docs-site-navigation" data-inline={presentation==='inline'||undefined}>
    {controlled&&<div className="docs-extended-actions"><Button variant="secondary" size="small" onClick={()=>setOpen(open==='product'?null:'product')}>{open==='product'?'Close product navigation':'Open product navigation'}</Button><span className="docs-extended-note">Active: {open??'none'}</span></div>}
    <NavigationMenu aria-label="Product navigation" presentation={presentation} variant="bordered" openOnHover={hover} openId={controlled?open:undefined} onOpenChange={controlled?setOpen:undefined} items={[
      {id:'product',label:'Product',content:<div className="docs-site-navigation__grid">{destinations.map(item=><NavigationMenuLink key={item.id} href={`#${destinationId}`} description={item.description} onNavigate={()=>setDestination(item.label)}>{item.label}</NavigationMenuLink>)}</div>},
      {id:'resources',label:'Resources',content:<div className="docs-site-navigation__grid"><NavigationMenuLink href={`#${destinationId}`} description="Learn the shared patterns." onNavigate={()=>setDestination('Guides')}>Guides</NavigationMenuLink><NavigationMenuLink href={`#${destinationId}`} description="Changes across the package." onNavigate={()=>setDestination('Release notes')}>Release notes</NavigationMenuLink></div>},
      {id:'roadmap',label:'Roadmap',isDisabled:true,content:<NavigationMenuLink href={`#${destinationId}`}>Coming next</NavigationMenuLink>},
      {id:'overview',label:'Overview',href:`#${destinationId}`,isCurrent:destination==='Overview',onNavigate:()=>setDestination('Overview')},
    ]}/>
    <section id={destinationId} tabIndex={-1} className="docs-site-navigation__destination" aria-label="Selected destination"><h3>{destination}</h3><p>Choose a product or resource link to navigate this example. Each destination keeps the same shared navigation.</p></section>
  </div>;
}

function DirectionDemo({directionOnly=false}:{directionOnly?:boolean}) {
  const [locale,setLocale]=useState('en-US');
  const content=<div className="docs-direction-content"><InputGroup label="Workspace name" defaultValue="Studio workspace"/><Select label="Visibility" defaultSelectedKey="team" options={[{id:'team',label:'Team only'},{id:'private',label:'Private'}]}/><Menubar aria-label="Scoped document commands" items={[{id:'file',label:'File',children:<ActionMenu aria-label="File"><ActionSubmenu><ActionMenuItem id="export">Export</ActionMenuItem><ActionMenuPopover><ActionMenu aria-label="Export"><ActionMenuItem id="text">Plain text</ActionMenuItem></ActionMenu></ActionMenuPopover></ActionSubmenu></ActionMenu>},{id:'edit',label:'Edit',children:<ActionMenu aria-label="Edit"><ActionMenuItem id="copy">Copy</ActionMenuItem></ActionMenu>}]}/></div>;
  return <div className="docs-extended-stack"><SegmentedControl aria-label="Reading direction" value={locale} onValueChange={setLocale} options={[{value:'en-US',label:'Left to right'},{value:'ar-AE',label:'Right to left'}]}/>{directionOnly?<Direction dir={locale==='ar-AE'?'rtl':'ltr'}>{content}</Direction>:<Direction locale={locale}>{content}</Direction>}</div>;
}

function FileMenu({ nested = false, density = 'comfortable' }: { nested?: boolean; density?: 'comfortable' | 'compact' }) {
  const [result, setResult] = useState('Right click the file, or focus it and open its context menu.');
  return <div className="docs-extended-stack">
    <ContextMenu density={density}>
      <ContextMenuTrigger aria-label="Actions for release notes" className="docs-context-file"><RiFileTextLine aria-hidden/><span><strong>Release notes.md</strong><span>Workspace · 4 KB</span></span></ContextMenuTrigger>
      <ActionMenuPopover>
        <ActionMenu aria-label="File actions" scrollLabel="File actions">
          <ActionMenuItem id="open" icon={RiFolderOpenLine} shortcut="↵" onAction={()=>setResult('Release notes opened.')}>Open</ActionMenuItem>
          {nested && <ActionSubmenu><ActionMenuItem id="open-with">Open with</ActionMenuItem><ActionMenuPopover offset={4}><ActionMenu aria-label="Open with"><ActionMenuItem id="editor" onAction={()=>setResult('Opened in the text editor.')}>Text editor</ActionMenuItem><ActionMenuItem id="preview" onAction={()=>setResult('Opened in document preview.')}>Document preview</ActionMenuItem><ActionMenuItem id="archive" isDisabled>Archive viewer</ActionMenuItem></ActionMenu></ActionMenuPopover></ActionSubmenu>}
          <ActionMenuItem id="duplicate" icon={RiFileCopyLine} shortcut="⌘ D" onAction={()=>setResult('Release notes copy.md created.')}>Duplicate</ActionMenuItem>
          <ActionMenuItem id="share" icon={RiShareLine} onAction={()=>setResult('A workspace link was created.')}>Share</ActionMenuItem>
          <ActionMenuItem id="move" isDisabled>Move to archive</ActionMenuItem>
          <ActionMenuSeparator/>
          <ActionMenuItem id="delete" icon={RiDeleteBinLine} variant="destructive" onAction={()=>setResult('Release notes moved to trash.')}>Move to trash</ActionMenuItem>
        </ActionMenu>
      </ActionMenuPopover>
    </ContextMenu>
    <p className="docs-extended-note" role="status">{result}</p>
  </div>;
}

function ContextMenuDemo() {
  const [density,setDensity]=useState<'comfortable'|'compact'>('comfortable');
  return <div className="docs-extended-stack"><SegmentedControl aria-label="Context menu density" value={density} onValueChange={value=>setDensity(value as typeof density)} options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]}/><FileMenu density={density}/></div>;
}

function PreferencesMenu() {
  const [layout, setLayout] = useState<Set<string|number>>(new Set(['list']));
  const [options, setOptions] = useState<Set<string|number>>(new Set(['hidden']));
  return <div className="docs-extended-stack">
    <ActionMenuRoot>
      <ActionMenuTrigger>View options<RiArrowDownSLine aria-hidden/></ActionMenuTrigger>
      <ActionMenuPopover density={options.has('compact')?'compact':'comfortable'}>
        <ActionMenu aria-label="View options" shouldCloseOnSelect={false}>
          <ActionMenuSection label="Layout" selectionMode="single" selectedKeys={layout} onSelectionChange={keys=>setLayout(new Set(keys === 'all'?[]:keys))} disallowEmptySelection>
            <ActionMenuItem id="list">List</ActionMenuItem><ActionMenuItem id="grid">Grid</ActionMenuItem><ActionMenuItem id="board">Board</ActionMenuItem>
          </ActionMenuSection>
          <ActionMenuSection label="Display" selectionMode="multiple" selectedKeys={options} onSelectionChange={keys=>setOptions(new Set(keys === 'all'?[]:keys))}>
            <ActionMenuItem id="hidden">Show hidden files</ActionMenuItem><ActionMenuItem id="compact">Compact rows</ActionMenuItem>
          </ActionMenuSection>
        </ActionMenu>
      </ActionMenuPopover>
    </ActionMenuRoot>
    <p className="docs-extended-note" role="status">{[...layout][0]} view · {options.has('compact')?'Compact':'Comfortable'} rows · Hidden files {options.has('hidden')?'visible':'hidden'}</p>
  </div>;
}

function CollectionMenu() {
  const [selected, setSelected] = useState('No recent file selected.');
  return <div className="docs-extended-stack"><ActionMenuRoot><ActionMenuTrigger>Recent files<RiArrowDownSLine aria-hidden/></ActionMenuTrigger><ActionMenuPopover width="wide"><ActionMenu aria-label="Recent files" scrollLabel="Recent files" items={Array.from({length:36},(_,index)=>({id:`file-${index+1}`,name:`Release ${String(index+1).padStart(2,'0')}.md`}))}>{file=><ActionMenuItem id={file.id} icon={RiFileTextLine} onAction={()=>setSelected(`${file.name} opened.`)}>{file.name}</ActionMenuItem>}</ActionMenu></ActionMenuPopover></ActionMenuRoot><p className="docs-extended-note" role="status">{selected}</p></div>;
}

function EditorMenu({variant = 'bordered', density = 'comfortable', disabled = false, controlled = false}: {variant?:'bordered'|'plain';density?:'comfortable'|'compact';disabled?:boolean;controlled?:boolean}) {
  const [draft,setDraft]=useState('Start with a clear goal. Keep the next action close to the content.');
  const [saved,setSaved]=useState<string|null>(null),[snapshot,setSnapshot]=useState<string|null>(null);
  const [format,setFormat]=useState<Set<string|number>>(new Set()),[open,setOpen]=useState<string|null>(null);
  const [feedback,setFeedback]=useState('');
  useEffect(()=>{if(snapshot===null)return;const timer=setTimeout(()=>{setSaved(snapshot);setSnapshot(null);setFeedback('Document saved.');},900);return()=>clearTimeout(timer);},[snapshot]);
  function save(){if(snapshot===null){setSnapshot(draft);setFeedback('Saving document…');}}
  function exportDocument(kind:'markdown'|'text') {
    try { downloadText(draft,kind==='markdown'?'studio-notes.md':'studio-notes.txt',kind==='markdown'?'text/markdown;charset=utf-8':'text/plain;charset=utf-8');setFeedback(`${kind==='markdown'?'Markdown':'Text'} download started.`); }
    catch { setFeedback('Could not export the document. Try again.'); }
  }
  return <div className="docs-extended-stack docs-menubar-editor" onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();save();}}}>
    {controlled && <div className="docs-extended-actions"><Button variant="secondary" size="small" onClick={()=>setOpen(open==='file'?null:'file')}>{open==='file'?'Close File menu':'Open File menu'}</Button><span className="docs-extended-note">Active: {open??'none'}</span></div>}
    <Menubar aria-label="Document commands" variant={variant} density={density} openId={controlled?open:undefined} onOpenChange={controlled?setOpen:undefined} items={[
      {id:'file',label:'File',children:<ActionMenu aria-label="File commands"><ActionMenuItem id="new" onAction={()=>{setDraft('');setSaved(null);setSnapshot(null);setFeedback('New document created.');}}>New document</ActionMenuItem><ActionMenuItem id="save" shortcut="⌘ S" isDisabled={snapshot!==null} onAction={save}>Save</ActionMenuItem><ActionSubmenu><ActionMenuItem id="export">Export</ActionMenuItem><ActionMenuPopover offset={4} density={density}><ActionMenu aria-label="Export document"><ActionMenuItem id="markdown" onAction={()=>exportDocument('markdown')}>Markdown</ActionMenuItem><ActionMenuItem id="text" onAction={()=>exportDocument('text')}>Plain text</ActionMenuItem></ActionMenu></ActionMenuPopover></ActionSubmenu></ActionMenu>},
      {id:'edit',label:'Edit',isDisabled:disabled,children:<ActionMenu aria-label="Edit commands"><ActionMenuItem id="duplicate" onAction={()=>{setDraft(text=>`${text}\n\n${text}`);setFeedback('Document content duplicated.');}}>Duplicate content</ActionMenuItem><ActionMenuItem id="append" onAction={()=>setDraft(text=>`${text}\n\nReview the release checklist.`)}>Append checklist</ActionMenuItem><ActionMenuSeparator/><ActionMenuItem id="clear" variant="destructive" onAction={()=>setDraft('')}>Clear document</ActionMenuItem></ActionMenu>},
      {id:'view',label:'View',children:<ActionMenu aria-label="View commands"><ActionMenuSection label="Text style" selectionMode="multiple" selectedKeys={format} onSelectionChange={keys=>setFormat(new Set(keys==='all'?[]:keys))} shouldCloseOnSelect={false}><ActionMenuItem id="bold">Bold</ActionMenuItem><ActionMenuItem id="italic">Italic</ActionMenuItem><ActionMenuItem id="underline">Underline</ActionMenuItem></ActionMenuSection></ActionMenu>},
    ]}/>
    <InputGroup kind="textarea" label="Document text" rows={3} value={draft} onChange={setDraft} blockEnd={<span>{draft.length} characters</span>}/>
    <p className="docs-composition-editor__result" style={{fontWeight:format.has('bold')?700:400,fontStyle:format.has('italic')?'italic':'normal',textDecoration:format.has('underline')?'underline':'none'}}>{draft||'Your document preview appears here.'}</p>
    <p role="status" className="docs-extended-note">{feedback||'Use File, Edit and View to try document commands.'}{saved!==null&&saved!==draft?' The current draft has unsaved changes.':''}</p>
  </div>;
}

export function NavigationPreview({slug}: {slug:NavigationSlug}) {
  if(slug==='navigation-menu')return <div className="docs-extended-preview"><SiteNavigation/></div>;
  if(slug==='direction')return <div className="docs-extended-preview"><DirectionDemo/></div>;
  if(slug==='context-menu') return <div className="docs-extended-preview"><ContextMenuDemo/></div>;
  if(slug==='menubar') return <div className="docs-extended-preview"><EditorMenu/></div>;
}
export function NavigationExamples({slug}: {slug:NavigationSlug}) {
  if(slug==='navigation-menu')return <>
    <Section title="Inline expansion" description="The panel participates in layout. Switching between link groups animates the measured height without scaling text or leaving closed space."><SiteNavigation presentation="inline"/></Section>
    <Section title="Hover opening" description="Optional mouse hover opens a panel. Touch and keyboard activation stay available, and focus inside navigation keeps it open."><SiteNavigation hover/></Section>
    <Section title="Controlled state" description="Coordinate open navigation with application state. Escape, repeated activation and outside interaction request closure."><SiteNavigation controlled/></Section>
    <Section title="Right to left" description="A scoped locale changes the layout and the logical direction of optional arrow keys."><Direction locale="ar-AE"><SiteNavigation presentation="inline"/></Direction></Section>
    <Section title="Keyboard access" description="Tab reaches every top-level control and the active links. Enter and Space toggle panels; down/up enter their first/last link. Escape returns to the controlling button. Left/right and Home/End supplement the normal Tab sequence."><KbdGroup><Kbd variant="outline">Tab</Kbd><Kbd variant="outline">Enter</Kbd><Kbd variant="outline">Esc</Kbd></KbdGroup></Section>
  </>;
  if(slug==='direction')return <>
    <Section title="Nested scopes" description="A nested locale can restore left-to-right content inside a right-to-left region. Existing controls retain their values when the outer locale changes."><Direction locale="ar-AE"><div className="docs-extended-stack"><p className="docs-extended-note">Right-to-left outer scope</p><Direction locale="en-US"><DirectionDemo/></Direction></div></Direction></Section>
    <Section title="Direction only" description="Use an explicit direction when localized formatting is not required. Direction-only scopes use en-US for ltr and ar-AE for rtl; choose locale for language-specific dates, numbers and announcements."><DirectionDemo directionOnly/></Section>
    <Section title="Portaled controls" description="Selects and submenus inherit the same locale even when their surface is rendered outside the wrapper. Scope layout and keyboard behavior together."><Direction locale="ar-AE"><FileMenu nested/></Direction></Section>
  </>;
  if(slug==='menubar') return <>
    <Section title="Appearances and density" description="A plain surface and compact menu rows, composed with the same document editor."><EditorMenu variant="plain" density="compact"/></Section>
    <Section title="Disabled entries" description="Unavailable entries are announced and skipped when moving through the bar."><EditorMenu disabled/></Section>
    <Section title="Controlled menu" description="Keep the open menu in application state. Outgoing menus cannot clear a newly opened menu."><EditorMenu controlled/></Section>
    <Section title="Keyboard access" description="One Tab stop enters the bar. Left and right move through commands; down and up open a menu. Escape returns to its trigger, and Tab leaves the bar."><KbdGroup aria-label="Arrow keys"><Kbd variant="outline">←</Kbd><Kbd variant="outline">→</Kbd><Kbd variant="outline">↓</Kbd></KbdGroup></Section>
  </>;
  if(slug==='context-menu') return <>
    <Section title="Compact" description="Use a denser action menu while retaining the same typography, shortcuts and keyboard behavior. Nested menus inherit the density; touch controls keep their larger targets."><FileMenu density="compact" nested/></Section>
    <Section title="Nested actions" description="Move into a submenu with the logical forward arrow. Escape returns to its parent."><FileMenu nested/></Section>
    <Section title="Selections and density" description="Independent single and multiple selection groups. Compact rows animate their actual height while the menu stays open."><PreferencesMenu/></Section>
    <Section title="Constrained collections" description="Native wheel, touch and keyboard scrolling with directional controls in place of a visible scrollbar."><CollectionMenu/></Section>
    <Section title="Right to left" description="Scope layout and keyboard direction with the same locale. Portaled submenus inherit the provider."><I18nProvider locale="ar-AE"><div dir="rtl"><FileMenu nested/></div></I18nProvider></Section>
    <Section title="Disabled target" description="An unavailable target does not open an appUI context menu."><ContextMenu><ContextMenuTrigger isDisabled>Unavailable file</ContextMenuTrigger><ActionMenuPopover><ActionMenu aria-label="Unavailable actions"><ActionMenuItem id="open">Open</ActionMenuItem></ActionMenu></ActionMenuPopover></ContextMenu></Section>
    <Section title="Keyboard access" description="Tab to the target. Use the platform context-menu key or Shift F10, then arrows, Home, End and typeahead to choose an action. Escape closes the menu and returns focus."><KbdGroup aria-label="Shift F10"><Kbd variant="outline">⇧</Kbd><Kbd variant="outline">F10</Kbd></KbdGroup></Section>
  </>;
}
