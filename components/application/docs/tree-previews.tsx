'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { RiAddLine, RiEditLine, RiFileCodeLine, RiFileTextLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Card } from '@/components/base/card/card';
import { Dialog } from '@/components/base/dialog/dialog';
import { Input } from '@/components/base/input/input';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Textarea } from '@/components/base/textarea/textarea';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { FolderIcon } from '@/components/base/tree/folder-icon';
import { Tree, type TreeNode } from '@/components/base/tree/tree';
import { FileExplorer, type FileExplorerItem } from '@/components/blocks/file-explorer/file-explorer';
import { DocExampleSection as Section } from './doc-example-section';
import type { TreeSlug } from './tree-pages';

const folder = ({isExpanded}:{isExpanded:boolean})=><FolderIcon isOpen={isExpanded}/>, code = <RiFileCodeLine size={16}/>, document = <RiFileTextLine size={16}/>;
const treeItems: TreeNode[] = [
  { id: 'workspace', label: 'Studio project', leading: folder, children: [
    { id: 'src', label: 'src', leading: folder, children: [
      { id: 'components', label: 'components', leading: folder, children: [
        { id: 'button', label: 'button.tsx', leading: code },
        { id: 'composer', label: 'composer.tsx', leading: code },
      ] },
      { id: 'theme', label: 'theme.css', leading: code, trailing: 'Updated' },
      { id: 'app', label: 'app.tsx', leading: code },
    ] },
    { id: 'docs', label: 'docs', leading: folder, children: [
      { id: 'guide', label: 'Getting started.md', leading: document },
      { id: 'design', label: 'Design principles.md', leading: document },
    ] },
    { id: 'readme', label: 'README.md', leading: document },
    { id: 'locked', label: 'Private archive', description: 'Available to workspace owners', leading: folder, isDisabled: true },
  ] },
];
function TreeDemo({ multiple = false, options = false }: { multiple?: boolean; options?: boolean }) {
  const [selected, setSelected] = useState<string[]>(multiple ? ['theme','readme'] : ['theme']);
  const [density, setDensity] = useState('normal'), [variant, setVariant] = useState('soft');
  const [opened, setOpened] = useState('');
  return <div className="docs-tree-demo" data-demo={multiple ? 'tree-multiple' : options ? 'tree-options' : 'tree-main'}>
    {options && <div className="docs-tree-options"><SegmentedControl aria-label="Tree density" value={density} onValueChange={setDensity} options={[{value:'normal',label:'Normal'},{value:'compact',label:'Compact'}]}/><SegmentedControl aria-label="Tree selection style" value={variant} onValueChange={setVariant} options={[{value:'soft',label:'Accent'},{value:'neutral',label:'Neutral'},{value:'outline',label:'Outline'}]}/></div>}
    <Tree items={treeItems} aria-label={multiple ? 'Choose project files' : 'Project files'} defaultExpandedKeys={['workspace','src']} selectedKeys={selected} onSelectionChange={setSelected} selectionMode={multiple ? 'multiple' : 'single'} density={density as 'normal'|'compact'} variant={variant as 'soft'|'neutral'|'outline'} onAction={key => setOpened(allFiles(treeItems).find(item => item.id === key)?.label ?? key)}/>
    <p className="docs-extended-note" role="status">{selected.length ? `${selected.length} ${selected.length === 1 ? 'item' : 'items'} selected.` : 'No selection.'}{opened && ` Opened ${opened}.`}</p>
    {multiple && <Button size="small" variant="secondary" disabled={!selected.length} onClick={() => setSelected([])}>Clear selection</Button>}
  </div>;
}
const groupedItems: TreeNode[] = [{id:'library',label:'Library',leading:folder,isSelectable:false,children:[{id:'guide',label:'Getting started',leading:document},{id:'components',label:'Components',leading:folder}]}];
function ActionTree({ actionOnly = false }: { actionOnly?: boolean }) {
  const [opened,setOpened] = useState('');
  return <div className="docs-tree-demo" data-demo={actionOnly?'tree-actions':'tree-grouping'}><Tree items={groupedItems} aria-label={actionOnly?'Library actions':'Grouped choices'} selectionMode={actionOnly?'none':'single'} defaultExpandedKeys={['library']} onAction={key=>setOpened(groupedItems[0].children?.find(item=>item.id===key)?.label ?? 'Library')}/><p className="docs-extended-note" role="status">{opened?`Opened ${opened}.`:actionOnly?'Press Enter on an item to open it.':'The Library folder groups selectable choices.'}</p></div>;
}
const files: FileExplorerItem[] = [
  { id:'src',label:'src',kind:'folder',children:[
    {id:'components',label:'components',kind:'folder',children:[{id:'composer',label:'composer.tsx',path:'src/components/composer.tsx'},{id:'button',label:'button.tsx',path:'src/components/button.tsx'}]},
    {id:'theme',label:'theme.css',path:'src/theme.css',trailing:'Updated'},
    {id:'app',label:'app.tsx',path:'src/app.tsx'},
  ]},
  {id:'docs',label:'docs',kind:'folder',children:[{id:'guide',label:'Getting started.md',path:'docs/Getting started.md'},{id:'design',label:'Design principles.md',path:'docs/Design principles.md'}]},
  {id:'readme',label:'README.md',path:'README.md'},
  {id:'locked',label:'Private archive',kind:'folder',isDisabled:true},
];
const initialContent: Record<string,string> = {
  theme: `:root {\n  --surface-base: #ffffff;\n  --text-strong: #17191f;\n}\n\n.dark {\n  --surface-base: #1c2026;\n  --text-strong: #f6f7f8;\n}`,
  composer: `export function Composer({ children }) {\n  return (\n    <form className="composer">\n      {children}\n    </form>\n  );\n}`,
  button: `export function Button({ children }) {\n  return <button>{children}</button>;\n}`,
  app: `export function App() {\n  return <Workspace />;\n}`,
  guide: '# Getting started\n\nChoose a goal, create a workspace and make the first useful thing.',
  design: '# Design principles\n\nKeep the controls clear, the type readable and the motion measured.',
  readme: '# Studio project\n\nA shared space for product ideas and useful interfaces.',
};
function allFiles(items: FileExplorerItem[]): FileExplorerItem[] { return items.flatMap(item => [item,...allFiles(item.children ?? [])]); }
function FileContent({ item, content }: { item?: FileExplorerItem; content: string }) {
  const present = useIsPresent();
  return <div className="docs-explorer-preview__content" inert={!present} aria-hidden={!present || undefined}>{item && !item.children && item.kind !== 'folder' ? <pre>{content || 'This file is empty.'}</pre> : <p>{item?.children ? `${item.children.length} items in this folder.` : 'Choose a file to see its contents.'}</p>}</div>;
}
function ExplorerWorkspace() {
  const [items,setItems] = useState(files), [selected,setSelected] = useState(['theme']);
  const [content,setContent] = useState(initialContent);
  const [newOpen,setNewOpen] = useState(false),[fileName,setFileName] = useState('');
  const [editOpen,setEditOpen] = useState(false),[editing,setEditing] = useState<FileExplorerItem|null>(null),[draft,setDraft] = useState('');
  const [notice,setNotice] = useState('');
  const sequence = useRef(0);
  const reduced = useReducedMotion();
  const current = allFiles(items).find(item => item.id === selected[0]);
  const validName = Boolean(fileName.trim()) && !/[\\/]/.test(fileName) && !allFiles(items).some(item => item.path === `src/${fileName.trim()}`);
  function edit(item: FileExplorerItem) { setEditing(item); setDraft(content[item.id] ?? ''); setEditOpen(true); }
  function add() {
    if (!validName) return;
    const id=`new-${sequence.current++}`, label=fileName.trim();
    setItems(values => values.map(item => item.id === 'src' ? {...item,children:[...(item.children ?? []),{id,label,path:`src/${label}`}]} : item));
    setContent(values => ({...values,[id]:''})); setSelected([id]); setNewOpen(false); setNotice(`${label} added.`);
  }
  return <div className="docs-explorer-demo" data-demo="explorer-main"><div className="docs-explorer-workspace">
    <FileExplorer items={items} title="Project files" height={360} defaultExpandedKeys={['src','components','docs']} selectedKeys={selected} onSelectionChange={setSelected} disallowEmptySelection onOpen={edit} toolbar={<Tooltip content="New file"><IconButton icon={RiAddLine} size="xs" variant="ghost" aria-label="New file" onClick={() => {setFileName('');setNewOpen(true);}}/></Tooltip>}/>
    <Card padding="none" className="docs-explorer-preview"><header><strong>{current?.path ?? current?.label ?? 'Select a file'}</strong>{current && !current.children && current.kind !== 'folder' && <Tooltip content="Edit file"><IconButton icon={RiEditLine} size="xs" variant="ghost" aria-label="Edit selected file" onClick={() => edit(current)}/></Tooltip>}</header><div className="docs-explorer-preview__body" role="region" aria-label="File contents" tabIndex={0}><AnimatePresence initial={false} mode="popLayout"><motion.div key={current?.id ?? 'empty'} initial={reduced ? false : {opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}} transition={{duration:reduced?0:.16,ease:[.2,.75,.25,1]}}><FileContent item={current} content={current ? content[current.id] ?? '' : ''}/></motion.div></AnimatePresence></div></Card>
  </div>{notice && <p role="status" className="docs-extended-note">{notice}</p>}
  <Dialog title="New file" description="Add a file to the src folder." isOpen={newOpen} onOpenChange={setNewOpen} footer={({close})=><><Button size="small" variant="secondary" onClick={close}>Cancel</Button><Button size="small" disabled={!validName} onClick={add}>Add file</Button></>}><Input label="File name" placeholder="notes.md" value={fileName} onChange={setFileName} autoFocus hint="Use a unique name without folder separators."/></Dialog>
  <Dialog title={`Edit ${editing?.label ?? 'file'}`} isOpen={editOpen} onOpenChange={setEditOpen} footer={({close})=><><Button size="small" variant="secondary" onClick={close}>Cancel</Button><Button size="small" onClick={()=>{if(editing){setContent(values=>({...values,[editing.id]:draft}));setNotice(`${editing.label} saved.`);}close();}}>Save changes</Button></>}><Textarea label="File contents" value={draft} onChange={setDraft} autoFocus rows={9}/></Dialog>
  </div>;
}
const longFiles: FileExplorerItem[] = [{id:'notes',label:'Notes',kind:'folder',children:Array.from({length:96},(_,i)=>({id:`note-${i}`,label:`note-${String(i+1).padStart(3,'0')}.md`,path:`Notes/note-${String(i+1).padStart(3,'0')}.md`,isDisabled:i===10}))}];
function LongExplorer() {
  const [opened,setOpened] = useState('');
  return <div className="docs-tree-demo" data-demo="explorer-long"><FileExplorer items={longFiles} title="Notes" height={320} defaultExpandedKeys={['notes']} onOpen={item=>setOpened(item.label)}/><p role="status" className="docs-extended-note">{opened ? `Opened ${opened}.` : 'Press Enter on a file to open it.'}</p></div>;
}
function ExplorerOptions() {
  const [density,setDensity] = useState('normal'),[variant,setVariant] = useState('bordered');
  return <div className="docs-tree-demo" data-demo="explorer-options"><div className="docs-tree-options"><SegmentedControl aria-label="File density" value={density} onValueChange={setDensity} options={[{value:'normal',label:'Normal'},{value:'compact',label:'Compact'}]}/><SegmentedControl aria-label="File surface" value={variant} onValueChange={setVariant} options={[{value:'bordered',label:'Bordered'},{value:'soft',label:'Soft'}]}/></div><FileExplorer items={files} defaultExpandedKeys={['src','docs']} height={320} density={density as 'normal'|'compact'} variant={variant as 'bordered'|'soft'} selectionMode="multiple"/></div>;
}
function LoadingExplorer() {
  const [loading,setLoading] = useState(true);
  useEffect(()=>{const timer=setTimeout(()=>setLoading(false),1800);return()=>clearTimeout(timer);},[]);
  return <div className="docs-tree-demo" data-demo="explorer-loading"><FileExplorer title="Shared files" items={files} defaultExpandedKeys={['src','docs']} height={320} isLoading={loading}/></div>;
}
export function TreePreview({slug}: {slug:TreeSlug}) { return slug==='tree' ? <TreeDemo/> : <ExplorerWorkspace/>; }
export function TreeExamples({slug}: {slug:TreeSlug}) { return slug==='tree' ? <>
  <Section title="Multiple selection" description="Arrow keys move focus without changing the selection. Space toggles a row; Shift with arrows extends a range and Ctrl or Command with A selects visible rows."><TreeDemo multiple/></Section>
  <Section title="Density and selection" description="Density changes animate actual row height, padding and type. Accent, neutral and outline selections retain a separate keyboard focus indicator."><TreeDemo options/></Section>
  <Section title="Actions and grouping" description="Actions can work without a selected state. A grouping folder can also remain navigable and expandable while its children are selectable."><div className="docs-example__grid"><ActionTree actionOnly/><ActionTree/></div></Section>
  <Section title="Empty and disabled" description="Unavailable rows remain visible and are skipped during keyboard navigation. Empty collections retain an accessible focus target."><div className="docs-tree-demo"><Tree items={[]} aria-label="Empty files"/></div></Section>
</> : <>
  <Section title="Long collections" description="The full panel height includes its toolbar and footer. Search retains ancestors, while wheel, touch, keyboard and directional controls scroll the remaining area."><LongExplorer/></Section>
  <Section title="Density and surfaces" description="Use the same selection and search behavior with compact rows, a quiet surface or multiple selection."><ExplorerOptions/></Section>
  <Section title="Empty and loading" description="Known content stays mounted beneath its loading placeholder, so completion preserves its dimensions. Loading completes automatically; use the toolbar replay action to run it again."><div className="docs-example__grid"><div className="docs-tree-demo"><FileExplorer items={[]} title="New project"/></div><LoadingExplorer/></div></Section>
</>; }
