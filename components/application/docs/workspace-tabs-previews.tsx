'use client';

import { useRef, useState } from 'react';
import { RiChat1Line, RiFileTextLine, RiFolder3Line } from '@remixicon/react';
import { WorkspaceTabs, type WorkspaceTab, type WorkspaceTabsProps } from '@/components/blocks/workspace-tabs/workspace-tabs';
import { InputGroup } from '@/components/base/input-group/input-group';
import { Button } from '@/components/base/buttons/button';
import { Dialog } from '@/components/base/dialog/dialog';
import { Direction } from '@/components/base/direction/direction';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { DocExampleSection as Section } from './doc-example-section';

const initial:WorkspaceTab[]=[{id:'notes',title:'Release notes',icon:RiFileTextLine},{id:'design',title:'Design review',icon:RiChat1Line},{id:'project',title:'Project overview',icon:RiFolder3Line,isClosable:false},{id:'archive',title:'Archived work',icon:RiFileTextLine,isDisabled:true}];
function TabsDemo({variant='card',keyboardActivation='automatic',withDensity=false,protect=false}:{variant?:WorkspaceTabsProps['variant'];keyboardActivation?:WorkspaceTabsProps['keyboardActivation'];withDensity?:boolean;protect?:boolean}) {
  const [items,setItems]=useState(initial),[active,setActive]=useState('notes'),[density,setDensity]=useState('comfortable'),[drafts,setDrafts]=useState<Record<string,string>>({notes:'Plan the next release.',design:'Keep the next action close to the work.',project:'Project files and discussions.'});
  const [pendingClose,setPendingClose]=useState<string|null>(null),[status,setStatus]=useState('');
  const sequence=useRef(0);
  function remove(id:string){setItems(current=>current.filter(item=>item.id!==id));setStatus('Tab closed.');setPendingClose(null);}
  function close(id:string){if(protect&&items.find(item=>item.id===id)?.isDirty)setPendingClose(id);else remove(id);}
  const closingTitle=useRef('');if(pendingClose)closingTitle.current=items.find(item=>item.id===pendingClose)?.title??'Document';
  return <div className="docs-workspace-tabs-demo">
    {withDensity&&<SegmentedControl aria-label="Tab density" value={density} onValueChange={setDensity} options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]}/>}
    <WorkspaceTabs items={items} selectedId={active} onSelectionChange={setActive} onClose={close} onNewTab={()=>{const id=`new-${++sequence.current}`;setItems(current=>[...current,{id,title:`New document ${sequence.current}`,icon:RiFileTextLine}]);setActive(id);setStatus('New tab opened.');}} variant={variant} density={density as WorkspaceTabsProps['density']} keyboardActivation={keyboardActivation} empty={<p>No open work. Create a new tab to continue.</p>} renderPanel={tab=><div className="docs-workspace-tabs-demo__editor"><InputGroup kind="textarea" label={`${tab.title} content`} value={drafts[tab.id]??''} onChange={value=>{setDrafts(current=>({...current,[tab.id]:value}));if(protect)setItems(current=>current.map(item=>item.id===tab.id?{...item,isDirty:true}:item));}} rows={3}/>{protect&&<Button variant="secondary" size="small" onClick={()=>{setItems(current=>current.map(item=>item.id===tab.id?{...item,isDirty:false}:item));setStatus(`${tab.title} saved in this example.`);}}>Save document</Button>}</div>}/>
    <span className="docs-extended-note" role="status">{status||'Choose a tab. Arrow keys skip unavailable work; Delete closes a tab.'}</span>
    <Dialog title="Close unsaved document?" description={`${closingTitle.current} has unsaved changes.`} isOpen={pendingClose!==null} onOpenChange={open=>{if(!open)setPendingClose(null);}} footer={<><Button variant="secondary" onClick={()=>setPendingClose(null)}>Keep editing</Button><Button variant="danger" onClick={()=>{if(pendingClose)remove(pendingClose);}}>Discard and close</Button></>}><p>Discarding removes this example draft. Keeping it open preserves the content.</p></Dialog>
  </div>;
}
export function WorkspaceTabsPreview(){return <div className="docs-workspace-tabs-preview"><TabsDemo/></div>;}
export function WorkspaceTabsExamples(){return <>
  <Section title="Surfaces" description="Card, line and soft selections use the same tab semantics."><TabsDemo variant="line"/><TabsDemo variant="soft"/></Section>
  <Section title="Density" description="The strip animates its actual row height between 40 and 32 pixels."><TabsDemo withDensity/></Section>
  <Section title="Manual activation" description="Arrow keys move focus. Enter or Space selects the focused tab, which is useful for panels with costly application loading."><TabsDemo keyboardActivation="manual"/></Section>
  <Section title="Unsaved work" description="The application owns confirmation. Cancel keeps the tab and its newer draft; saving clears its unsaved indicator."><TabsDemo protect/></Section>
  <Section title="Right to left" description="Logical arrow navigation, close controls and directional scrolling follow the scoped locale."><Direction locale="ar-AE"><TabsDemo/></Direction></Section>
  </>;}
