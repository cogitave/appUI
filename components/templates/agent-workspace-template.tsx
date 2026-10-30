'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { RiAddLine, RiArrowDownSLine, RiChat1Line, RiEditLine, RiFolder3Line, RiHistoryLine, RiSidebarFoldLine, RiSidebarUnfoldLine, RiOpenaiFill, RiClaudeFill, RiGeminiFill, RiSearchLine, RiSettings4Line, RiTerminalBoxLine, RiTeamLine } from '@remixicon/react';
import { CommandPalette } from '@/components/blocks/command-palette/command-palette';
import type { CommandItem } from '@/components/base/command-menu/command-menu';
import { WorkspaceTabs, type WorkspaceTab, type WorkspaceTabsProps } from '@/components/blocks/workspace-tabs/workspace-tabs';
import { Conversation } from '@/components/blocks/conversation/conversation';
import { Composer } from '@/components/blocks/composer/composer';
import { Message } from '@/components/blocks/message/message';
import { MessageActions } from '@/components/blocks/message-actions/message-actions';
import { ActivityFeed, type ActivityEntry } from '@/components/blocks/activity-feed/activity-feed';
import { TeamMembers, type TeamMember, type TeamInvitation } from '@/components/blocks/team-members/team-members';
import { SettingsModal, type SettingsValues } from '@/components/blocks/settings-modal/settings-modal';
import { IconButton } from '@/components/base/buttons/icon-button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Drawer } from '@/components/base/drawer/drawer';
import { Dialog } from '@/components/base/dialog/dialog';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { ResizeHandle } from '@/components/base/split-pane/split-pane';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { ThemeSwitch } from '@/components/base/theme-switch/theme-switch';
import { FolderIcon } from '@/components/base/tree/folder-icon';
import { BrandMark } from '@/components/foundations/brand-mark';
import { useElementSize } from '@/hooks/use-element-size';
import { cx } from '@/utils/cx';

export type AgentWorkspaceMessage={id:string;role:'user'|'assistant'|'system';text:string;points?:string[]};
export type AgentWorkspaceHarness='codex'|'claude-code'|'gemini-cli'|'appui';
export type AgentWorkspaceThread={id:string;title:string;project:string;harness?:AgentWorkspaceHarness;messages:AgentWorkspaceMessage[]};
const harnesses={codex:{label:'Codex',icon:RiOpenaiFill},'claude-code':{label:'Claude Code',icon:RiClaudeFill},'gemini-cli':{label:'Gemini CLI',icon:RiGeminiFill}};
function HarnessIcon({harness='appui'}:{harness?:AgentWorkspaceHarness}) {
  const entry=harness==='appui'?null:harnesses[harness],Icon=entry?.icon;
  return <span className="ui-agent-workspace__harness" data-harness={harness} role="img" aria-label={entry?.label??'appUI'} title={entry?.label??'appUI'}>{Icon?<Icon aria-hidden/>:<BrandMark size={18}/>}</span>;
}
export type AgentWorkspaceTemplateProps={
  initialThreads?:AgentWorkspaceThread[];
  initialMembers?:TeamMember[];
  onMembersChange?:(members:TeamMember[])=>void;
  initialOpenIds?:string[];
  defaultSelectedId?:string;
  workspaceName?:string;
  terminalOutput?:string;
  defaultTerminalOpen?:boolean;
  defaultNavigationOpen?:boolean;
  defaultTerminalHeight?:number;
  tabVariant?:WorkspaceTabsProps['variant'];
  density?:WorkspaceTabsProps['density'];
  height?:number|string;
  onSend?:(message:string,threadId:string)=>void;
  onThreadsChange?:(threads:AgentWorkspaceThread[])=>void;
  onAction?:(action:string)=>void;
  className?:string;
};
const sampleThreads:AgentWorkspaceThread[]=[
  {id:'terminal',harness:'codex',title:'Terminal panel resize',project:'Studio app',messages:[{id:'request',role:'user',text:'Review the terminal panel and keep the composer usable at small widths.'},{id:'response',role:'assistant',text:'Here is the plan for the workspace:',points:['Keep the conversation in the main content area.','Let the terminal resize without stretching its text.','Use a contained drawer on narrow or short screens.']}]},
  {id:'navigation',harness:'claude-code',title:'Sidebar keyboard navigation',project:'Studio app',messages:[{id:'request',role:'user',text:'Check keyboard navigation in the sidebar.'},{id:'response',role:'assistant',text:'Use the same focus behavior for project groups, conversation links and open tabs. Keep each control available when the layout changes.'}]},
  {id:'onboarding',harness:'gemini-cli',title:'Explore the next onboarding flow',project:'Studio app',messages:[{id:'request',role:'user',text:'Sketch a shorter onboarding flow.'},{id:'response',role:'assistant',text:'Start with the workspace name, invite the team when needed, then open the first useful task.'}]},
  {id:'transcript',harness:'codex',title:'Investigate a long conversation that needs a clearer reading rhythm',project:'Research',messages:[{id:'request',role:'user',text:'Review the reading rhythm in long conversations.'},{id:'response',role:'assistant',text:'Keep a stable text scale and line height. Constrain the reading width on the layout and let the composer use all the space supplied by that layout.'}]},
  {id:'release',harness:'codex',title:'Release checklist',project:'Research',messages:[{id:'request',role:'user',text:'What should we verify before release?'},{id:'response',role:'assistant',text:'Check the actual installed package, keyboard actions, responsive surfaces and the finished motion states.'}]},
];
const sampleOutput='studio@workspace ~\n$ pnpm run build\n\n✓ Type checking completed\n✓ Production bundle created\n✓ Workspace checks passed\n\nReady for the next task.';
type NavigationView='conversations'|'projects'|'activity';

/** A multi-panel workspace using appUI conversation, tabs, drawers and splitters. */
export function AgentWorkspaceTemplate({initialMembers,onMembersChange,initialThreads=sampleThreads,initialOpenIds,defaultSelectedId,workspaceName='Studio workspace',terminalOutput=sampleOutput,defaultTerminalOpen=false,defaultNavigationOpen=true,defaultTerminalHeight=220,tabVariant='card',density='comfortable',height,onSend,onThreadsChange,onAction,className}:AgentWorkspaceTemplateProps) {
  const [threads,setThreads]=useState(initialThreads),threadsRef=useRef(threads);
  const [openIds,setOpenIds]=useState(()=>{return [...new Set((initialOpenIds??initialThreads.slice(0,3).map(thread=>thread.id)).filter(id=>initialThreads.some(thread=>thread.id===id)))];});
  const [selected,setSelected]=useState(defaultSelectedId&&openIds.includes(defaultSelectedId)?defaultSelectedId:openIds[0]??null);
  const [drafts,setDrafts]=useState<Record<string,string>>({});
  const [query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[view,setView]=useState<NavigationView>('conversations'),[collapsedProjects,setCollapsedProjects]=useState<string[]>([]);
  const [navigationOpen,setNavigationOpen]=useState(defaultNavigationOpen),[navigationDrawer,setNavigationDrawer]=useState(false);
  const [terminalOpen,setTerminalOpen]=useState(defaultTerminalOpen),[terminalHeight,setTerminalHeight]=useState(Number.isFinite(defaultTerminalHeight)?Math.max(120,defaultTerminalHeight):220),[terminalResizing,setTerminalResizing]=useState(false);
  const [teamOpen,setTeamOpen]=useState(false),[members,setMembers]=useState<TeamMember[]>(initialMembers??[{id:'maya',name:'Maya Chen',email:'maya@studio.co',roleId:'admin',isOwner:true,avatar:publicPath("/avatars/studio-portrait.png")},{id:'daniel',name:'Daniel Park',email:'daniel@studio.co',roleId:'member',avatarColor:'blue'},{id:'noor',name:'Noor Ali',email:'noor@studio.co',roleId:'viewer',avatarColor:'lime'}]);
  const membersRef=useRef(members);membersRef.current=members;
  const [settingsOpen,setSettingsOpen]=useState(false),[savedSettings,setSavedSettings]=useState<SettingsValues|null>(null);
  const [renameId,setRenameId]=useState<string|null>(null),[renameDraft,setRenameDraft]=useState('');
  const [activity,setActivity]=useState<ActivityEntry[]>([]);
  const {ref:root,width,height:measuredHeight}=useElementSize<HTMLDivElement>(1200,760);
  const compact=width<900,terminalAsDrawer=width<700||measuredHeight<540;
  const sequence=useRef(0),inputFocus=useRef<string|null>(null),renameTitle=useRef('');
  const navigationTrigger=useRef<HTMLButtonElement>(null),terminalTrigger=useRef<HTMLButtonElement>(null),terminalPane=useRef<HTMLDivElement>(null),terminalHandle=useRef<HTMLDivElement>(null);
  const navigationPane=useRef<HTMLElement>(null),lastFocus=useRef<HTMLElement|null>(null);
  const navigationId=useId(),terminalId=useId();
  const navigationVisible=compact?navigationDrawer:navigationOpen;
  const name=savedSettings?.workspaceName??workspaceName;
  const selectedThread=threads.find(thread=>thread.id===selected);
  const projects=[...new Set(threads.map(thread=>thread.project))];
  const filtered=threads;
  const maximumTerminalHeight=Math.max(120,Math.min(480,measuredHeight-240));
  const effectiveTerminalHeight=Math.min(maximumTerminalHeight,Math.max(terminalResizing?0:120,terminalHeight));
  const tabs:WorkspaceTab[]=openIds.flatMap(id=>{const thread=threads.find(item=>item.id===id);return thread?[{id,title:thread.title,leading:<HarnessIcon harness={thread.harness}/>,isDirty:Boolean(drafts[id]?.trim())}]:[];});
  useEffect(()=>{if(!compact)setNavigationDrawer(false);},[compact]);
  useLayoutEffect(()=>{if(compact&&lastFocus.current&&navigationPane.current?.contains(lastFocus.current))navigationTrigger.current?.focus({preventScroll:true});},[compact]);
  useEffect(()=>{
    if(inputFocus.current!==selected)return;
    const frame=requestAnimationFrame(()=>{const textarea=root.current?.querySelector<HTMLTextAreaElement>('.ui-workspace-tabs__panel:not([data-exiting]) textarea');if(textarea){textarea.focus({preventScroll:true});inputFocus.current=null;}});
    return()=>cancelAnimationFrame(frame);
  },[selected]);
  function replaceMembers(next:TeamMember[]){membersRef.current=next;setMembers(next);onMembersChange?.(next);}
  function addMember(draft:TeamInvitation){const id=draft.email.toLowerCase();if(membersRef.current.some(member=>member.email?.toLowerCase()===id))throw new Error('A member with this email already exists.');replaceMembers([...membersRef.current,{...draft,id,status:'invited'}]);record('Workspace member added');onAction?.('Member added to this local workspace.');}
  function replaceThreads(next:AgentWorkspaceThread[]){threadsRef.current=next;setThreads(next);onThreadsChange?.(next);}
  function record(title:string,threadId?:string){setActivity(current=>[{id:`activity-${++sequence.current}`,title,time:'Just now',group:'This session',icon:RiHistoryLine,action:threadId?{label:'Open',onPress:()=>openThread(threadId)}:undefined},...current].slice(0,40));}
  function openThread(id:string){setOpenIds(current=>current.includes(id)?current:[...current,id]);setSelected(id);setNavigationDrawer(false);onAction?.('Conversation opened.');}
  function nextId(kind:'thread'|'message'){const existing=new Set(threadsRef.current.flatMap(thread=>kind==='thread'?[thread.id]:thread.messages.map(message=>message.id)));let id:string;do{id=`${navigationId}-${kind}-${++sequence.current}`;}while(existing.has(id));return id;}
  function createThread(){const id=nextId('thread'),thread={id,title:'New conversation',project:selectedThread?.project??projects[0]??'Workspace',harness:selectedThread?.harness??'appui',messages:[]};replaceThreads([...threadsRef.current,thread]);setOpenIds(current=>[...current,id]);setSelected(id);inputFocus.current=id;setNavigationDrawer(false);record('New conversation opened',id);onAction?.('New conversation opened.');}
  function send(message:string,id:string){const messageId=nextId('message');replaceThreads(threadsRef.current.map(thread=>thread.id===id?{...thread,messages:[...thread.messages,{id:messageId,role:'user',text:message}]}:thread));record('Message added to conversation',id);onSend?.(message,id);onAction?.('Message added.');}
  function closeThread(id:string){setOpenIds(current=>current.filter(item=>item!==id));onAction?.('Tab closed. Its conversation and draft are kept in the sidebar.');}
  function toggleNavigation(){if(compact)setNavigationDrawer(current=>!current);else {if(navigationOpen&&navigationPane.current?.contains(document.activeElement))navigationTrigger.current?.focus({preventScroll:true});setNavigationOpen(current=>!current);}}
  function chooseView(next:NavigationView){setView(next);if(compact)setNavigationDrawer(true);else setNavigationOpen(true);}
  function closeTerminal(){if(terminalPane.current?.contains(document.activeElement)||terminalHandle.current?.contains(document.activeElement))terminalTrigger.current?.focus({preventScroll:true});setTerminalOpen(false);}
  function resizeTerminal(next:number){if(next===0)closeTerminal();else {setTerminalHeight(next);setTerminalOpen(true);}}
  function beginRename(){if(!selectedThread)return;renameTitle.current=selectedThread.title;setRenameDraft(selectedThread.title);setRenameId(selectedThread.id);}
  function rename(){const title=renameDraft.trim();if(!title||!renameId)return;replaceThreads(threadsRef.current.map(thread=>thread.id===renameId?{...thread,title}:thread));record('Conversation renamed',renameId);setRenameId(null);onAction?.('Conversation renamed.');}
  function openSearch(){setQuery('');setSearchOpen(true);}
  const commands:CommandItem[]=[...threads.map((thread,index)=>({id:`chat:${thread.id}`,label:thread.title,group:'Chats',keywords:[thread.project],leading:<HarnessIcon harness={thread.harness}/>,trailing:<span className="ui-agent-workspace__search-project">{thread.project}</span>,shortcut:index<9?[`Alt+${index+1}`]:undefined,onAction:()=>openThread(thread.id)})),{id:'new',label:'New chat',group:'Quick actions',leading:<RiEditLine/>,shortcut:['Ctrl+N'],onAction:createThread},{id:'projects',label:'Browse projects',group:'Quick actions',leading:<RiFolder3Line/>,onAction:()=>chooseView('projects')},{id:'team',label:'Team members',group:'Quick actions',leading:<RiTeamLine/>,onAction:()=>{setNavigationDrawer(false);setTeamOpen(true);}},{id:'settings',label:'Workspace settings',group:'Quick actions',leading:<RiSettings4Line/>,onAction:()=>{setNavigationDrawer(false);setSettingsOpen(true);}}];
  useEffect(()=>{function keydown(event:globalThis.KeyboardEvent){const inWorkspace=root.current?.contains(document.activeElement)||root.current?.closest('.live-template')||searchOpen;const overlay=document.activeElement?.closest('.ui-modal-overlay');if(!inWorkspace||event.defaultPrevented||event.isComposing||overlay&&!overlay.querySelector('.ui-agent-workspace__search-palette,.ui-agent-workspace__navigation-drawer'))return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!searchOpen)setQuery('');setSearchOpen(current=>!current);}else if(searchOpen&&event.altKey&&/^[1-9]$/.test(event.key)){const thread=threads[Number(event.key)-1];if(thread){event.preventDefault();setSearchOpen(false);openThread(thread.id);}}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='n'){event.preventDefault();setSearchOpen(false);createThread();}}document.addEventListener('keydown',keydown);return()=>document.removeEventListener('keydown',keydown);},[threads,searchOpen,selectedThread,compact]);
  const navigation=(instance:'inline'|'drawer')=><div className="ui-agent-workspace__navigation-content">
    <div className="ui-agent-workspace__identity"><strong>{name}</strong><Tooltip content="Search chats (Ctrl/⌘K)"><IconButton icon={RiSearchLine} variant="ghost" size="small" aria-label="Search chats" onClick={openSearch}/></Tooltip></div>
    <Button variant="quiet" size="small" leadingIcon={RiEditLine} onClick={createThread}>New conversation</Button>
    <ScrollArea label="Workspace navigation" className="ui-agent-workspace__navigation-scroll">
      {view==='activity'?<ActivityFeed items={activity} label="Session activity" density="compact" variant="soft" emptyTitle="No activity yet" emptyDescription="New conversations, messages and changes appear here."/>:<nav aria-label={view==='projects'?'Workspace projects':'Workspace conversations'} className="ui-agent-workspace__project-list">
        <h2>{view==='projects'?'Projects':'Conversations'}</h2>
        {projects.filter(project=>filtered.some(thread=>thread.project===project)).map(project=>{const expanded=!collapsedProjects.includes(project),id=`${navigationId}-${instance}-project-${encodeURIComponent(project)}`;return <section key={project} className="ui-agent-workspace__project">
          <Button variant="quiet" size="small" className="ui-agent-workspace__project-toggle" aria-expanded={expanded} aria-controls={id} onClick={()=>setCollapsedProjects(current=>current.includes(project)?current.filter(item=>item!==project):[...current,project])}><FolderIcon isOpen={expanded}/><span>{project}</span><RiArrowDownSLine className="ui-agent-workspace__chevron" aria-hidden/></Button>
          <Collapsible id={id} isOpen={expanded}><ul>{filtered.filter(thread=>thread.project===project).map(thread=><li key={thread.id}><Tooltip content={thread.title} isDisabled={!expanded||(instance==='inline'&&(compact||!navigationOpen))||(instance==='drawer'&&(!compact||!navigationDrawer))}><Button variant="quiet" size="small" className="ui-agent-workspace__thread" data-selected={thread.id===selected||undefined} aria-label={thread.title} aria-current={thread.id===selected?'page':undefined} onClick={()=>openThread(thread.id)}><HarnessIcon harness={thread.harness}/><span>{thread.title}</span></Button></Tooltip></li>)}</ul></Collapsible>
        </section>;})}
        {!filtered.length&&<p className="ui-agent-workspace__no-results">No conversations found. Try another search.</p>}
      </nav>}
    </ScrollArea>
    <div className="ui-agent-workspace__navigation-footer"><ThemeSwitch/><Button variant="quiet" size="small" leadingIcon={RiSettings4Line} onClick={()=>{setNavigationDrawer(false);setSettingsOpen(true);}}>Settings</Button></div>
  </div>;
  const terminal=<CodeBlock code={terminalOutput} label="Workspace terminal" language="shell" variant="plain" density="compact" fill showCopy wrap={false}/>;
  const terminalArea=<>
    <div ref={terminalHandle} className="ui-agent-workspace__terminal-resize" data-open={terminalOpen&&!terminalAsDrawer||undefined} inert={!terminalOpen||terminalAsDrawer}><ResizeHandle value={terminalOpen?effectiveTerminalHeight:0} minValue={0} minExpandedValue={120} maxValue={maximumTerminalHeight} unit="pixel" step={10} orientation="vertical" edge="end" controls={terminalId} primaryRef={terminalPane} aria-label="Terminal height" onChange={resizeTerminal} onResizeStart={()=>setTerminalResizing(true)} onResizeEnd={()=>setTerminalResizing(false)} onToggle={()=>terminalOpen?closeTerminal():setTerminalOpen(true)} onReset={()=>setTerminalHeight(Math.min(220,maximumTerminalHeight))}/></div>
    <div ref={terminalPane} id={terminalAsDrawer?`${terminalId}-inline`:terminalId} className="ui-agent-workspace__terminal" data-open={terminalOpen&&!terminalAsDrawer||undefined} data-resizing={terminalResizing||undefined} inert={!terminalOpen||terminalAsDrawer} aria-hidden={!terminalOpen||terminalAsDrawer} style={{height:terminalOpen&&!terminalAsDrawer?effectiveTerminalHeight:0}}><div className="ui-agent-workspace__terminal-inner"><header><span><RiTerminalBoxLine aria-hidden/>Terminal</span><CloseButton size="xs" aria-label="Close terminal panel" onClick={closeTerminal}/></header>{terminal}</div></div>
  </>;
  function panel(tab:WorkspaceTab){const thread=threads.find(item=>item.id===tab.id);if(!thread)return null;return <>
    <header className="ui-agent-workspace__thread-header"><div><RiFolder3Line aria-hidden/><span>{thread.project}</span><span aria-hidden>/</span><strong>{thread.title}</strong></div><div>
      <Tooltip content="Rename conversation"><IconButton icon={RiEditLine} variant="ghost" size="small" aria-label="Rename conversation" onClick={beginRename}/></Tooltip>

    </div></header>
    <Conversation label={thread.title} conversationKey={thread.id} className="ui-agent-workspace__conversation" contentClassName="ui-agent-workspace__messages" footer={<div className="ui-agent-workspace__composer-layout"><Composer value={drafts[tab.id]??''} onChange={value=>setDrafts(current=>({...current,[tab.id]:value}))} onSend={message=>send(message,tab.id)} branch="Main" project={thread.project} agentLabel="Agent" contextPercent={57}/></div>}>
      {thread.messages.length?thread.messages.map(message=><Message key={message.id} role={message.role} className="ui-agent-workspace__message" actions={message.role==='assistant'?<MessageActions content={[message.text,...message.points??[]].join('\n')} showFeedback/>:undefined}><p>{message.text}</p>{message.points&&<ul>{message.points.map((point,index)=><li key={index}>{point}</li>)}</ul>}</Message>):<div className="ui-agent-workspace__welcome"><BrandMark size={36}/><h2>What shall we work on?</h2><p>Ask about the project or start a new task.</p><Button variant="secondary" onClick={()=>setDrafts(current=>({...current,[tab.id]:'Review the project and suggest the next useful task.'}))}>Review the project</Button></div>}
    </Conversation>
  </>;}
  return <div ref={root} onFocusCapture={event=>{lastFocus.current=event.target as HTMLElement;}} onBlurCapture={event=>{if(event.relatedTarget instanceof HTMLElement&&event.relatedTarget!==document.body&&event.relatedTarget!==document.documentElement&&!event.currentTarget.contains(event.relatedTarget))lastFocus.current=null;}} className={cx('ui-agent-workspace',className)} data-compact={compact||undefined} data-small={width<600||undefined} data-navigation-closed={!navigationOpen||undefined} style={{'--agent-workspace-height':typeof height==='number'?(Number.isFinite(height)?`${Math.max(0,height)}px`:undefined):height} as CSSProperties}>
    <nav id={`${navigationId}-rail`} className="ui-agent-workspace__rail" aria-label="Workspace sections">
      <div className="ui-agent-workspace__rail-top"><Tooltip placement="right" content={navigationVisible?'Collapse workspace sidebar':'Expand workspace sidebar'}><IconButton ref={navigationTrigger} icon={navigationVisible?RiSidebarFoldLine:RiSidebarUnfoldLine} iconKey={navigationVisible?'navigation-open':'navigation-closed'} variant="ghost" size="small" aria-label={navigationVisible?'Collapse workspace sidebar':'Expand workspace sidebar'} aria-controls={navigationId} aria-expanded={navigationVisible} onClick={toggleNavigation}/></Tooltip></div>
      <div className="ui-agent-workspace__rail-sections"><Collapsible isOpen={!navigationOpen||compact} className="ui-agent-workspace__rail-search"><Tooltip placement="right" content="Search chats (Ctrl/⌘K)" isDisabled={navigationOpen&&!compact}><IconButton icon={RiSearchLine} variant="ghost" size="small" aria-label="Search chats" onClick={openSearch}/></Tooltip></Collapsible>{([{id:'conversations',label:'Conversations',icon:RiChat1Line},{id:'projects',label:'Projects',icon:RiFolder3Line},{id:'activity',label:'Activity',icon:RiHistoryLine}] as const).map(item=><Tooltip key={item.id} content={item.label}><IconButton icon={item.icon} variant="ghost" size="small" aria-label={item.label} aria-pressed={view===item.id} onClick={()=>chooseView(item.id)}/></Tooltip>)}</div>
      <Tooltip placement="right" content="Settings"><IconButton icon={RiSettings4Line} variant="ghost" size="small" aria-label="Workspace settings" onClick={()=>setSettingsOpen(true)}/></Tooltip>
    </nav>
    <aside ref={navigationPane} id={compact?`${navigationId}-inline`:navigationId} className="ui-agent-workspace__navigation" aria-label="Workspace navigation" inert={compact||!navigationOpen} aria-hidden={compact||!navigationOpen}>{navigation('inline')}</aside>
    <main className="ui-agent-workspace__main">
      <WorkspaceTabs items={tabs} label="Open conversations" selectedId={selected} onSelectionChange={id=>{setSelected(id);onAction?.('Conversation selected.');}} onClose={closeThread} onNewTab={createThread} newTabLabel="New conversation tab" variant={tabVariant} density={density} className="ui-agent-workspace__tabs" toolbarTrailing={<div className="ui-agent-workspace__toolbar-actions"><Tooltip content="Team members"><IconButton icon={RiTeamLine} variant="ghost" size="small" aria-label="Team members" onClick={()=>setTeamOpen(true)}/></Tooltip><Tooltip content={terminalOpen?'Close terminal':'Open terminal'}><IconButton ref={terminalTrigger} icon={RiTerminalBoxLine} variant="ghost" size="small" aria-label={terminalOpen?'Close terminal':'Open terminal'} aria-controls={terminalId} aria-expanded={terminalOpen} onClick={()=>terminalOpen?closeTerminal():setTerminalOpen(true)}/></Tooltip></div>} footer={terminalArea} renderPanel={panel} empty={<div className="ui-agent-workspace__welcome"><BrandMark size={36}/><h2>Open a conversation</h2><p>Your projects and drafts are kept in the sidebar.</p><Button onClick={createThread} leadingIcon={RiAddLine}>New conversation</Button></div>}/>
    </main>
    <CommandPalette title="Search chats" hideHeader isOpen={searchOpen} onOpenChange={setSearchOpen} items={commands} label="Workspace chats" placeholder="Search chats" value={query} onValueChange={setQuery} density="compact" className="ui-agent-workspace__search-palette"/>
    <Drawer title="Workspace navigation" side="start" isOpen={compact&&navigationDrawer} onOpenChange={setNavigationDrawer} className="ui-agent-workspace__navigation-drawer"><div id={navigationId}>{navigation('drawer')}</div></Drawer>
    <Drawer title="Workspace terminal" side="bottom" isOpen={terminalAsDrawer&&terminalOpen} onOpenChange={setTerminalOpen} className="ui-agent-workspace__terminal-drawer"><div id={terminalAsDrawer?terminalId:undefined} className="ui-agent-workspace__terminal-drawer-content">{terminal}</div></Drawer>
    <Dialog title="Workspace team" description="Invite people and manage their workspace roles." className="ui-agent-workspace__team-dialog" isOpen={teamOpen} onOpenChange={setTeamOpen} size="wide"><TeamMembers members={members} currentUserId="maya" variant="plain" layout="table" showHeader={false} onInvite={addMember} onRoleChange={(id,roleId)=>{replaceMembers(membersRef.current.map(member=>member.id===id?{...member,roleId}:member));record('Member role saved');}} onRemove={id=>{replaceMembers(membersRef.current.filter(member=>member.id!==id));record('Workspace member removed');}}/></Dialog>
    <SettingsModal isOpen={settingsOpen} onClose={()=>setSettingsOpen(false)} workspaceName={name} name="Maya Chen" email="maya@studio.co" onSave={values=>{setSavedSettings(values);record('Workspace settings saved');onAction?.('Workspace settings saved.');}}/>
    <Dialog title="Rename conversation" description={renameTitle.current} isOpen={renameId!==null} onOpenChange={open=>{if(!open)setRenameId(null);}} footer={<><Button variant="secondary" onClick={()=>setRenameId(null)}>Cancel</Button><Button type="submit" form={`${navigationId}-rename`} disabled={!renameDraft.trim()}>Save name</Button></>}><form id={`${navigationId}-rename`} onSubmit={event=>{event.preventDefault();rename();}}><Input label="Conversation name" value={renameDraft} onChange={setRenameDraft} isRequired maxLength={120}/></form></Dialog>
  </div>;
}
