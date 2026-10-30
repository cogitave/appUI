'use client';

import { useEffect, useRef, useState } from 'react';
import { RiAddLine, RiArrowDownSLine, RiChatAiLine, RiFileCopyLine, RiHeadphoneLine, RiMenuLine, RiMoreLine, RiSearchLine, RiSettings4Line, RiStore2Line } from '@remixicon/react';
import { AgentCreator, type AgentIdentity } from '@/components/blocks/agent-creator/agent-creator';
import { AgentAvatar, type AgentShape } from '@/components/blocks/agent-creator/agent-avatar';
import { ComposerPanel, type ComposerPermission } from '@/components/blocks/composer-panel/composer-panel';
import {Conversation} from '@/components/blocks/conversation/conversation';
import {Message as ChatMessage} from '@/components/blocks/message/message';
import {MessageActions,type MessageFeedback} from '@/components/blocks/message-actions/message-actions';
import {Drawer} from '@/components/base/drawer/drawer';
import {CloseButton} from '@/components/base/buttons/close-button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useMediaQuery, TEMPLATE_NAV_QUERY, TEMPLATE_PANEL_QUERY } from '@/hooks/use-media-query';
import { usePanelFocus } from '@/hooks/use-panel-focus';
import { cx } from '@/utils/cx';

export type AgentInfo = { id: string; name: string; description: string; initials: string; color: string; shape?: AgentShape; prompt?: string; response?: string };
const defaultAgents: AgentInfo[] = [
  { id: 'design', name: 'Landing page designer', description: 'Layouts and interactions', initials: 'LD', color: '#a3d5c3', shape: 'pocket', prompt: 'How can we make the landing page clearer?', response: 'Start with one clear action and a short explanation of what the product helps people do. Place a useful product preview beside it.\n\nThen show three benefits with concrete examples, so the next step feels easy to understand.' },
  { id: 'content', name: 'Content reviewer', description: 'Words that help people get started', initials: 'CR', color: '#efc499', shape: 'slender' },
  { id: 'marketing', name: 'Marketing assistant', description: 'Campaign ideas and useful experiments', initials: 'MA', color: '#a5dbe0', shape: 'star' },
  { id: 'seo', name: 'SEO assistant', description: 'Helpful content, clear structure', initials: 'SA', color: '#b7a0ed', shape: 'flower' },
  { id: 'research', name: 'Research assistant', description: 'Evidence and customer interviews', initials: 'RA', color: '#f3dd9d', shape: 'petal' },
  { id: 'security', name: 'Security agent', description: 'Review access, privacy and permissions', initials: 'SE', color: '#afe1e6', shape: 'shield' },
  { id: 'cloud', name: 'Cloud engineer', description: 'Infrastructure and reliable deployments', initials: 'CE', color: '#f3bca5', shape: 'cloud' },
];
type Message = { id: string; role: 'user' | 'assistant'; text: string };
function identityFor(agent: AgentInfo): AgentIdentity { return { name: agent.name, label: agent.initials, description: agent.description, shape: agent.shape ?? 'cloud', color: agent.color, emotion: 'Thinking', language: 'Auto-detect', voice: 'System voice', notifications: true }; }

export function MultiAgentChatWorkspace({ agentList = defaultAgents, onSend, onAction, className }: { agentList?: AgentInfo[]; onSend?: (message: string, agentIds: string[]) => void; onAction?: (action: string) => void; className?: string }) {
  const [agents, setAgents] = useState(agentList);
  const [selectedId, setSelectedId] = useState(agentList[0]?.id ?? '');
  const [threads, setThreads] = useState<Record<string, Message[]>>(() => Object.fromEntries(agentList.map(agent => [agent.id, agent.prompt && agent.response ? [{ id: 'intro-user', role: 'user', text: agent.prompt }, { id: 'intro-agent', role: 'assistant', text: agent.response }] : []])));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [identities, setIdentities] = useState<Record<string, AgentIdentity>>(() => Object.fromEntries(agentList.map(agent => [agent.id, identityFor(agent)])));
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSession,setEditorSession]=useState<{id:string;creating:boolean;generation:number;value:AgentIdentity}|null>(null);
  const [feedback, setFeedback] = useState<Record<string, MessageFeedback>>({});
  const [permission, setPermission] = useState<ComposerPermission>('bypass');
  const compactNav = useMediaQuery(TEMPLATE_NAV_QUERY);
  const compactEditor = useMediaQuery(TEMPLATE_PANEL_QUERY);
  const navRef = useRef<HTMLElement>(null);
  usePanelFocus(compactNav && navOpen, navRef, () => setNavOpen(false));
  useEffect(() => { if (!compactNav) setNavOpen(false); }, [compactNav]);
  const current = agents.find(agent => agent.id === selectedId);
  const identity = current ? identities[current.id] ?? identityFor(current) : undefined;
  const messages = threads[selectedId] ?? [];
  function send(text: string) { if (!current) return; setThreads(previous => ({ ...previous, [selectedId]: [...(previous[selectedId] ?? []), { id: crypto.randomUUID(), role: 'user', text }] })); onSend?.(text, [selectedId]); onAction?.('Message sent'); }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); onAction?.('Copied'); } catch { onAction?.('Copy is unavailable in this browser'); } }
  function openEditor(creating:boolean){setNavOpen(false);setEditorSession(previous=>({id:selectedId,creating,generation:(previous?.generation??0)+1,value:creating?{name:'New agent',label:'Agent',color:'#f3bca5',shape:'cloud',language:'Auto-detect',voice:'System voice',notifications:true}:identity??{name:'New agent',label:'Agent',color:'#f3bca5',shape:'cloud',language:'Auto-detect',voice:'System voice',notifications:true}}));setEditorOpen(true);}
  function saveAgent(next: AgentIdentity) { if(!editorSession)return;const id = editorSession.creating ? crypto.randomUUID() : editorSession.id; setIdentities(previous => ({ ...previous, [id]: next })); setAgents(previous => editorSession.creating ? [...previous, { id, name: next.name, description: next.description ?? '', initials: next.label, color: next.color, shape: next.shape }] : previous.map(agent => agent.id === id ? { ...agent, name: next.name, initials: next.label, description: next.description ?? '', color: next.color, shape: next.shape } : agent)); setSelectedId(id); setEditorOpen(false); }
  const modalOpen = (compactNav && navOpen) || (compactEditor && editorOpen);
  return <div className={cx('ui-multi-chat', className)} data-nav-open={navOpen || undefined} data-editor-open={editorOpen || undefined}>
    {compactNav && <button className="ui-multi-chat__scrim" data-visible={navOpen||undefined} inert={!navOpen} aria-hidden={!navOpen} aria-label="Close conversations" tabIndex={-1} onClick={() => setNavOpen(false)} />}
    <aside ref={navRef} className="ui-multi-chat__sidebar" role={compactNav ? 'dialog' : undefined} aria-modal={compactNav && navOpen || undefined} aria-label="Conversations" inert={compactNav && !navOpen || compactEditor && editorOpen}>
      <div className="ui-multi-chat__tools"><Tooltip content="Search conversations"><IconButton variant="ghost" icon={RiSearchLine} aria-label="Search conversations" onClick={() => setSearchOpen(open => !open)} /></Tooltip><Tooltip content="Agent library"><IconButton variant="ghost" icon={RiStore2Line} aria-label="Agent library" onClick={() => { setQuery(''); setSearchOpen(true); }} /></Tooltip><Button iconOnly leadingIcon={RiAddLine} aria-label="Create agent" onClick={()=>openEditor(true)} />{compactNav && <CloseButton size="xs" aria-label="Close conversations" onClick={()=>setNavOpen(false)}/>}</div>
      {searchOpen && <Input label="Search conversations" hideLabel value={query} onChange={setQuery} placeholder="Search conversations" autoFocus />}
      <nav className="ui-multi-chat__agents" aria-label="Agent conversations">{agents.filter(agent => `${agent.name} ${agent.description}`.toLowerCase().includes(query.toLowerCase())).map(agent => <button type="button" key={agent.id} aria-current={agent.id === selectedId ? 'page' : undefined} onClick={() => { setSelectedId(agent.id); setNavOpen(false); }}><AgentAvatar shape={agent.shape ?? 'cloud'} color={agent.color} /><span><strong>{agent.name}</strong><small>{threads[agent.id]?.at(-1)?.text ?? agent.description}</small></span></button>)}</nav>
      <footer><Button variant="ghost" leadingIcon={RiHeadphoneLine} onClick={() => onAction?.('Support selected')}>Support</Button><Button variant="ghost" leadingIcon={RiSettings4Line} onClick={()=>openEditor(false)}>Settings</Button><div className="ui-multi-chat__account"><span>S</span><div><strong>Studio team</strong><small>maya@studio.co</small></div><RiArrowDownSLine size={16} /></div></footer>
    </aside>
    <section className="ui-multi-chat__main" aria-label="Agent conversation" inert={modalOpen}>
      <header>{compactNav && <IconButton icon={RiMenuLine} aria-label="Open conversations" onClick={() => setNavOpen(true)} />}<button className="ui-multi-chat__current" type="button" onClick={()=>{if(editorOpen)setEditorOpen(false);else openEditor(false);}} aria-expanded={editorOpen}>{identity && <AgentAvatar shape={identity.shape} color={identity.color} />}{identity?.name ?? 'Choose an agent'}</button><span /><Tooltip content="Copy conversation"><IconButton size="xs" variant="ghost" icon={RiFileCopyLine} aria-label="Copy conversation" onClick={() => copy(messages.map(message => message.text).join('\n\n'))} /></Tooltip><Tooltip content="Edit agent"><IconButton size="xs" variant="ghost" icon={RiMoreLine} aria-label="Edit agent" onClick={()=>openEditor(false)} /></Tooltip></header>
      <Conversation label="Agent conversation" conversationKey={selectedId} className="ui-multi-chat__thread" contentClassName="ui-multi-chat__messages" footer={<ComposerPanel showStatus={false} value={drafts[selectedId]??''} onChange={text=>setDrafts(previous=>({...previous,[selectedId]:text}))} permission={permission} onPermissionChange={setPermission} onSend={send} onVoice={()=>onAction?.('Voice input selected')}/>}>{messages.length?<><span className="ui-multi-chat__day">Today</span>{messages.map(message=><ChatMessage key={message.id} role={message.role} name={message.role==='assistant'?identity?.name:undefined} avatar={message.role==='assistant'?<AgentAvatar shape={identity?.shape} color={identity?.color}/>:undefined} actions={message.role==='assistant'?<MessageActions content={message.text} showFeedback feedback={feedback[message.id]??null} onFeedbackChange={value=>setFeedback(previous=>({...previous,[message.id]:value}))} onCopy={()=>onAction?.('Copied')}/>:undefined}><p>{message.text}</p></ChatMessage>)}</>:<div className="ui-multi-chat__empty"><RiChatAiLine size={28}/><h2>{identity?`Talk with ${identity.name}`:'Create your first agent'}</h2><p>{identity?.description??'Give your assistant a name and a purpose.'}</p></div>}</Conversation>
    </section>
    {!compactEditor&&<aside className="ui-multi-chat__editor" aria-label="Agent settings" inert={!editorOpen} aria-hidden={!editorOpen}><CloseButton className="ui-multi-chat__close-editor" size="xs" aria-label="Close agent editor" onClick={()=>setEditorOpen(false)}/>{editorSession&&<AgentCreator key={editorSession.generation} defaultValue={editorSession.value} onSave={saveAgent}/>}</aside>}
    <Drawer title="Agent settings" className="ui-multi-chat__editor-drawer" isOpen={compactEditor&&editorOpen} onOpenChange={setEditorOpen} size="small">{editorSession&&<AgentCreator key={editorSession.generation} defaultValue={editorSession.value} onSave={saveAgent}/>}</Drawer>
  </div>;
}
