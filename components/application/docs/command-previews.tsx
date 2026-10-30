'use client';

import { useEffect, useState } from 'react';
import { RiAddLine, RiCalendarLine, RiChat4Line, RiFolderLine, RiHomeLine, RiSettings4Line, RiShieldCheckLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { CommandMenu, type CommandItem } from '@/components/base/command-menu/command-menu';
import { Kbd } from '@/components/base/kbd/kbd';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { CommandPalette } from '@/components/blocks/command-palette/command-palette';
import { DocExampleSection as Section } from './doc-example-section';
import type { CommandSlug } from './command-pages';

const commands: CommandItem[] = [
  { id: 'overview', label: 'Overview', group: 'Workspace', leading: <RiHomeLine/>, keywords: ['home', 'dashboard'] },
  { id: 'projects', label: 'Projects', group: 'Workspace', leading: <RiFolderLine/>, keywords: ['board', 'tasks'] },
  { id: 'calendar', label: 'Calendar', group: 'Workspace', leading: <RiCalendarLine/>, keywords: ['schedule', 'meetings'] },
  { id: 'conversation', label: 'Open conversation', group: 'Create', leading: <RiChat4Line/>, keywords: ['chat', 'assistant'] },
  { id: 'project', label: 'Create project', group: 'Create', leading: <RiAddLine/>, keywords: ['new', 'folder'] },
  { id: 'settings', label: 'Settings', group: 'Preferences', leading: <RiSettings4Line/>, keywords: ['appearance', 'profile'] },
  { id: 'permissions', label: 'Manage permissions', group: 'Preferences', leading: <RiShieldCheckLine/>, description: 'Only workspace owners can change permissions.', isDisabled: true },
];
const detailedCommands: CommandItem[] = commands.map(item => ({ ...item, description: item.description ?? ({overview:'Recent activity and project progress.',projects:'Browse tasks across your teams.',calendar:'View upcoming meetings and deadlines.',conversation:'Start a conversation in this workspace.',project:'Add a project to this demonstration.',settings:'Adjust your workspace preferences.'} as Record<string,string>)[item.id] }));

function CommandDemo({ densityControl = false, descriptions = false, empty = false, loading = false }: { densityControl?: boolean; descriptions?: boolean; empty?: boolean; loading?: boolean }) {
  const [density, setDensity] = useState('normal');
  const [selected, setSelected] = useState('');
  const [created, setCreated] = useState(0);
  const [pending, setPending] = useState(loading);
  useEffect(() => { if (!loading) return; const timer = window.setTimeout(() => setPending(false), 1600); return () => window.clearTimeout(timer); }, [loading]);
  function act(item: CommandItem) {
    if (item.id === 'project') { setCreated(value => value + 1); setSelected('Project added'); }
    else setSelected(item.label);
  }
  return <div className="docs-command-demo">
    {densityControl && <SegmentedControl aria-label="Command density" value={density} onValueChange={setDensity} options={[{value:'normal',label:'Normal'},{value:'compact',label:'Compact'}]}/>}
    <CommandMenu items={empty ? [] : descriptions ? detailedCommands : commands} label="Workspace commands" isLoading={pending} density={density as 'normal' | 'compact'} height={360} onAction={act}/>
    <p className="docs-extended-note" role="status">{selected || 'Choose a command to see its result.'}{created > 0 && ` · ${created} ${created === 1 ? 'project' : 'projects'} added`}</p>
  </div>;
}

function PaletteDemo({ keepOpen = false, initialSearch = '' }: { keepOpen?: boolean; initialSearch?: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  const [created, setCreated] = useState(0);
  return <div className="docs-command-demo docs-command-demo--palette">
    <Button variant="secondary" onClick={() => setOpen(true)}>{keepOpen ? 'Open persistent commands' : initialSearch ? 'Search project commands' : 'Open command palette'}</Button>
    <p className="docs-extended-note" role="status">{result || 'Search, then use ↑ and ↓ to move and Enter to run.'}{created > 0 && ` · ${created} ${created === 1 ? 'project' : 'projects'} added`}</p>
    <CommandPalette isOpen={open} onOpenChange={setOpen} items={commands} label="Workspace commands" defaultValue={initialSearch} closeOnAction={!keepOpen} onAction={item => { setResult(item.id === 'project' ? 'Project added' : item.label); if (item.id === 'project') setCreated(value => value + 1); }}/>
  </div>;
}

export function CommandPreview({ slug }: { slug: CommandSlug }) { return <div className="docs-extended-preview docs-extended-preview--wide">{slug === 'command-menu' ? <CommandDemo/> : <PaletteDemo/>}</div>; }
export function CommandExamples({ slug }: { slug: CommandSlug }) {
  if (slug === 'command-menu') return <>
    <Section title="Density" description="Normal and Compact share the same type roles. Row padding and height animate while the menu keeps its overall size."><CommandDemo densityControl/></Section>
    <Section title="Descriptions and keywords" description="Descriptions stay in place while filtering. Keywords such as “meetings” find Calendar without adding metadata to the row."><CommandDemo descriptions/></Section>
    <Section title="Empty and loading" description="No results retain the menu bounds. This pending example completes automatically; use the page replay action to run it again."><div className="docs-command-grid"><CommandDemo empty/><CommandDemo loading/></div></Section>
  </>;
  return <>
    <Section title="Keep open after action" description="Use closeOnAction={false} for repeated local actions. Create project updates the demonstration’s actual count."><PaletteDemo keepOpen/></Section>
    <Section title="Initial search" description="Provide a default query when the palette opens from a focused context. Clearing restores the full collection."><PaletteDemo initialSearch="project"/></Section>
    <Section title="Keyboard access" description="Register global shortcuts in the consuming application. appUI’s catalog palette opens with Ctrl/⌘K or its search action."><div className="docs-extended-stack"><p className="docs-extended-note"><Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate, <Kbd>Enter</Kbd> run, <Kbd>Esc</Kbd> close and restore focus. Disabled commands are skipped.</p><p className="docs-extended-note">The palette traps focus, keeps its header visible on short screens and uses directional controls when results overflow. Reduced motion settles immediately.</p></div></Section>
  </>;
}
