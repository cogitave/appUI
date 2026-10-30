'use client';

import {useEffect,useState} from 'react';
import {Form} from 'react-aria-components';
import {Button} from '@/components/base/buttons/button';
import {Checkbox} from '@/components/base/checkbox/checkbox';
import {CheckboxCard} from '@/components/base/checkbox/checkbox-card';
import {ComboBox} from '@/components/base/combobox/combobox';
import {DatePicker} from '@/components/base/date-picker/date-picker';
import {DateRangePicker} from '@/components/base/date-picker/date-range-picker';
import {MeetingScheduler} from '@/components/base/date-picker/meeting-scheduler';
import {Dialog} from '@/components/base/dialog/dialog';
import {Direction} from '@/components/base/direction/direction';
import {Field,FieldGroup,FieldSet,type FieldOrientation} from '@/components/base/field/field';
import {Input} from '@/components/base/input/input';
import {InputOTP} from '@/components/base/input-otp/input-otp';
import {NumberField} from '@/components/base/number-field/number-field';
import {Radio,RadioGroup} from '@/components/base/radio/radio';
import {RadioCard} from '@/components/base/radio/radio-card';
import {SegmentedControl} from '@/components/base/segmented-control/segmented-control';
import {Select} from '@/components/base/select/select';
import {Slider,RangeSlider} from '@/components/base/slider/slider';
import {Switch} from '@/components/base/switch/switch';
import {SwitchCard} from '@/components/base/switch/switch-card';
import {Textarea} from '@/components/base/textarea/textarea';
import {DocExampleSection as Section} from './doc-example-section';

const visibility=[{id:'team',label:'Team only'},{id:'private',label:'Private'},{id:'public',label:'Public'}];
const orientations=[{value:'vertical',label:'Vertical'},{value:'horizontal',label:'Horizontal'},{value:'responsive',label:'Responsive'}];

function ProfileForm({orientation='responsive'}:{orientation?:FieldOrientation}) {
  const [pending,setPending]=useState<Record<string,string>|null>(null),[saved,setSaved]=useState<Record<string,string>|null>(null);
  useEffect(()=>{if(!pending)return;const timer=setTimeout(()=>{setSaved(pending);setPending(null);},850);return()=>clearTimeout(timer);},[pending]);
  return <Form className="docs-field-composition-form" aria-label="Profile form" onSubmit={event=>{event.preventDefault();if(pending)return;const data=new FormData(event.currentTarget);setPending(Object.fromEntries([...data].map(([key,value])=>[key,String(value)])));}}>
    <FieldSet legend="Workspace profile" description="Choose how your details appear to your team.">
      <FieldGroup>
        <Field orientation={orientation}><Input label="Display name" name="displayName" defaultValue="Maya Chen" isRequired isReadOnly={Boolean(pending)} hint="Your teammates use this name."/></Field>
        <Field orientation={orientation}><Input label="Contact email" name="email" type="email" defaultValue="maya@example.com" isRequired isReadOnly={Boolean(pending)}/></Field>
        <Field orientation={orientation}><Select label="Profile visibility" name="visibility" defaultSelectedKey="team" options={visibility} isDisabled={Boolean(pending)}/></Field>
        <Switch name="updates" defaultSelected isDisabled={Boolean(pending)}>Product updates</Switch>
      </FieldGroup>
    </FieldSet>
    <div className="docs-extended-actions"><Button type="submit" isLoading={Boolean(pending)} loadingLabel="Saving">Save profile</Button><span className="docs-extended-note" role="status">{saved?`Saved ${saved.displayName}'s ${visibility.find(v=>v.id===saved.visibility)?.label.toLowerCase()} profile.`:'Changes are saved when you submit.'}</span></div>
  </Form>;
}

function OrientationDemo() {
  const [orientation,setOrientation]=useState<FieldOrientation>('vertical');
  return <div className="docs-field-demo"><SegmentedControl aria-label="Field orientation" options={orientations} value={orientation} onValueChange={value=>setOrientation(value as FieldOrientation)}/><FieldGroup>
    <Field orientation={orientation}><Input label="Project name" defaultValue="Autumn release" hint="This name appears on your project board."/></Field>
    <Field orientation={orientation}><NumberField label="Reviewers" defaultValue={3} minValue={1} maxValue={20} hint="At least one reviewer is required."/></Field>
    <Field orientation={orientation}><ComboBox label="Project team" options={[{id:'design',label:'Design'},{id:'engineering',label:'Engineering'}]} defaultSelectedKey="design"/></Field>
    <Field orientation={orientation}><Textarea label="Release summary" defaultValue="A clearer workspace for the next release." rows={2} showCount maxLength={160}/></Field>
  </FieldGroup></div>;
}

function ColumnsDemo() {
  const [columns,setColumns]=useState<1|2|3>(2),[density,setDensity]=useState<'compact'|'comfortable'>('comfortable');
  return <div className="docs-field-demo"><div className="docs-extended-actions"><SegmentedControl aria-label="Field columns" options={[{value:'1',label:'One'},{value:'2',label:'Two'},{value:'3',label:'Three'}]} value={String(columns)} onValueChange={value=>setColumns(Number(value) as 1|2|3)}/><SegmentedControl aria-label="Field density" options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]} value={density} onValueChange={value=>setDensity(value as typeof density)}/></div><FieldGroup columns={columns} density={density}>
    <Field orientation="responsive"><Input label="First name" defaultValue="Maya"/></Field><Field orientation="responsive"><Input label="Last name" defaultValue="Chen"/></Field><Field orientation="responsive"><Input label="City" defaultValue="Istanbul"/></Field><Field orientation="responsive"><Input label="Postal code" defaultValue="34000"/></Field><Field orientation="responsive"><Input label="Company" defaultValue="Studio"/></Field><Field orientation="responsive"><Input label="Role" defaultValue="Designer"/></Field>
  </FieldGroup></div>;
}

function DisabledDemo() {
  const [locked,setLocked]=useState(true);
  return <div className="docs-field-demo"><Button variant="secondary" onClick={()=>setLocked(value=>!value)}>{locked?'Unlock settings':'Lock settings'}</Button><FieldSet legend="Access settings" description="A disabled group also disables shared controls in nested groups." disabled={locked}>
    <FieldGroup columns={2}><Field><Input label="Workspace title" defaultValue="Studio" isDisabled={false}/></Field><Field><Select label="Default visibility" options={visibility} defaultSelectedKey="team"/></Field><Field><ComboBox label="Default team" options={[{id:'design',label:'Design'},{id:'engineering',label:'Engineering'}]} defaultSelectedKey="design"/></Field><Field><NumberField label="Review limit" defaultValue={4} minValue={1} maxValue={20}/></Field><Field><Textarea label="Workspace description" defaultValue="A place for our team." rows={2}/></Field><Field><InputOTP aria-label="Access code" defaultValue="123456"/></Field></FieldGroup>
    <FieldSet legend="Notifications" disabled={false}><div className="docs-field-options"><Checkbox defaultSelected>Release reminders</Checkbox><Switch defaultSelected>Weekly digest</Switch><CheckboxCard title="Review requests" description="Receive updates when a review is ready." defaultSelected/><SwitchCard title="Device notifications" description="Show updates on this device." defaultSelected/><RadioGroup aria-label="Delivery schedule" defaultValue="daily"><Radio value="daily">Daily</Radio><RadioCard value="weekly" title="Weekly" description="One summary every Monday."/></RadioGroup><Slider label="Digest frequency" defaultValue={40}/><RangeSlider label="Quiet hours" defaultValue={[20,80]}/><DatePicker aria-label="Next review"/><DateRangePicker aria-label="Review period"/><MeetingScheduler/></div></FieldSet>
  </FieldSet><span className="docs-extended-note" role="status">{locked?'Settings are locked.':'Settings are editable.'}</span></div>;
}

function NarrowDemo() {const[open,setOpen]=useState(false);return <><Button variant="secondary" onClick={()=>setOpen(true)}>Edit in a dialog</Button><Dialog isOpen={open} onOpenChange={setOpen} title="Profile details" size="small"><ProfileForm/></Dialog></>;}

export function FieldPreview(){return <div className="docs-extended-preview docs-field-preview"><ProfileForm/></div>;}
export function FieldExamples(){return <>
  <Section title="Orientation" description="The shared control keeps its label, value and error association while its layout changes. Responsive orientation follows the field's own width."><OrientationDemo/></Section>
  <Section title="Columns and density" description="Columns follow the group's available width. Individual responsive fields stay vertical when their own column is narrow."><ColumnsDemo/></Section>
  <Section title="Fieldset appearances"><div className="docs-field-variants">{(['plain','outline','soft'] as const).map(variant=><FieldSet key={variant} legend={`${variant[0].toUpperCase()+variant.slice(1)} group`} variant={variant} description="Related controls share one accessible legend."><FieldGroup><Field><Input label={`${variant} display name`} defaultValue="Studio"/></Field><Switch defaultSelected>{variant} updates</Switch></FieldGroup></FieldSet>)}</div></Section>
  <Section title="Validation" description="Input owns native validation and animated feedback. No second label or error layer is introduced by the layout."><Form className="docs-field-composition-form" aria-label="Required details" onSubmit={event=>event.preventDefault()}><FieldGroup><Field orientation="responsive"><Input label="Required name" name="name" isRequired hint="Enter a name before continuing."/></Field><Field orientation="responsive"><Input label="Required email" name="email" type="email" isRequired/></Field></FieldGroup><Button type="submit">Validate details</Button></Form></Section>
  <Section title="Disabled groups"><DisabledDemo/></Section>
  <Section title="Narrow surfaces" description="A wide viewport can contain a small dialog. Its fields use the dialog's available width."><NarrowDemo/></Section>
  <Section title="Right to left"><Direction locale="ar-AE"><FieldGroup><Field orientation="responsive"><Input label="Project title" defaultValue="Studio release" hint="Labels follow the scoped layout direction."/></Field><Field orientation="responsive"><Select label="Visibility" options={visibility} defaultSelectedKey="team"/></Field></FieldGroup></Direction></Section>
</>;}
