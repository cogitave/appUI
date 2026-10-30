'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useId, useRef, useState } from 'react';
import { RiAddLine, RiCheckLine, RiFolderLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { Dialog } from '@/components/base/dialog/dialog';
import { Input } from '@/components/base/input/input';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Select } from '@/components/base/select/select';
import { ActivityFeed, type ActivityEntry } from '@/components/blocks/activity-feed/activity-feed';
import { OnboardingChecklist, type OnboardingTask } from '@/components/blocks/onboarding-checklist/onboarding-checklist';
import { DocExampleSection as Section } from './doc-example-section';
import type { JourneySlug } from './journey-pages';

const history: ActivityEntry[] = [
  { id: 'review', actor: { name: 'Maya Chen', src: publicPath("/avatars/studio-portrait.png"), initials: 'MC' }, title: 'requested a review', description: 'The navigation updates are ready for a second look.', time: '10:42 AM', dateTime: '2026-10-01T10:42:00+03:00', group: 'Today' },
  { id: 'project', actor: { name: 'Noah Garcia', initials: 'NG', color: 'blue' }, title: 'created a project', description: 'Navigation polish', time: '9:18 AM', dateTime: '2026-10-01T09:18:00+03:00', group: 'Today', icon: RiFolderLine },
  { id: 'checks', title: 'Project checks passed', description: 'The latest preview is ready to open.', time: '4:35 PM', dateTime: '2026-09-30T16:35:00+03:00', group: 'Yesterday', icon: RiCheckLine },
];

function ActivityDemo({ options = false, constrained = false, automatic = false, empty = false }: { options?: boolean; constrained?: boolean; automatic?: boolean; empty?: boolean }) {
  const [items, setItems] = useState<ActivityEntry[]>(automatic || empty ? [] : constrained ? Array.from({ length: 15 }, (_, index) => ({ ...history[index % 3], id: `history-${index}`, group: index < 6 ? 'Today' : 'Earlier', time: `${index + 1} hr ago` })) : history);
  const [loading, setLoading] = useState(automatic);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');
  const [variant, setVariant] = useState<'bordered' | 'soft' | 'raised'>('bordered');
  const [project, setProject] = useState(false);
  const next = useRef(0);
  useEffect(() => {
    if (!automatic) return;
    const timer = setTimeout(() => { setItems(history); setLoading(false); }, 1800);
    return () => clearTimeout(timer);
  }, [automatic]);
  function addUpdate() {
    const id = `new-${++next.current}`;
    setItems(current => [{ id, actor: { name: 'Maya Chen', initials: 'MC', color: 'pink' }, title: 'updated the project', description: 'Refined the navigation labels.', group: 'Today', time: 'Just now' }, ...current]);
  }
  const updates = items.map(item => ({ ...item,
    detail: item.title === 'requested a review' ? <div className="docs-journey-detail"><p>Review the sidebar labels, selected state and narrow layouts.</p><Input label="Review note" placeholder="Leave a note for the team"/></div> : undefined,
    action: item.title === 'created a project' ? { label: 'Open project', onPress: () => setProject(true) } : undefined,
  }));
  return <div className="docs-journey-demo" data-demo={automatic ? 'activity-loading' : constrained ? 'activity-constrained' : empty ? 'activity-empty' : options ? 'activity-options' : 'activity-main'}>
    {options && <div className="docs-journey-toolbar"><SegmentedControl aria-label="Activity density" value={density} onValueChange={value => setDensity(value as typeof density)} options={[{ value: 'normal', label: 'Normal' }, { value: 'compact', label: 'Compact' }]}/><Select aria-label="Activity surface" selectedKey={variant} onSelectionChange={value => setVariant(value as typeof variant)} options={['bordered','soft','raised'].map(id => ({ id, label: id[0].toUpperCase() + id.slice(1) }))}/></div>}
    <ActivityFeed items={updates} isLoading={loading} label={constrained ? 'Workspace history' : 'Project activity'} description={constrained ? 'The latest changes across your team.' : undefined} height={constrained ? 360 : undefined} density={density} variant={variant} expandedKeys={expanded} onExpandedChange={setExpanded}
      headerActions={!automatic && !empty ? <><Button variant="ghost" size="xs" disabled={!items.length} onClick={() => setItems([])}>Clear</Button><Button variant="outline" size="xs" leadingIcon={RiAddLine} onClick={addUpdate}>Add update</Button></> : undefined}
      emptyAction={!automatic ? <Button size="small" variant="outline" onClick={() => setItems(history)}>Restore updates</Button> : undefined}
      footer={constrained ? <span className="docs-extended-note">{items.length} updates</span> : undefined}/>
    <Dialog title="Navigation polish" description="Studio workspace" isOpen={project} onOpenChange={setProject} size="small" footer={({ close }) => <Button variant="outline" onClick={close}>Done</Button>}><p>Review navigation labels and make the sidebar work comfortably on desktop, tablet and mobile.</p></Dialog>
  </div>;
}

const choices: OnboardingTask[] = [
  { id: 'workspace', title: 'Name your workspace', description: 'Make it easy for your team to find.' },
  { id: 'invite', title: 'Invite a teammate', description: 'Bring someone into your workspace.' },
  { id: 'project', title: 'Create your first project', description: 'Give your team a place to start.' },
  { id: 'preferences', title: 'Choose your preferences', description: 'Set how you receive updates.', isOptional: true },
];
const taskFields = {
  workspace: { title: 'Name your workspace', label: 'Workspace name', placeholder: 'Studio workspace' },
  invite: { title: 'Invite a teammate', label: 'Email address', placeholder: 'name@example.com' },
  project: { title: 'Create your first project', label: 'Project name', placeholder: 'Navigation polish' },
  preferences: { title: 'Choose your preferences', label: 'Notification preference', placeholder: 'Daily summary' },
} as const;
type SetupKey = keyof typeof taskFields;

function ActionChecklist() {
  const formId = useId();
  const [completed, setCompleted] = useState<string[]>([]);
  const [values, setValues] = useState<Partial<Record<SetupKey, string>>>({});
  const [editing, setEditing] = useState<SetupKey>('workspace');
  const [editorOpen, setEditorOpen] = useState(false);
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState('');
  const title = taskFields[editing];
  function edit(id: SetupKey) { setValue(values[id] ?? ''); setEditing(id); setEditorOpen(true); }
  function save() {
    if (!value.trim()) return;
    const label = taskFields[editing].label;
    setValues(current => ({ ...current, [editing]: value.trim() }));
    setCompleted(current => [...new Set([...current, editing])]);
    setSaved(`${label} saved: ${value.trim()}`);
    setEditorOpen(false);
  }
  const valid = Boolean(value.trim()) && (editing !== 'invite' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
  const tasks = choices.map(item => ({ ...item, description: values[item.id as SetupKey] ?? item.description, action: { label: completed.includes(item.id) ? 'Edit' : item.id === 'workspace' ? 'Set name' : item.id === 'invite' ? 'Invite' : item.id === 'project' ? 'Create' : 'Choose', onPress: () => edit(item.id as SetupKey) } }));
  return <div className="docs-journey-demo" data-demo="onboarding-main">
    <OnboardingChecklist items={tasks} description="Three small steps to get your team ready." completedKeys={completed} isReadOnly footer={<p className="docs-extended-note" role="status">{completed.filter(id => id !== 'preferences').length === 3 ? 'Your workspace is ready.' : saved || 'Complete a task to save its details.'}</p>}/>
    <Dialog title={title.title} isOpen={editorOpen} onOpenChange={setEditorOpen} size="small" footer={<><Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="submit" form={formId} disabled={!valid}>Save</Button></>}>
      <form id={formId} onSubmit={event => { event.preventDefault(); if (valid) save(); }}><Input label={title.label} placeholder={title.placeholder} value={value} onChange={setValue} type={editing === 'invite' ? 'email' : 'text'} isRequired autoFocus/></form>
    </Dialog>
  </div>;
}

function ChecklistDemo({ options = false, collapsed = false, optional = false, empty = false }: { options?: boolean; collapsed?: boolean; optional?: boolean; empty?: boolean }) {
  const [completed, setCompleted] = useState<string[]>(collapsed ? ['workspace'] : []);
  const [expanded, setExpanded] = useState(!collapsed);
  const [open, setOpen] = useState(true);
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');
  const [variant, setVariant] = useState<'bordered' | 'soft' | 'raised'>('bordered');
  const [completions, setCompletions] = useState(0);
  const restore = useRef<HTMLButtonElement>(null);
  const tasks = empty ? [] : optional ? choices.filter(item => item.isOptional).concat([{ id: 'themes', title: 'Preview another theme', isOptional: true }]) : choices;
  return <div className="docs-journey-demo" data-demo={empty ? 'onboarding-empty' : optional ? 'onboarding-optional' : collapsed ? 'onboarding-disclosure' : options ? 'onboarding-options' : 'onboarding-manual'}>
    {(options || collapsed) && <div className="docs-journey-toolbar">
      {options && <><SegmentedControl aria-label="Setup density" value={density} onValueChange={value => setDensity(value as typeof density)} options={[{ value: 'normal', label: 'Normal' }, { value: 'compact', label: 'Compact' }]}/><Select aria-label="Setup surface" selectedKey={variant} onSelectionChange={value => setVariant(value as typeof variant)} options={['bordered','soft','raised'].map(id => ({ id, label: id[0].toUpperCase() + id.slice(1) }))}/></>}
      {collapsed && <Button ref={restore} size="small" variant="outline" onClick={() => setOpen(true)}>Restore checklist</Button>}
    </div>}
    <OnboardingChecklist items={tasks} title={optional ? 'Personalize your workspace' : 'Set up your workspace'} completedKeys={completed} onCompletedChange={setCompleted} onComplete={() => setCompletions(current => current + 1)} isExpanded={expanded} onExpandedChange={setExpanded} isOpen={open} onOpenChange={setOpen} dismissible={collapsed} onDismiss={() => restore.current?.focus({ preventScroll: true })} density={density} variant={variant}/>
    {!empty && !optional && <div className="docs-journey-toolbar"><Button size="small" variant="ghost" onClick={() => setCompleted([])}>Reset tasks</Button><span className="docs-extended-note" role="status">{completions ? `Setup completed ${completions} ${completions === 1 ? 'time' : 'times'}.` : 'Optional tasks do not change setup progress.'}</span></div>}
  </div>;
}

export function JourneyPreview({ slug }: { slug: JourneySlug }) { return slug === 'activity-feed' ? <ActivityDemo/> : <ActionChecklist/>; }
export function JourneyExamples({ slug }: { slug: JourneySlug }) {
  return slug === 'activity-feed' ? <>
    <Section title="Density and surfaces" description="Normal and compact rows animate their spacing. Actions and detail use the shared controls."><ActivityDemo options/></Section>
    <Section title="Constrained history" description="An explicit height includes the header and footer. Longer history uses native scrolling with directional controls."><ActivityDemo constrained/></Section>
    <Section title="Empty and loading" description="An empty state can offer a next action. Loading completes automatically; use the toolbar replay to see its transition again."><div className="docs-journey-grid"><ActivityDemo empty/><ActivityDemo automatic/></div></Section>
  </> : <>
    <Section title="Direct choices" description="Manual completion supports keyboard selection. Only required tasks contribute to progress and completion."><ChecklistDemo/></Section>
    <Section title="Density and surfaces" description="Density changes animate the card padding and task spacing while retaining completed tasks."><ChecklistDemo options/></Section>
    <Section title="Collapsed and dismissed" description="The disclosure leaves no space for hidden tasks. Dismissal removes the card with a short exit and preserves its completion state when restored."><ChecklistDemo collapsed/></Section>
    <Section title="Optional and empty" description="Optional-only lists have no required progress. An empty card offers a clear explanation."><div className="docs-journey-grid"><ChecklistDemo optional/><ChecklistDemo empty/></div></Section>
  </>;
}
