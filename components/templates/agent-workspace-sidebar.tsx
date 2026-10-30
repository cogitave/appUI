'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery, TEMPLATE_NAV_QUERY } from '@/hooks/use-media-query';
import { usePanelFocus } from '@/hooks/use-panel-focus';
import { usePathname, useRouter } from 'next/navigation';
import { RiAddLine, RiArrowRightSLine, RiFolder3Line, RiMenuLine, RiSearchLine, RiSettings4Line, RiSparklingLine, RiToolsLine } from '@remixicon/react';
import { IconButton } from '@/components/base/buttons/icon-button';
import { ThemeSwitch } from '@/components/base/theme-switch/theme-switch';

export type AgentSidebarProject = { name: string; threads: { name: string; time: string }[] };
type AgentSidebarProps = { workspaceName: string; projects?: AgentSidebarProject[]; activeThread?: string; onThreadSelect?: (thread: string, project: string) => void; onAction?: (action: string) => void };
const defaultProjects: AgentSidebarProject[] = [
  { name: 'Studio', threads: [{ name: 'Landing page design', time: '34m' }, { name: 'Image generation', time: 'now' }, { name: 'Coding scenario', time: 'now' }, { name: 'Mobile app', time: '5h' }] },
  { name: 'Product launch', threads: [{ name: 'Hero animation', time: '3d' }, { name: 'Pricing page', time: '4d' }] },
  { name: 'Playground', threads: [{ name: 'Canvas motion', time: '1w' }] },
];

export function AgentWorkspaceSidebar({ workspaceName, projects = defaultProjects, activeThread = 'Image generation', onThreadSelect, onAction }: AgentSidebarProps) {
  const [open, setOpen] = useState(false);
  const compactNavigation = useMediaQuery(TEMPLATE_NAV_QUERY);
  const sidebarRef = useRef<HTMLElement>(null);
  usePanelFocus(compactNavigation && open, sidebarRef, () => setOpen(false));
  useEffect(() => { if (!compactNavigation) setOpen(false); }, [compactNavigation]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isLivePreview = pathname.startsWith('/templates/');
  const mark = workspaceName.trim().charAt(0).toUpperCase() || 'S';
  const groups = projects.map(project => ({ ...project, threads: project.threads.filter(thread => `${project.name} ${thread.name}`.toLowerCase().includes(query.toLowerCase())) })).filter(project => project.threads.length);
  function action(message: string) { setNotice(message); onAction?.(message); }
  return <>
    <IconButton icon={RiMenuLine} className="ui-agent-sidebar__mobile-toggle" aria-label={open ? 'Close workspace menu' : 'Open workspace menu'} aria-expanded={open} onClick={() => setOpen(value => !value)}/>
    {open && <button className="ui-agent-sidebar__scrim" type="button" aria-label="Close workspace menu" onClick={() => setOpen(false)}/>}
    <aside ref={sidebarRef} role={compactNavigation ? "dialog" : undefined} aria-modal={compactNavigation && open || undefined} inert={compactNavigation && !open} className={`ui-ai-chat__sidebar ui-agent-sidebar${open ? ' is-open' : ''}`} aria-label="Agent workspace navigation">
      <div className="ui-ai-chat__workspace"><span className="ui-ai-chat__workspace-mark" aria-hidden>{mark}</span><strong>{workspaceName}</strong><RiArrowRightSLine size={17} aria-hidden/></div>
      <label className="ui-agent-sidebar__search"><RiSearchLine size={17} aria-hidden/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Quick Search" aria-label="Search workspace threads"/><kbd>⌘K</kbd></label>
      <nav className="ui-ai-chat__nav" aria-label="Projects and threads"><div className="ui-ai-chat__nav-utilities">
        <button type="button" onClick={() => { setOpen(false); if(isLivePreview)router.push('/templates/ai-chat');else action('New agent'); }}><RiAddLine size={17}/>New agent</button>
        <button type="button" onClick={() => action('Automations are ready to configure')}><RiSparklingLine size={17}/>Automations</button>
        <button type="button" onClick={() => action('Customize this workspace from Settings')}><RiToolsLine size={17}/>Customize</button>
      </div><div className="ui-ai-chat__repositories"><h3>Repositories</h3>{groups.map(project => <div className="ui-ai-chat__project" key={project.name}><div className="ui-ai-chat__project-label"><RiFolder3Line size={17} aria-hidden/>{project.name}</div>{project.threads.map(thread => <button type="button" key={thread.name} aria-current={thread.name === activeThread ? 'page' : undefined} onClick={() => { setOpen(false); if (thread.name === activeThread) return; if(onThreadSelect)onThreadSelect(thread.name,project.name);else { onAction?.(`open ${thread.name}`); if(isLivePreview)router.push('/templates/ai-chat'); } }}><span className="ui-ai-chat__tree" aria-hidden/><span className="ui-ai-chat__thread-text"><strong>{thread.name}</strong></span><small className="ui-agent-sidebar__time">{thread.time}</small></button>)}</div>)}{!groups.length && <p className="ui-ai-chat__empty-search">No threads found.</p>}</div></nav>
      {notice && <div className="ui-agent-sidebar__notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      <div className="ui-ai-chat__sidebar-bottom"><ThemeSwitch/><button type="button" onClick={() => action('Support is available in workspace settings')}>Support</button><button type="button" onClick={() => action('Customize this workspace using the appearance controls')}><RiSettings4Line size={16}/>Settings</button><div><span className="ui-ai-chat__workspace-mark" aria-hidden>{mark}</span><strong>{workspaceName}<small>Pro Plan</small></strong></div></div>
    </aside>
  </>;
}
