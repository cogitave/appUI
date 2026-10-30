'use client';

import { useId, useState } from 'react';
import { RiAddLine, RiFolderLine, RiInformationLine, RiMore2Line, RiSettings4Line } from '@remixicon/react';
import { Alert } from '@/components/base/alert/alert';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badge';
import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Card, CardFooter, CardHeader } from '@/components/base/card/card';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { ComboBox } from '@/components/base/combobox/combobox';
import { Dialog, type DialogProps } from '@/components/base/dialog/dialog';
import { Drawer, type DrawerProps } from '@/components/base/drawer/drawer';
import { Input } from '@/components/base/input/input';
import { NumberField } from '@/components/base/number-field/number-field';
import { Popover } from '@/components/base/popover/popover';
import { Progress } from '@/components/base/progress/progress';
import { Select, type SelectOption } from '@/components/base/select/select';
import { Textarea } from '@/components/base/textarea/textarea';
import { DocExampleSection as Section } from './doc-example-section';
import type { OverlayFieldSlug } from './overlay-field-pages';
import { CollectionFieldDensity } from './collection-field-examples';

const people: SelectOption[] = [
  {id:'maya',label:'Maya Chen',detail:'Design lead',leading:<Avatar initials="MC" color="blue" size="sm"/>},
  {id:'alex',label:'Alex Rivera',detail:'Engineering',leading:<Avatar initials="AR" color="lime" size="sm"/>},
  {id:'sam',label:'Sam Okafor',detail:'Product',leading:<Avatar initials="SO" color="pink" size="sm"/>},
  {id:'lee',label:'Lee Morgan',detail:'Unavailable',isDisabled:true,leading:<Avatar initials="LM" size="sm"/>},
];

function DialogDemo({ size = 'medium', long = false, onNotify }: { size?: DialogProps['size']; long?: boolean; onNotify: (message: string) => void }) {
  const [open, setOpen] = useState(false); const formId = useId();
  return <><Button variant="secondary" onClick={() => setOpen(true)}>{long ? 'Open long dialog' : size === 'medium' ? 'Edit project' : `Open ${size} dialog`}</Button><Dialog title="Edit project" description="Update the details your team uses every day." size={size} isOpen={open} onOpenChange={setOpen} footer={({close}) => <><Button variant="secondary" onClick={close}>Cancel</Button><Button variant="solid" type="submit" form={formId}>Save changes</Button></>}>
    <form id={formId} className="docs-extended-stack" onSubmit={event => { event.preventDefault(); setOpen(false); onNotify('Project details saved.'); }}><Input label="Project name" defaultValue="Studio launch" isRequired autoFocus/><Select label="Visibility" defaultSelectedKey="team" options={[{id:'team',label:'Team only'},{id:'private',label:'Private'}]}/><Textarea label="Description" defaultValue="A shared place to plan, design and ship the next release."/>{long && Array.from({length:10},(_,i) => <Input key={i} label={`Additional detail ${i+1}`} placeholder="Optional information"/>)}<Checkbox defaultSelected>Notify the project team</Checkbox></form>
  </Dialog></>;
}

function ConfirmationDemo({ onNotify }: { onNotify: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  return <><Button variant="danger" onClick={() => setOpen(true)}>Archive project</Button><Dialog title="Archive Studio launch?" role="alertdialog" size="small" isDismissable={false} isOpen={open} onOpenChange={setOpen} footer={({close}) => <><Button variant="secondary" autoFocus onClick={close}>Keep project</Button><Button variant="danger" onClick={() => { close(); onNotify('Example project archived.'); }}>Archive</Button></>}><p className="docs-extended-note">The project will leave your active list. You can restore it from the archive whenever you need it.</p></Dialog></>;
}

function DrawerDemo({ side = 'end', onNotify }: { side?: DrawerProps['side']; onNotify: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  return <><Button variant="secondary" leadingIcon={RiSettings4Line} onClick={() => setOpen(true)}>{side === 'end' ? 'Project settings' : `Open ${side} drawer`}</Button><Drawer title="Project settings" description="A few details make the workspace yours." side={side} isOpen={open} onOpenChange={setOpen} footer={({close}) => <><Button variant="secondary" onClick={close}>Cancel</Button><Button variant="solid" onClick={() => { close(); onNotify('Project settings saved.'); }}>Save settings</Button></>}><div className="docs-extended-stack"><Input label="Workspace name" defaultValue="Studio team" autoFocus/><ComboBox label="Project owner" options={people} defaultSelectedKey="maya"/><NumberField label="Weekly task goal" defaultValue={12} minValue={1} maxValue={100}/><Checkbox defaultSelected>Send a weekly summary</Checkbox><Alert title="Shared with your team" description="Changes apply to the current workspace." tone="neutral"/></div></Drawer></>;
}

function OwnerDemo() {
  const [owner, setOwner] = useState<string | null>('maya');
  return <div className="docs-extended-stack"><ComboBox label="Project owner" options={people} selectedKey={owner} onSelectionChange={key => setOwner(key == null ? null : String(key))} hint="Search by name. Unavailable members cannot be selected."/><p className="docs-extended-note">Selected: {people.find(p => p.id === owner)?.label ?? 'None'}</p></div>;
}

function DismissAlertDemo() {
  const [visible, setVisible] = useState(true);
  return visible ? <Alert title="Your changes are saved" description="The latest version is available to everyone in the project." tone="success" role="status" onDismiss={() => setVisible(false)}/> : <Button size="small" variant="secondary" onClick={() => setVisible(true)}>Replay success message</Button>;
}

function ProjectCard({ variant = 'bordered', padding = 'medium', onNotify }: { variant?: 'bordered' | 'raised' | 'soft'; padding?: 'small' | 'medium' | 'large'; onNotify: (message: string) => void }) {
  return <Card variant={variant} padding={padding}><CardHeader title="Studio launch" description="The details behind the next release." leading={<RiFolderLine size={18}/>} actions={<Popover title="Project actions" trigger={<IconButton icon={RiMore2Line} variant="ghost" aria-label="Project actions"/>}><Button variant="ghost" size="small" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); onNotify('Project example link copied.'); } catch { onNotify('Could not copy the link.'); } }}>Copy example link</Button></Popover>}/><div className="docs-card-progress"><Progress label="Tasks completed" value={72}/></div><CardFooter><Badge variant="label">TEAM PROJECT</Badge><Button variant="secondary" size="small" onClick={() => onNotify('Project opened.')}>Open project</Button></CardFooter></Card>;
}

export function OverlayFieldPreview({ slug, onNotify }: { slug: OverlayFieldSlug; onNotify: (message: string) => void }) {
  switch (slug) {
    case 'alert': return <div className="docs-extended-preview"><DismissAlertDemo/></div>;
    case 'card': return <div className="docs-extended-preview"><ProjectCard onNotify={onNotify}/></div>;
    case 'combobox': return <div className="docs-extended-preview"><OwnerDemo/></div>;
    case 'dialog': return <DialogDemo onNotify={onNotify}/>;
    case 'drawer': return <DrawerDemo onNotify={onNotify}/>;
    case 'number-field': return <div className="docs-extended-preview"><NumberField label="Quantity" defaultValue={2} minValue={1} maxValue={20} hint="Choose between 1 and 20 items."/></div>;
    case 'popover': return <Popover trigger={<Button variant="secondary" leadingIcon={RiInformationLine}>Project details</Button>} title="Studio launch" showArrow showCloseButton><div className="docs-extended-stack"><p>A shared place to plan, design and ship the next release.</p><Progress label="Tasks completed" value={72}/></div></Popover>;
  }
}

export function OverlayFieldExamples({ slug, onNotify }: { slug: OverlayFieldSlug; onNotify: (message: string) => void }) {
  switch (slug) {
    case 'alert': return <>
      <Section title="Semantic tones" description="The message and icon explain the status. Color reinforces the same meaning."><div className="docs-extended-stack"><Alert title="Keep your team up to date" description="A weekly summary helps everyone follow progress."/><Alert title="Import completed" description="All 24 items were added to your project." tone="success"/><Alert title="Storage is nearly full" description="Remove unused files or increase the project limit." tone="warning"/><Alert title="We couldn't save your changes" description="Check your connection and try again." tone="error"/></div></Section>
      <Section title="Actions and dismissal" description="Introduce a live status after an interaction, then offer a focused next action."><Alert title="Review your workspace access" description="Two invitations are waiting for approval." tone="warning" actions={<Button variant="secondary" size="small" onClick={() => onNotify('Invitations opened.')}>Review invitations</Button>}/></Section>
      <Section title="Bordered surfaces" description="The outlined variant keeps the surface neutral while the message retains its semantic foreground."><Alert title="Project settings changed" description="Your new preferences are saved." variant="bordered"/></Section>
    </>;
    case 'card': return <>
      <Section title="Surfaces" description="A border, elevation or quieter background changes emphasis without changing the component's structure."><div className="docs-extended-grid"><ProjectCard variant="raised" padding="small" onNotify={onNotify}/><ProjectCard variant="soft" padding="small" onNotify={onNotify}/></div></Section>
      <Section title="Padding and composition" description="Use small, medium or large spacing. Headers and footers accept the library's existing controls."><div className="docs-extended-grid"><Card padding="small"><CardHeader title="Compact details" description="Useful in a dense panel."/><CardFooter><Button size="small" variant="soft" onClick={() => onNotify('Details opened.')}>See details</Button></CardFooter></Card><Card padding="large"><CardHeader title="More room for content" description="Useful for introductory surfaces."/><CardFooter><Button variant="secondary" onClick={() => onNotify('Setup opened.')}>Continue setup</Button></CardFooter></Card></div></Section>
    </>;
    case 'combobox': return <>
      <Section title="Controlled selection" description="Search and keyboard navigation update the parent's selected key."><OwnerDemo/></Section>
      <Section title="Custom values and empty results" description="Allow a typed value when it belongs in your product. A search with no matches explains the empty list."><ComboBox label="Project tag" options={[{id:'design',label:'Design'},{id:'engineering',label:'Engineering'},{id:'research',label:'Research'}]} allowsCustomValue hint="Choose a tag or enter your own."/></Section>
      <Section title="States and sizes" description="Compact, disabled, loading and validation states share the field's measured type roles."><div className="docs-extended-grid"><ComboBox label="Compact owner" options={people} size="small"/><ComboBox label="Unavailable owner" options={people} isDisabled defaultSelectedKey="maya"/><ComboBox label="Loading members" options={[]} isLoading/><ComboBox label="Required owner" options={people} isInvalid error="Choose a project owner."/></div></Section>
      <Section title="Menu density and long lists" description="Choose normal, compact or touch rows. Filtering and directional controls preserve native wheel, touch and keyboard scrolling."><CollectionFieldDensity kind="combobox"/></Section>
    </>;
    case 'dialog': return <>
      <Section title="Sizes" description="The surface follows the available viewport up to its chosen maximum width."><div className="docs-extended-actions">{(['small','large','wide'] as const).map(size=><DialogDemo key={size} size={size} onNotify={onNotify}/>)}</div></Section>
      <Section title="Confirmation" description="Give a confirmation an explicit name, focus a safe starting action and preserve keyboard dismissal."><ConfirmationDemo onNotify={onNotify}/></Section>
      <Section title="Scroll behavior" description="Content scrolls only when it exceeds the viewport. The header and actions remain reachable."><DialogDemo long onNotify={onNotify}/></Section>
    </>;
    case 'drawer': return <>
      <Section title="Placement" description="Start and end drawers share the same focus, dismissal and theme behavior."><div className="docs-extended-actions"><DrawerDemo side="start" onNotify={onNotify}/><DrawerDemo side="end" onNotify={onNotify}/></div></Section>
      <Section title="Bottom sheet" description="A bottom surface grows with its content and scrolls when the content is taller than the available space."><DrawerDemo side="bottom" onNotify={onNotify}/></Section>
    </>;
    case 'number-field': return <>
      <Section title="Formatting" description="Currency, units and fractional steps use the current locale for input and display."><div className="docs-extended-grid"><NumberField label="Budget" defaultValue={2500} minValue={0} step={100} formatOptions={{style:'currency',currency:'USD'}}/><NumberField label="Discount" defaultValue={.15} minValue={0} maxValue={1} step={.01} formatOptions={{style:'percent'}}/></div></Section>
      <Section title="Stepper placement" description="Choose split controls, controls at the end or a text-only numeric field."><div className="docs-extended-grid"><NumberField label="End controls" defaultValue={12} stepper="end"/><NumberField label="Without controls" defaultValue={24} stepper="none"/><NumberField label="Compact quantity" defaultValue={2} size="small" minValue={1}/></div></Section>
      <Section title="Validation and limits" description="The decrement and increment actions respect the range. Error text remains associated with its input."><div className="docs-extended-grid"><NumberField label="Available seats" defaultValue={1} minValue={1} maxValue={8} hint="Between 1 and 8 seats."/><NumberField label="Invalid amount" defaultValue={-10} isInvalid error="Enter an amount greater than zero."/><NumberField label="Locked quantity" defaultValue={4} isDisabled/></div></Section>
    </>;
    case 'popover': return <>
      <Section title="Placement and arrows" description="The surface follows the trigger and flips when its preferred side lacks space."><div className="docs-extended-actions">{(['top','right','bottom','left'] as const).map(placement=><Popover key={placement} placement={placement} showArrow title="Quick detail" trigger={<Button size="small" variant="secondary">{placement}</Button>}><p>Content stays within the available viewport.</p></Popover>)}</div></Section>
      <Section title="Interactive content" description="An anchored editor receives focus and returns it to its trigger when dismissed."><Popover title="Create a tag" trigger={<Button variant="secondary" leadingIcon={RiAddLine}>Add tag</Button>} showCloseButton>{({close})=><div className="docs-extended-stack"><Input label="Tag name" autoFocus placeholder="Enter a name"/><Button variant="solid" size="small" onClick={()=>{close();onNotify('Tag created.')}}>Create tag</Button></div>}</Popover></Section>
    </>;
  }
}
