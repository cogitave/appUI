'use client';

import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Switch } from '@/components/base/switch/switch';
import { SettingsModal, type SettingsValues } from '@/components/blocks/settings-modal/settings-modal';
import { DocExampleSection as Section } from './doc-example-section';

function SaveExample() {
  const [open,setOpen] = useState(false),[fail,setFail] = useState(false),[attempts,setAttempts] = useState(0),[saved,setSaved] = useState<SettingsValues|null>(null);
  function save(values:SettingsValues) {
    const rejected=fail;
    setAttempts(count=>count+1);
    return new Promise<void>((resolve,reject)=>window.setTimeout(()=>{
      if(rejected){reject(new Error('The demonstration rejected this save. Turn off “Fail next save” and retry.'));return;}
      setSaved(values);resolve();
    },1600));
  }
  return <div className="docs-extended-stack" data-demo="settings-saving"><Switch isSelected={fail} onChange={setFail}>Fail next save</Switch><Button variant="secondary" onClick={()=>setOpen(true)}>Open saving settings</Button><p role="status" className="docs-extended-note" data-attempts={attempts}>{saved?`Saved workspace: ${saved.workspaceName}. ${attempts} save ${attempts===1?'attempt':'attempts'}.`:`No settings saved. ${attempts} save ${attempts===1?'attempt':'attempts'}.`}</p><SettingsModal isOpen={open} onClose={()=>setOpen(false)} workspaceName="Studio workspace" name="Maya Chen" email="maya@studio.co" onSave={save}/></div>;
}
function CustomFields() {
  const [open,setOpen] = useState(false),[saved,setSaved] = useState<SettingsValues|null>(null);
  return <div className="docs-extended-stack" data-demo="settings-custom"><Button variant="secondary" onClick={()=>setOpen(true)}>Open custom workspace settings</Button><p role="status" className="docs-extended-note">{saved?`Branch: ${saved.additional['rules.branch'] ?? 'main'} · Visibility: ${saved.additional['rules.visibility'] ?? 'team'}`:'The caller supplies fields and receives their saved values.'}</p><SettingsModal isOpen={open} onClose={()=>setOpen(false)} initialPage="rules" extraPages={{rules:{description:'Choose defaults for new projects.',fields:[{id:'branch',label:'Working branch',description:'Used when a new project starts.',kind:'text',defaultValue:'main',placeholder:'Branch name',maxLength:40},{id:'visibility',label:'Project visibility',description:'Who can see newly created projects.',kind:'select',defaultValue:'team',options:[{value:'team',label:'Team only'},{value:'private',label:'Private'}]},{id:'review',label:'Require review',description:'Keep an approval step before sharing changes.',kind:'toggle',defaultValue:true},{id:'region',label:'Workspace region',description:'The organization chooses this value.',kind:'text',defaultValue:'Europe',isDisabled:true}]}}} onSave={setSaved}/></div>;
}
export function SettingsFormExamples() { return <>
  <Section title="Saving and recovery" description="A save callback may return a promise. The action retains focus, blocks repeated submission and keeps the dialog open on failure. Editing while saving preserves the submitted snapshot and the newer draft independently; dismissing suppresses late dialog feedback."><SaveExample/></Section>
  <Section title="Custom workspace fields" description="Text, select and toggle fields use shared primitives and associated descriptions. Extra field options include type, placeholder, length and disabled state. Email validation also runs when another Settings page is visible."><CustomFields/></Section>
</>; }
