'use client';

import { useState, type ReactNode } from 'react';
import { RiEditLine, RiImageLine, RiMore2Line, RiNotification3Line, RiSettings4Line, RiTeamLine } from '@remixicon/react';
import { Switch } from '@/components/base/switch/switch';
import { SwitchCard } from '@/components/base/switch/switch-card';
import { Table, TableHeader, Column, TableBody, Row, Cell } from '@/components/base/table/table';
import { Tabs, TabList, Tab, TabPanel } from '@/components/base/tabs/tabs';
import { Textarea } from '@/components/base/textarea/textarea';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Badge } from '@/components/base/badges/badge';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { BlockExamples, BlockPreview } from './block-previews';
import { CustomerTablePreview } from './customer-table-demo';

type Props = { slug: DocSlug; onNotify: (message: string) => void };
const people = [
  { id: 'maya', name: 'Maya Chen', role: 'Designer', status: 'Active' },
  { id: 'noah', name: 'Noah Garcia', role: 'Engineer', status: 'Active' },
  { id: 'elin', name: 'Elin Park', role: 'Researcher', status: 'Invited' },
  { id: 'amir', name: 'Amir Hassan', role: 'Product lead', status: 'Active' },
];
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p>{children}</section>;
}
function PeopleTable({ compact = false, selectable = false }: { compact?: boolean; selectable?: boolean }) {
  return <div className="docs-table-frame"><Table size={compact ? 'sm' : 'md'} aria-label="Team members" selectionMode={selectable ? 'multiple' : 'none'}><TableHeader><Column isRowHeader>Name</Column><Column>Role</Column><Column>Status</Column></TableHeader><TableBody>{people.map(person => <Row key={person.id} id={person.id}><Cell>{person.name}</Cell><Cell>{person.role}</Cell><Cell><span className="docs-table-status" data-status={person.status.toLowerCase()}>{person.status}</span></Cell></Row>)}</TableBody></Table></div>;
}


export function BaseFinalPreview({ slug, onNotify }: Props) {
  switch (slug) {
    case 'switch': return <div className="docs-preview__switch-grid">{(['pill','rectangle'] as const).map(shape => <div key={shape}><span>{shape}</span><div>{(['lg','md','sm'] as const).map(size => <label key={size}><Switch aria-label={`${shape} ${size} switch`} shape={shape} size={size} defaultSelected />{size}</label>)}</div></div>)}</div>;
    case 'table': return <CustomerTablePreview onAction={onNotify} />;
    case 'tabs': return <div className="docs-preview__tabs"><Tabs defaultSelectedKey="banners"><TabList aria-label="Workspace sections"><Tab id="banners"><RiImageLine /> Banners <Badge color="primary">152</Badge></Tab><Tab id="posts">Posts <Badge>32</Badge></Tab><Tab id="members"><RiTeamLine /> Members</Tab><Tab id="settings"><RiSettings4Line /> Settings</Tab></TabList><TabPanel id="banners">Banners for this workspace.</TabPanel><TabPanel id="posts">Recent posts.</TabPanel><TabPanel id="members">Members in this workspace.</TabPanel><TabPanel id="settings">Workspace settings.</TabPanel></Tabs></div>;
    case 'textarea': return <Textarea label="Release notes" placeholder="What changed in this version?" isRequired hint="Markdown is supported." />;
    case 'tooltip': return <div className="docs-preview__row"><Tooltip content="A short helpful note"><button className="docs-tooltip-button" type="button">Small</button></Tooltip><Tooltip content="More context for this action"><button className="docs-tooltip-button" type="button">Medium</button></Tooltip><Tooltip content="A clean hint" showArrow={false}><button className="docs-tooltip-button" type="button">No arrow</button></Tooltip></div>;
    default: return <BlockPreview slug={slug} onNotify={onNotify} />;
  }
}

export function BaseFinalExamples({ slug, onNotify }: Props) {
  const [enabled, setEnabled] = useState(true);
  switch (slug) {
    case 'switch': return <>
      <Section title="Shapes and sizes" description="Pill and rectangle tracks scale across large, medium, and small contexts."><div className="docs-example__surface docs-example__button-row">{(['pill','rectangle'] as const).map(shape => <div className="docs-example__switch-column" key={shape}><strong>{shape}</strong>{(['lg','md','sm'] as const).map(size => <Switch key={size} shape={shape} size={size} aria-label={`${shape} ${size}`} defaultSelected />)}</div>)}</div></Section>
      <Section title="Labels and states" description="Text remains associated with the native switch behavior."><div className="docs-example__surface docs-example__button-row"><Switch isSelected={enabled} onChange={setEnabled}>Email notifications</Switch><Switch isDisabled>Unavailable</Switch></div></Section>
      <Section title="Card" description="The entire card is an interactive setting with one concise explanation."><div className="docs-example__surface"><SwitchCard title="Product updates" description="Occasional release notes from the team." defaultSelected /></div></Section>
    </>;
    case 'table': return <Section title="React Aria primitive" description="The primitive handles keyboard navigation and row selection. The preview above shows the same visual language with TanStack data operations."><PeopleTable selectable /></Section>;
    case 'tabs': return <>
      <Section title="Pill tabs" description="Pills suit dense filters and small settings panels."><div className="docs-example__surface"><Tabs variant="pill" defaultSelectedKey="overview"><TabList aria-label="Project view"><Tab id="overview">Overview</Tab><Tab id="activity">Activity</Tab><Tab id="files">Files</Tab></TabList><TabPanel id="overview">Project overview.</TabPanel><TabPanel id="activity">Recent activity.</TabPanel><TabPanel id="files">Shared files.</TabPanel></Tabs></div></Section>
      <Section title="Panels" description="Each tab controls one labelled content panel."><div className="docs-example__surface"><Tabs defaultSelectedKey="profile"><TabList aria-label="Account settings"><Tab id="profile">Profile</Tab><Tab id="security">Security</Tab></TabList><TabPanel id="profile">Edit your profile details.</TabPanel><TabPanel id="security">Manage account security.</TabPanel></Tabs></div></Section>
    </>;
    case 'textarea': return <>
      <Section title="Auto resize" description="The field grows with entered content while retaining normal keyboard editing."><div className="docs-example__surface"><Textarea label="Message" placeholder="Write a thoughtful message..." autoResize rows={3} /></div></Section>
      <Section title="Character count" description="A visible count supports fields with a length limit."><div className="docs-example__surface"><Textarea label="Summary" placeholder="A short project summary" maxLength={160} showCount rows={3} /></div></Section>
      <Section title="States" description="Invalid and disabled fields keep the same hierarchy as Input."><div className="docs-example__surface docs-example__button-row"><Textarea label="Required note" isInvalid error="Add a note before continuing." /><Textarea label="Archived note" defaultValue="This note is read only." isDisabled /></div></Section>
    </>;
    case 'tooltip': return <>
      <Section title="Positions" description="The hint can sit on any side of its trigger and adjusts near the viewport edge."><div className="docs-example__surface docs-example__button-row">{(['top','bottom','left','right'] as const).map(placement => <Tooltip key={placement} content={`${placement} tooltip`} placement={placement}><button type="button" className="docs-tooltip-button">{placement}</button></Tooltip>)}</div></Section>
      <Section title="Without arrow" description="A quiet tooltip can omit the caret when the context is already clear."><div className="docs-example__surface"><Tooltip content="Edit project" showArrow={false}><IconButton icon={RiEditLine} aria-label="Edit project" onClick={() => onNotify('Edit project selected.')} /></Tooltip><Tooltip content="Notifications"><IconButton icon={RiNotification3Line} aria-label="Notifications" /></Tooltip><Tooltip content="More actions"><IconButton icon={RiMore2Line} aria-label="More actions" /></Tooltip></div></Section>
    </>;
    default: return <BlockExamples slug={slug} onNotify={onNotify} />;
  }
}
