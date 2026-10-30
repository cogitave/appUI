'use client';

import { useState } from 'react';
import { Form } from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { ComboBox } from '@/components/base/combobox/combobox';
import { Select } from '@/components/base/select/select';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Field, FieldGroup } from '@/components/base/field/field';

const teams = Array.from({length:80},(_,index)=>({id:String(index),label:`Studio team ${String(index+1).padStart(2,'0')}`,isDisabled:index===4}));
const visibility = [{id:'team',label:'Team only'},{id:'private',label:'Private'},{id:'public',label:'Public link'}];

export function CollectionFieldDensity({kind}:{kind:'select'|'combobox'}) {
  const [density,setDensity] = useState<'comfortable'|'compact'|'touch'>('comfortable');
  return <div className="docs-extended-stack docs-collection-field-demo">
    <SegmentedControl aria-label={`${kind === 'select' ? 'Select' : 'ComboBox'} menu density`} value={density} onValueChange={value=>setDensity(value as typeof density)} options={[{value:'comfortable',label:'Normal'},{value:'compact',label:'Compact'},{value:'touch',label:'Touch'}]}/>
    {kind==='select' ? <Select label="Team directory" options={teams} defaultSelectedKey="0" density={density} hint="Use the arrows, wheel or keyboard to explore the directory."/> : <ComboBox label="Team directory" options={teams} defaultSelectedKey="0" density={density} hint="Search by name. Unavailable teams are skipped during navigation."/>}
  </div>;
}

export function SelectValidationExample() {
  const [saved,setSaved] = useState('');
  return <Form className="docs-extended-stack docs-collection-field-demo" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);setSaved(visibility.find(option=>option.id===data.get('visibility'))?.label ?? '');}}>
    <FieldGroup><Field><Select name="visibility" label="Project visibility" options={visibility} isRequired hint="Choose who can open the project."/></Field></FieldGroup>
    <Button type="submit" variant="secondary">Save visibility</Button>
    <p className="docs-extended-note" role="status">{saved ? `Saved: ${saved}` : 'Your choice is saved when this form passes validation.'}</p>
  </Form>;
}

export function SelectSizeExamples() {
  return <div className="docs-extended-grid">{(['small','medium','large'] as const).map(size=><Select key={size} label={`${size[0].toUpperCase()+size.slice(1)} visibility`} size={size} defaultSelectedKey="team" options={visibility}/>)}</div>;
}
