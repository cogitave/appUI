'use client';

import { useState } from 'react';
import { RiFileCodeLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { Card } from '@/components/base/card/card';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { Input } from '@/components/base/input/input';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { SplitPane } from '@/components/base/split-pane/split-pane';
import { Textarea } from '@/components/base/textarea/textarea';
import { Tree } from '@/components/base/tree/tree';
import { DocExampleSection as Section } from './doc-example-section';

const files = [{id:'theme',label:'theme.css'},{id:'app',label:'app.tsx'},{id:'composer',label:'composer.tsx'}];
const sources: Record<string,string> = {
  theme: ':root {\n  --surface-base: #ffffff;\n  --text-strong: #17191f;\n}\n\n.dark {\n  --surface-base: #1c2026;\n  --text-strong: #f6f7f8;\n}',
  app: 'export function App() {\n  return <Workspace />;\n}',
  composer: 'export function Composer({ children }) {\n  return (\n    <form className="composer">\n      {children}\n    </form>\n  );\n}',
};
export function SplitPanePreview() {
  const [size,setSize] = useState(35),[selection,setSelection] = useState(['theme']);
  return <div className="docs-split-demo" data-demo="split-main"><div className="docs-split-toolbar"><Button variant="secondary" size="small" onClick={()=>setSize(size===0?35:0)}>{size===0?'Show files':'Hide files'}</Button><Button variant="ghost" size="small" onClick={()=>setSize(35)}>Reset size</Button><span className="docs-extended-note">Drag the divider or focus it and use the arrows.</span></div><SplitPane value={size} onValueChange={setSize} primaryLabel="Project files" secondaryLabel="Code preview" collapsible minValue={22} maxValue={65} stackAt={520} height={340}
    primary={<Card padding="none" className="docs-split-card"><header>Project files</header><ScrollArea label="Project files viewport"><Tree items={files.map(file=>({...file,leading:<RiFileCodeLine size={16}/>}))} aria-label="Files" density="compact" selectedKeys={selection} onSelectionChange={setSelection} disallowEmptySelection/></ScrollArea></Card>}
    secondary={<CodeBlock code={sources[selection[0]] ?? ''} label={files.find(file=>file.id===selection[0])?.label ?? 'File'} lineNumbers wrap fill density="compact"/>}/></div>;
}
function Vertical() {
  const [draft,setDraft] = useState('Review the navigation and keep the controls clear.');
  return <div className="docs-split-demo" data-demo="split-vertical"><SplitPane orientation="vertical" primaryLabel="Draft" secondaryLabel="Draft preview" defaultValue={45} minValue={25} maxValue={75} height={380}
    primary={<Card padding="none" className="docs-split-card"><header>Draft</header><ScrollArea label="Draft form"><div className="docs-split-card__body"><Textarea label="Project brief" value={draft} onChange={setDraft}/></div></ScrollArea></Card>}
    secondary={<Card padding="none" className="docs-split-card"><header>Preview</header><ScrollArea label="Draft preview text"><p className="docs-split-copy">{draft || 'Add a project brief.'}</p></ScrollArea></Card>}/></div>;
}
function Limits({ disabled = false }: { disabled?: boolean }) {
  const [direction,setDirection] = useState('ltr'),[value,setValue] = useState(40),[name,setName] = useState('Studio project');
  return <div className="docs-split-demo" data-demo={disabled?'split-disabled':'split-limits'}>{!disabled && <SegmentedControl aria-label="Panel direction" value={direction} onValueChange={setDirection} options={[{value:'ltr',label:'Left to right'},{value:'rtl',label:'Right to left'}]}/>}<div dir={direction}><SplitPane value={value} onValueChange={setValue} primaryLabel={disabled?'Locked settings':'Project settings'} secondaryLabel={disabled?'Locked preview':'Project summary'} isDisabled={disabled} minValue={30} maxValue={70} stackAt={520} height={300}
    primary={<Card padding="none" className="docs-split-card"><header>Settings</header><ScrollArea label="Project settings form"><div className="docs-split-card__body"><Input label="Project name" value={name} onChange={setName}/></div></ScrollArea></Card>}
    secondary={<Card padding="none" className="docs-split-card"><header>Summary</header><ScrollArea label="Project summary content"><p className="docs-split-copy">{name}</p></ScrollArea></Card>}/></div><p className="docs-extended-note">{disabled?'The divider is disabled; the form remains editable.':'Primary panel: 30–70%. Home and End reach the limits; Shift + arrow moves by ten.'}</p></div>;
}
export function SplitPaneExamples() { return <>
  <Section title="Vertical layout" description="The horizontal divider follows up and down arrows. Resizing preserves the draft and its preview."><Vertical/></Section>
  <Section title="Direction and limits" description="Arrows move the divider in their physical direction, including right-to-left layouts. At narrow container widths the same panels stack without remounting their fields."><Limits/></Section>
  <Section title="Disabled" description="Disabling the resize handle leaves the panel content available. The handle stays outside keyboard navigation."><Limits disabled/></Section>
</>; }
