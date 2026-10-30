'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { RiAddLine, RiCloseLine, RiArrowRightSLine, RiCodeSSlashLine, RiExternalLinkLine, RiFileCodeLine, RiFolder3Line, RiGlobalLine, RiHistoryLine, RiLayoutRightLine, RiMenuLine, RiMore2Line, RiSearchLine, RiSettings4Line, RiShareLine, RiSparklingLine, RiToolsLine } from '@remixicon/react';
import { AgentProgress, type AgentProgressStep } from '@/components/blocks/agent-progress/agent-progress';
import { Composer } from '@/components/blocks/composer/composer';
import { Message } from '@/components/blocks/message/message';
import { IconButton } from '@/components/base/buttons/icon-button';
import { ThemeSwitch } from '@/components/base/theme-switch/theme-switch';
import { Tree } from '@/components/base/tree/tree';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { ResizeHandle } from '@/components/base/split-pane/split-pane';
import { BrandMark } from '@/components/foundations/brand-mark';
import { useElementSize } from '@/hooks/use-element-size';
import { useMediaQuery, TEMPLATE_NAV_QUERY, TEMPLATE_PANEL_QUERY } from '@/hooks/use-media-query';
import { usePanelFocus } from '@/hooks/use-panel-focus';
import { cx } from '@/utils/cx';
import type { ChatMessage } from './template-presets';

export type AIChatThread = { id: string; title: string; project: string; summary?: string; messages: ChatMessage[] };
export type AIChatChange = { id: string; path: string; added: number; removed: number; code: string };
export type AIChatBrowserPreview = { url: string; title: string; heading: string; description: string; actionLabel: string };
export type AIChatTemplateProps = {
  className?: string;
  onAction?: (action: string) => void;
  onSend?: (message: string) => void;
  initialMessages?: ChatMessage[];
  threads?: AIChatThread[];
  changes?: AIChatChange[];
  progress?: AgentProgressStep[];
  workspaceName?: string;
  branch?: string;
  model?: string;
  browserPreview?: AIChatBrowserPreview;
};

const sampleThreads: AIChatThread[] = [
  { id: 'theme', title: 'Theme system', project: 'Studio app', summary: 'Update the color tokens for dark mode', messages: [{ id: 'brief', role: 'user', text: 'Update our color tokens for dark mode and add a reusable theme toggle. Run lint and a production build when you are done.' }] },
  { id: 'landing', title: 'Landing page', project: 'Studio app', summary: 'Give the hero a clearer direction', messages: [{ id: 'landing-question', role: 'user', text: 'How can we make the landing page feel clearer?' }, { id: 'landing-reply', role: 'assistant', text: 'Lead with one clear action, then show a focused product preview. Keep supporting links close to the fold.' }] },
  { id: 'report', title: 'Usage report', project: 'Analytics', summary: 'Summarize the weekly usage trend', messages: [{ id: 'report-question', role: 'user', text: 'Summarize the weekly usage trend.' }] },
  { id: 'navigation', title: 'Navigation polish', project: 'Studio app', summary: 'Refine keyboard support', messages: [{ id: 'nav-question', role: 'user', text: 'Review the navigation behavior on smaller screens.' }] },
];
const sampleChanges: AIChatChange[] = [
  { id: 'theme-css', path: 'src/styles/theme.css', added: 74, removed: 12, code: `:root {
  --surface-base: #ffffff;
  --surface-raised: #f7f8fa;
  --text-primary: #17191f;
  --border-subtle: #e9ebef;
}

.dark {
  --surface-base: #15171b;
  --surface-raised: #1d2025;
  --text-primary: #f6f7f8;
  --border-subtle: #32363d;
}

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms; }
}` },
  { id: 'toggle-tsx', path: 'src/components/theme-toggle.tsx', added: 48, removed: 0, code: `import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
  const { theme, setTheme } = useAppearance();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      aria-label={next}
      onClick={event => setTheme(next, event)}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}` },
];
const sampleProgress: AgentProgressStep[] = [
  { id: 'read', label: 'Read project files', status: 'complete' },
  { id: 'tokens', label: 'Update color tokens', status: 'complete' },
  { id: 'toggle', label: 'Add theme toggle', status: 'active', progress: .45 },
  { id: 'lint', label: 'Run lint', status: 'pending' },
  { id: 'build', label: 'Run production build', status: 'pending' },
];
const sampleBrowserPreview: AIChatBrowserPreview = { url: 'localhost:3000', title: 'Studio', heading: 'A better space for your best work.', description: 'Bring your ideas, team and tools together.', actionLabel: 'Explore workspace' };

export function AIChatTemplate({ className, onAction, onSend, initialMessages, threads = sampleThreads, changes = sampleChanges, progress = sampleProgress, workspaceName = 'Studio workspace', branch = 'Main', model = 'Fable 5', browserPreview = sampleBrowserPreview }: AIChatTemplateProps) {
  const [currentModel, setCurrentModel] = useState(model);
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? threads[0]?.messages ?? []);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [overlayPanelOpen, setOverlayPanelOpen] = useState(false);
  const compactPanel = useMediaQuery(TEMPLATE_PANEL_QUERY);
  const compactNavigation = useMediaQuery(TEMPLATE_NAV_QUERY);
  const navigationRef = useRef<HTMLElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const mobilePanelTrigger = useRef<HTMLButtonElement>(null), desktopPanelTrigger = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const panelId = useId();
  const {ref:layoutRef,width:layoutWidth} = useElementSize<HTMLDivElement>(1440,760);
  const [panelSize,setPanelSize] = useState<number>();
  const [panelResizing,setPanelResizing] = useState(false);
  const [panelDefaults,setPanelDefaults] = useState({size:330,sidebar:242,padding:22});
  const maximumPanelSize = Math.max(240,Math.min(580,layoutWidth-panelDefaults.sidebar-panelDefaults.padding-24-360));
  const effectivePanelSize = Math.max(panelResizing?0:240,Math.min(maximumPanelSize,panelSize??panelDefaults.size));
  useLayoutEffect(()=>{
    const root=layoutRef.current;
    if(!root)return;
    const style=getComputedStyle(root);
    setPanelDefaults({size:parseFloat(style.getPropertyValue('--chat-panel-width'))||330,sidebar:parseFloat(style.getPropertyValue('--chat-sidebar-width'))||242,padding:parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)+2});
  },[className,layoutRef]);
  useLayoutEffect(()=>{
    const previous=lastFocus.current;
    if(!previous || (previous!==resizeRef.current && !inspectorRef.current?.contains(previous)))return;
    if(compactPanel && !overlayPanelOpen || !compactPanel && !rightOpen){
      if(document.activeElement===document.body || layoutRef.current?.contains(document.activeElement)){
        const trigger=mobilePanelTrigger.current?.getClientRects().length?mobilePanelTrigger.current:desktopPanelTrigger.current;
        trigger?.focus({preventScroll:true});
      }
    }
  },[compactPanel]);
  usePanelFocus(compactNavigation && leftOpen, navigationRef, () => setLeftOpen(false));
  usePanelFocus(compactPanel && overlayPanelOpen, inspectorRef, () => setOverlayPanelOpen(false));
  const [rightTab, setRightTab] = useState<'changes' | 'browser'>('changes');
  const [selectedChangeId, setSelectedChangeId] = useState(changes[0]?.id);
  const selectedThread = threads.find(thread => thread.id === selectedId);
  const selectedChange = changes.find(change => change.id === selectedChangeId) ?? changes[0];
  const visibleThreads = threads.filter(thread => `${thread.title} ${thread.project} ${thread.summary ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const groups = [...new Set(visibleThreads.map(thread => thread.project))];
  const additions = changes.reduce((total, change) => total + change.added, 0);
  const removals = changes.reduce((total, change) => total + change.removed, 0);
  const workspaceInitial = workspaceName.trim().charAt(0).toUpperCase() || 'W';

  useEffect(() => { if (!compactPanel) setOverlayPanelOpen(false); }, [compactPanel]);
  useEffect(() => { if (!compactNavigation) setLeftOpen(false); }, [compactNavigation]);
  useEffect(() => setCurrentModel(model), [model]);

  function selectThread(thread: AIChatThread) {
    setSelectedId(thread.id);
    setMessages(thread.messages);
    setLeftOpen(false);
    onAction?.(`open ${thread.id}`);
  }
  function startChat() {
    setSelectedId(null);
    setMessages([]);
    setLeftOpen(false);
    onAction?.('new chat');
  }
  function send(message: string) {
    setMessages(current => [...current, { id: `message-${Date.now()}`, role: 'user', text: message }]);
    onSend?.(message);
    onAction?.('send message');
  }

  function resizePanel(next:number) {
    if(next===0 && inspectorRef.current?.contains(document.activeElement))resizeRef.current?.focus({preventScroll:true});
    setPanelSize(next>0?next:panelSize);
    setRightOpen(next>0);
  }
  function closePanel() {
    if(compactPanel)setOverlayPanelOpen(false);
    else{resizeRef.current?.focus({preventScroll:true});setRightOpen(false);setOverlayPanelOpen(false);}
  }
  function togglePanel() {
    if (compactPanel) { setLeftOpen(false); setOverlayPanelOpen(open => !open); }
    else setRightOpen(open => !open);
  }

  return <div ref={layoutRef} onFocusCapture={event=>{lastFocus.current=event.target as HTMLElement;}} onBlurCapture={event=>{if(event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))lastFocus.current=null;}} style={{'--chat-resized-panel-width':panelSize!==undefined || maximumPanelSize<panelDefaults.size?`${effectivePanelSize}px`:undefined} as CSSProperties} className={cx('ui-ai-chat', className)} data-panel-closed={!rightOpen || undefined} data-overlay-panel-open={overlayPanelOpen || undefined}>
    {leftOpen && <button type="button" className="ui-ai-chat__scrim" aria-label="Close conversations" onClick={() => setLeftOpen(false)} />}
    <aside ref={navigationRef} className={cx('ui-ai-chat__sidebar', leftOpen && 'is-open')} aria-label="Conversations" role={compactNavigation ? "dialog" : undefined} aria-modal={compactNavigation && leftOpen || undefined} inert={compactNavigation && !leftOpen}>
      <IconButton icon={RiCloseLine} size="small" className="ui-ai-chat__close-navigation" aria-label="Close conversations" onClick={() => setLeftOpen(false)}/>
      <div className="ui-ai-chat__workspace"><span className="ui-ai-chat__workspace-mark" aria-hidden="true">{workspaceInitial}</span><strong>{workspaceName}</strong><RiArrowRightSLine size={17} aria-hidden /></div>
      <div className="ui-ai-chat__sidebar-actions"><button type="button" aria-label="Search conversations" onClick={() => setSearchOpen(open => !open)}><RiSearchLine size={18} /></button><button type="button" aria-label="Recent conversations" onClick={() => onAction?.('recent conversations')}><RiHistoryLine size={18} /></button><button type="button" className="ui-ai-chat__new" aria-label="New chat" onClick={startChat}><RiAddLine size={19} /></button></div>
      {searchOpen && <label className="ui-ai-chat__search"><RiSearchLine size={15} aria-hidden /><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search conversations" /></label>}
      <nav className="ui-ai-chat__nav" aria-label="Threads">
        <div className="ui-ai-chat__nav-utilities"><button type="button" onClick={startChat}><RiAddLine size={17} /> New agent</button><button type="button" onClick={() => onAction?.('automations')}><RiSparklingLine size={17} /> Automations</button><button type="button" onClick={() => onAction?.('customize')}><RiToolsLine size={17} /> Customize</button></div>
        <div className="ui-ai-chat__repositories"><h3>Projects</h3>{groups.map(group => <div className="ui-ai-chat__project" key={group}><div className="ui-ai-chat__project-label"><RiFolder3Line size={17} aria-hidden />{group}</div>{visibleThreads.filter(thread => thread.project === group).map(thread => <button type="button" key={thread.id} aria-current={thread.id === selectedId ? 'page' : undefined} onClick={() => selectThread(thread)}><span className="ui-ai-chat__tree" aria-hidden="true"/><span className="ui-ai-chat__thread-text"><strong>{thread.title}</strong>{thread.summary && <small>{thread.summary}</small>}</span></button>)}</div>)}{!visibleThreads.length && <p className="ui-ai-chat__empty-search">No conversations found.</p>}</div>
      </nav>
      <div className="ui-ai-chat__sidebar-bottom"><ThemeSwitch/><button type="button" onClick={() => onAction?.('support')}>Support</button><button type="button" onClick={() => {setLeftOpen(false);onAction?.('settings');}}><RiSettings4Line size={16}/> Settings</button><div><span className="ui-ai-chat__workspace-mark" aria-hidden="true">{workspaceInitial}</span><strong>{workspaceName}<small>Personal workspace</small></strong></div></div>
    </aside>

    <main className="ui-ai-chat__main" inert={(compactNavigation && leftOpen) || (compactPanel && overlayPanelOpen)}>
      <div className="ui-ai-chat__mobile-header"><IconButton icon={RiMenuLine} className="ui-ai-chat__mobile-menu" aria-label="Open conversations" aria-expanded={leftOpen} onClick={() => { setOverlayPanelOpen(false); setLeftOpen(true); }}/><strong>Agentic chat</strong><IconButton ref={mobilePanelTrigger} icon={RiCodeSSlashLine} aria-controls={panelId} aria-label="Open side panel" aria-expanded={overlayPanelOpen} onClick={togglePanel}/></div>
      <header className="ui-ai-chat__topbar"><div><RiFolder3Line size={16} aria-hidden /><span>{selectedThread?.project ?? workspaceName}</span><RiArrowRightSLine size={15} aria-hidden /><strong>{selectedThread?.title ?? 'New chat'}</strong></div><div><button type="button" aria-label="Share chat" onClick={() => onAction?.('share chat')}><RiShareLine size={16} /></button><button type="button" aria-label="More chat options" onClick={() => onAction?.('more options')}><RiMore2Line size={18} /></button><button type="button" ref={desktopPanelTrigger} className="ui-ai-chat__panel-toggle" aria-controls={panelId} aria-label="Toggle side panel" aria-expanded={compactPanel ? overlayPanelOpen : rightOpen} onClick={togglePanel}><RiLayoutRightLine size={18} /></button></div></header>
      <div className="ui-ai-chat__conversation">{messages.length ? <div className="ui-ai-chat__messages">{messages.map(message => <Message className="ui-ai-chat__message" role={message.role} key={message.id}><p>{message.text}</p></Message>)}{selectedThread?.id === threads[0]?.id && <AgentProgress steps={progress} />}</div> : <div className="ui-ai-chat__welcome"><span><BrandMark size={28}/></span><h2>What shall we work on?</h2><p>Ask about a project, explore an idea, or start a task.</p><div>{['Review a design', 'Plan a feature', 'Summarize changes'].map(prompt => <button type="button" key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}</div></div>}</div>
      <div className="ui-ai-chat__composer"><Composer onSend={send} models={[{ id: 'Composer 2.5', label: 'Composer 2.5' }, { id: 'GPT-5.6 Sol', label: 'GPT-5.6 Sol' }, { id: 'Fable 5', label: 'Fable 5' }, { id: 'Sonnet 5', label: 'Sonnet 5' }, ...(['Composer 2.5', 'GPT-5.6 Sol', 'Fable 5', 'Sonnet 5'].includes(model) ? [] : [{ id: model, label: model }])]} selectedModel={currentModel} onModelChange={setCurrentModel} branch={branch} project={selectedThread?.project ?? workspaceName} agentLabel="Agent" contextPercent={57} onVoice={() => onAction?.('voice input')} /></div>
    </main>

    <ResizeHandle ref={resizeRef} className="ui-ai-chat__resize" aria-label="Workspace side panel" controls={panelId} primaryRef={inspectorRef} value={rightOpen?effectivePanelSize:0} minValue={0} minExpandedValue={240} maxValue={maximumPanelSize} unit="pixel" edge="end" step={10} isDisabled={compactPanel} onChange={resizePanel} onResizeStart={()=>setPanelResizing(true)} onResizeEnd={()=>setPanelResizing(false)} onToggle={()=>setRightOpen(open=>!open)} onReset={()=>{setPanelSize(panelDefaults.size);setRightOpen(true);}}/>
    {compactPanel && overlayPanelOpen && <button type="button" className="ui-ai-chat__panel-scrim" aria-label="Close side panel" tabIndex={-1} onClick={() => setOverlayPanelOpen(false)}/>}
    <aside id={panelId} ref={inspectorRef} role={compactPanel ? "dialog" : undefined} aria-modal={compactPanel && overlayPanelOpen || undefined} className="ui-ai-chat__inspector" aria-label="Workspace side panel" aria-hidden={compactPanel ? !overlayPanelOpen : !rightOpen} inert={compactPanel ? !overlayPanelOpen : !rightOpen}><div className="ui-ai-chat__tabs" role="tablist" aria-label="Side panel"><button type="button" role="tab" aria-selected={rightTab === 'changes'} onClick={() => setRightTab('changes')}><RiCodeSSlashLine size={16}/>Changes</button><button type="button" role="tab" aria-selected={rightTab === 'browser'} onClick={() => setRightTab('browser')}><RiGlobalLine size={16}/>Browser</button><button type="button" className="ui-ai-chat__close-panel" aria-label="Close side panel" onClick={closePanel}><RiLayoutRightLine size={17}/></button></div>{rightTab === 'changes' ? <><div className="ui-ai-chat__change-summary"><span>{changes.length} changed files</span><strong>+{additions}</strong><em>-{removals}</em></div><div className="ui-ai-chat__file-list"><Tree aria-label="Changed files" density="compact" variant="neutral" items={changes.map(change => ({id:change.id,label:change.path,leading:<RiFileCodeLine size={16}/>,trailing:<strong>+{change.added}</strong>}))} selectedKeys={selectedChange ? [selectedChange.id] : []} disallowEmptySelection onSelectionChange={keys => {if(keys[0])setSelectedChangeId(keys[0]);}}/></div><CodeBlock className="ui-ai-chat__code" code={selectedChange?.code ?? ''} label={selectedChange?.path ?? 'Changed file'} contentKey={selectedChange?.id} density="compact" variant="plain" lineNumbers wrap fill headerAction={<IconButton icon={RiExternalLinkLine} size="xs" variant="ghost" aria-label="Open changed file" onClick={() => onAction?.('open changed file')}/>}/></> : <div className="ui-ai-chat__browser"><div className="ui-ai-chat__browser-toolbar"><span>‹</span><span>›</span><span>↻</span><strong>{browserPreview.url}</strong><button type="button" aria-label="Open browser preview" onClick={() => onAction?.('open browser preview')}><RiExternalLinkLine size={15}/></button></div><div className="ui-ai-chat__browser-page"><span className="ui-ai-chat__browser-symbol"><BrandMark size={32}/></span><strong>{browserPreview.title}</strong><h2>{browserPreview.heading}</h2><p>{browserPreview.description}</p><button type="button" onClick={() => onAction?.('browser preview action')}>{browserPreview.actionLabel} <RiArrowRightSLine size={16}/></button></div></div>}</aside>
  </div>;
}
