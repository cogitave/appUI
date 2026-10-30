'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { RiAddLine, RiArrowDownSLine, RiArrowRightSLine, RiBankLine, RiCalendarLine, RiChat1Line, RiChatAiLine, RiDashboardLine, RiFilter3Line, RiFolder3Line, RiHeartPulseLine, RiHome4Line, RiImageLine, RiMegaphoneLine, RiMenuLine, RiMore2Line, RiNotification3Line, RiSearchLine, RiSettings4Line, RiSparkling2Line, RiTaskLine, RiUser3Line } from '@remixicon/react';
import { Sidebar, type SidebarIdentity, type SidebarItem } from '@/components/blocks/sidebar/sidebar';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { StatCards, type StatCardItem } from '@/components/blocks/stat-cards/stat-cards';
import { NotificationCenter, type InboxNotification } from '@/components/blocks/notification-center/notification-center';
import { AreaChartCard, ComboChartCard, ContributionsCard, EarningsChartCard, FunnelChartCard, LineChartCard, OrdersChartCard, SankeyChartCard, SleepScoreCard, StageBarsCard, StepsCard } from '@/components/charts/chart-cards';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badge';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Button } from '@/components/base/buttons/button';
import { useMediaQuery, TEMPLATE_NAV_QUERY } from '@/hooks/use-media-query';
import { usePanelFocus } from '@/hooks/use-panel-focus';
import { cx } from '@/utils/cx';
import { ImageGenerationWorkspace } from './ai-image-generation-template';
import { ProjectBoardWorkspace } from './project-board-template';
import { CreateDialog, FinanceWorkspace, MarketingWorkspace, MedicalWorkspace } from './dashboard-workspaces';
import { ProfileWorkspace } from './profile-workspace';
import { ChatStarterWorkspace } from './chat-starter-workspace';
import { AgentWorkspaceSidebar } from './agent-workspace-sidebar';
import { MultiAgentChatWorkspace, type AgentInfo } from './multi-agent-chat-workspace';
export type { AgentInfo } from './multi-agent-chat-workspace';
import type { ColumnDef } from '@tanstack/react-table';

export type TemplateProps = { className?: string; onAction?: (action:string)=>void };
const workspace={name:'Studio workspace',initials:'S'};const user={name:'Maya Chen',initials:'MC',email:'maya@studio.co'};
const nav:SidebarItem[]=[{key:'home',label:'Home',icon:RiHome4Line,badge:152},{key:'board',label:'Project board',icon:RiTaskLine},{key:'marketing',label:'Marketing',icon:RiMegaphoneLine},{key:'calendar',label:'Calendar',icon:RiCalendarLine},{key:'finance',label:'Finance',icon:RiBankLine},{key:'medical',label:'Medical profile',icon:RiHeartPulseLine},{key:'chat',label:'AI chat',icon:RiChatAiLine},{key:'images',label:'Image generation',icon:RiImageLine},{key:'profile',label:'Profile',icon:RiUser3Line}];
function BrowserFrame({children,title='Workspace',className}:{children:ReactNode;title?:string;className?:string}){return <div className={cx('ui-template-browser',className)}><div className="ui-template-browser__chrome"><div className="ui-template-browser__lights"><i/><i/><i/></div><div className="ui-template-browser__tab"><span aria-hidden>◧</span>{title}</div><span className="ui-template-browser__new-tab">New tab</span><span className="ui-template-browser__add-tab" aria-hidden>+</span></div><div className="ui-template-browser__address"><span aria-hidden>‹ &nbsp;›</span><span>workspace.local / {title.toLowerCase().replaceAll(' ','-')}</span></div>{children}</div>}
const templateRouteByNav: Record<string, string> = { home: '/templates/home-dashboard', board: '/templates/project-board', marketing: '/templates/marketing-dashboard', calendar: '/components/calendar', finance: '/templates/finance-dashboard', medical: '/templates/medical-profile', chat: '/templates/ai-chat', images: '/templates/ai-image-generation', profile: '/templates/ai-profile' };
function Shell({children,selected='home',onAction,workspaceIdentity=workspace,userIdentity=user,items=nav,routes}:{children:ReactNode;selected?:string;onAction?:(action:string)=>void;workspaceIdentity?:SidebarIdentity;userIdentity?:SidebarIdentity;items?:SidebarItem[];routes?:Record<string,string>}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const compactNavigation = useMediaQuery(TEMPLATE_NAV_QUERY);
  const sidebarRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  usePanelFocus(compactNavigation && mobileOpen, sidebarRef, () => setMobileOpen(false));
  useEffect(() => { if (!compactNavigation) setMobileOpen(false); }, [compactNavigation]);
  return <div className="ui-template-shell" data-mobile-open={mobileOpen || undefined} data-sidebar-collapsed={sidebarCollapsed || undefined}>
    <IconButton icon={RiMenuLine} size="small" className="ui-template-mobile-toggle" aria-label={mobileOpen ? 'Close workspace menu' : 'Open workspace menu'} aria-expanded={mobileOpen} onClick={() => { setSidebarCollapsed(false); setMobileOpen(open => !open); }}/>
    {mobileOpen && <button type="button" className="ui-template-mobile-scrim" aria-label="Close workspace menu" tabIndex={-1} onClick={() => setMobileOpen(false)}/>}
    <Sidebar ref={sidebarRef} role={compactNavigation ? 'dialog' : undefined} aria-modal={compactNavigation && mobileOpen || undefined} workspace={workspaceIdentity} user={userIdentity} items={items} secondaryItems={[{key:'support',label:'Support',icon:RiChat1Line},{key:'settings',label:'Settings',icon:RiSettings4Line}]} collapsed={sidebarCollapsed} showThemeSwitch onCollapsedChange={collapsed => { if (compactNavigation) setMobileOpen(false); else setSidebarCollapsed(collapsed); }} selectedKey={selected} onSelectionChange={key => {
      setMobileOpen(false);
      const route = routes?.[key] ?? templateRouteByNav[key];
      if (pathname.startsWith('/templates/') && route) {
        if (pathname !== route.split('#')[0] || route.includes('#')) router.push(route);
        return;
      }
      onAction?.(key);
    }} onUserClick={() => onAction?.('account')}/>
    <main className="ui-template-main" inert={compactNavigation && mobileOpen}>{children}</main>
  </div>;
}
function Head({title,subtitle,action,onAction}:{title:string;subtitle?:string;action?:string;onAction?:()=>void}){return <header className="ui-template-head"><div><span>{subtitle}</span><h2>{title}</h2></div>{action&&<Button size="small" leadingIcon={RiAddLine} onClick={onAction}>{action}</Button>}</header>}
const stats:StatCardItem[]=[{id:'balance',label:'Total balance',value:'$84,230',change:3.2,color:'blue',icon:RiBankLine},{id:'income',label:'Income',value:'$18,420',change:6.1,color:'violet',icon:RiDashboardLine},{id:'expense',label:'Expenses',value:'$9,140',change:-2.4,color:'orange',icon:RiFolder3Line},{id:'invested',label:'Invested',value:'$32,400',change:8.4,color:'pink',icon:RiSparkling2Line}];
const notices:InboxNotification[]=[{id:'1',category:'mentions',title:'Maya mentioned you',description:'Please review the new project brief.',time:'4m ago',unread:true,avatar:{alt:'Maya',initials:'MC'}},{id:'2',category:'system',title:'Your report is ready',description:'The weekly summary is available.',time:'1h ago',unread:true},{id:'3',category:'activity',title:'A task moved to review',description:'The design team finished a handoff.',time:'2h ago',unread:true},{id:'4',category:'mentions',title:'Noah requested feedback',description:'Take a look at the latest work.',time:'3h ago',unread:true,avatar:{alt:'Noah',initials:'NG'}},{id:'5',category:'system',title:'Backup completed',description:'Your workspace is up to date.',time:'1d ago',unread:true}];
export type HomeHire = { id: string; name: string; role: string; joined: string; initials: string; image?: string; portrait?: { sheet: 'a' | 'b'; index: 0 | 1 | 2 | 3 } };
export type HomeCustomer = { id: string; name: string; purchase: 'Waiting' | 'Processing' | 'Completed'; status: string; date: string; price: string; product: string; region: string };
const homeHires: HomeHire[] = [
  { id: 'livia', name: 'Livia Saris', role: 'Backend engineer', joined: 'Joined today', initials: 'LS', portrait: { sheet: 'a', index: 0 } },
  { id: 'jaydon', name: 'Jaydon Aminoff', role: 'UI designer', joined: '2 days ago', initials: 'JA', portrait: { sheet: 'a', index: 1 } },
  { id: 'maria', name: 'Maria Lubin', role: 'Researcher', joined: '5 days ago', initials: 'ML', portrait: { sheet: 'a', index: 2 } },
  { id: 'ann', name: 'Ann Press', role: 'DevOps engineer', joined: 'A week ago', initials: 'AP', portrait: { sheet: 'a', index: 3 } },
  { id: 'elise', name: 'Elise Park', role: 'Product designer', joined: '8 days ago', initials: 'EP', portrait: { sheet: 'b', index: 0 } },
  { id: 'noah', name: 'Noah Gray', role: 'Frontend engineer', joined: '9 days ago', initials: 'NG', portrait: { sheet: 'b', index: 1 } },
  { id: 'priya', name: 'Priya Shah', role: 'Data analyst', joined: '10 days ago', initials: 'PS', portrait: { sheet: 'b', index: 2 } },
  { id: 'daniel', name: 'Daniel Kim', role: 'Design engineer', joined: '12 days ago', initials: 'DK', portrait: { sheet: 'b', index: 3 } },
];
function HireCard({ hire }: { hire: HomeHire }) {
  const source = hire.image ?? (hire.portrait ? publicPath(`/avatars/team-hire-portraits-${hire.portrait.sheet}.webp`) : undefined);
  return <article><div className="ui-template-home__hire-person"><Avatar size="lg" initials={hire.initials} src={source} alt={hire.name} data-portrait={hire.portrait?.index}/><div><b title={hire.name}>{hire.name}</b><small>{hire.joined}</small></div></div><span className="ui-template-home__hire-role" title={hire.role}>{hire.role}</span></article>;
}
const homeCustomers: HomeCustomer[] = [
  { id: '1', name: 'John Clarkson', purchase: 'Waiting', status: 'Delivery failed', date: 'Sep 05, 2026', price: '$3,412', product: 'Studio', region: 'Americas' },
  { id: '2', name: 'Aspen Lubin', purchase: 'Waiting', status: 'Delivery failed', date: 'Mar 25, 2026', price: '$1,899', product: 'Teams', region: 'Europe' },
  { id: '3', name: 'Michael Ekstrom', purchase: 'Completed', status: 'Shipped', date: 'Aug 01, 2026', price: '$2,752', product: 'Studio', region: 'Europe' },
  { id: '4', name: 'Kianna Vaccaro', purchase: 'Completed', status: 'Shipped', date: 'Apr 02, 2026', price: '$145', product: 'Starter', region: 'Asia' },
  { id: '5', name: 'Livia Saris', purchase: 'Processing', status: 'Delivery waiting', date: 'Nov 14, 2026', price: '$708', product: 'Teams', region: 'Europe' },
  { id: '6', name: 'Jaydon Aminoff', purchase: 'Processing', status: 'Confirmed', date: 'Jul 17, 2026', price: '$224', product: 'Starter', region: 'Americas' },
];
const homeColumns: ColumnDef<HomeCustomer, any>[] = [
  { accessorKey: 'name', header: 'Customer name', cell: ({ getValue }) => <strong>{String(getValue())}</strong> },
  { accessorKey: 'purchase', header: 'Purchase', cell: ({ getValue }) => <span className="ui-template-home__purchase">{String(getValue())}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className="ui-template-home__status" data-status={String(getValue()).toLowerCase().replaceAll(' ','-')}>{String(getValue())}</span> },
  { accessorKey: 'date', header: 'Last updated' },
  { accessorKey: 'price', header: 'Price' },
];
const homeFilters = [
  { id: 'product', label: 'All products', options: [{ value: 'Studio', label: 'Studio' }, { value: 'Teams', label: 'Teams' }, { value: 'Starter', label: 'Starter' }], getValue: (row: HomeCustomer) => row.product },
  { id: 'region', label: 'All regions', options: [{ value: 'Americas', label: 'Americas' }, { value: 'Europe', label: 'Europe' }, { value: 'Asia', label: 'Asia' }], getValue: (row: HomeCustomer) => row.region },
];
const homeMetrics: StatCardItem[] = [
  { id: 'customers', label: 'Customers', value: '14,592', change: 5.3, color: 'blue', icon: RiUser3Line },
  { id: 'units', label: 'Units sold', value: '385', change: -2.1, color: 'violet', icon: RiFolder3Line },
  { id: 'orders', label: 'Orders', value: '1,394', change: 0, color: 'orange', icon: RiBankLine },
  { id: 'tickets', label: 'Support tickets', value: '708', change: 12.8, color: 'pink', icon: RiChat1Line },
];
export function FinanceDashboardTemplate({className,onAction,metrics}:{className?:string;onAction?:(action:string)=>void;metrics?:StatCardItem[]}){return <BrowserFrame title="Finance dashboard" className={className}><Shell selected="finance" onAction={onAction}><FinanceWorkspace metrics={metrics} onAction={onAction}/></Shell></BrowserFrame>}
export function HomeDashboardTemplate({className,onAction,metrics=homeMetrics,hires=homeHires,customers=homeCustomers,recentActivity=[]}:{className?:string;onAction?:(action:string)=>void;metrics?:StatCardItem[];hires?:HomeHire[];customers?:HomeCustomer[];recentActivity?:string[]}){
  const [hirePage,setHirePage]=useState(0);
  const [noticesOpen,setNoticesOpen]=useState(false);
  const [readNoticeIds,setReadNoticeIds]=useState<string[]>([]);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [purchaseFilter,setPurchaseFilter]=useState<'All'|HomeCustomer['purchase']>('All');
  const [createOpen,setCreateOpen]=useState(false);
  const [createdTickets,setCreatedTickets]=useState<string[]>([]);
  const router=useRouter();
  const pathname=usePathname();
  const visibleHires=hires.slice(hirePage*4,hirePage*4+4);
  const visibleCustomers=purchaseFilter==='All'?customers:customers.filter(customer=>customer.purchase===purchaseFilter);
  function createTicket(){if(pathname.startsWith('/templates/')){sessionStorage.setItem('appui.board.create','1');router.push('/templates/project-board');return}setCreateOpen(true)}
  return <BrowserFrame title="Home dashboard" className={className}><Shell onAction={onAction}><div className="ui-template-home">
    <div className="ui-template-home__breadcrumb">Studio workspace <span>›</span> Maya <span>›</span> Home</div>
    <header className="ui-template-home__header"><h2>Welcome, Maya</h2><div><button type="button" className="ui-template-home__icon" aria-label="Notifications" aria-expanded={noticesOpen} onClick={()=>{setNoticesOpen(open=>!open);setFiltersOpen(false)}}><RiNotification3Line size={17} aria-hidden />{notices.length-readNoticeIds.length>0&&<i>{notices.length-readNoticeIds.length}</i>}</button><Button variant="secondary" leadingIcon={RiFilter3Line} aria-expanded={filtersOpen} onClick={()=>{setFiltersOpen(open=>!open);setNoticesOpen(false)}}>Filters</Button><Button leadingIcon={RiAddLine} onClick={createTicket}>Create ticket</Button></div></header>
    {noticesOpen&&<div className="ui-template-home__popover"><NotificationCenter items={notices.map(item=>({...item,unread:item.unread&&!readNoticeIds.includes(item.id)}))} onReadChange={id=>setReadNoticeIds(current=>current.includes(id)?current:[...current,id])} onMarkAllRead={()=>setReadNoticeIds(notices.map(item=>item.id))} onAction={(_,action)=>onAction?.(action)}/></div>}
    {filtersOpen&&<div className="ui-template-home__popover ui-template-home__popover--filters"><strong>Purchase status</strong>{(['All','Waiting','Processing','Completed'] as const).map(status=><button type="button" key={status} aria-pressed={purchaseFilter===status} onClick={()=>{setPurchaseFilter(status);setFiltersOpen(false)}}>{status==='All'?'All customers':status}</button>)}</div>}
    <div className="ui-template-home__top"><section className="ui-template-home__hires"><div><span>Recent hires</span><button type="button" onClick={()=>onAction?.('team')}>Studio team <RiArrowDownSLine size={16} aria-hidden/></button></div><strong>{hires.length}</strong><div className="ui-template-home__hire-grid">{visibleHires.map(hire=><HireCard key={hire.id} hire={hire}/>)}</div><footer><button type="button" disabled={hirePage===0} onClick={()=>setHirePage(page=>page-1)}>← Previous</button><button type="button" disabled={(hirePage+1)*4>=hires.length} onClick={()=>setHirePage(page=>page+1)}>Next →</button></footer></section><EarningsChartCard /></div>
    <div className="ui-template-home__middle"><LineChartCard /><ContributionsCard /></div>
    <StatCards items={metrics} variant="compact" />
    <DataTable data={visibleCustomers} columns={homeColumns} getRowId={row=>row.id} filters={homeFilters} pageSize={5} resultLabel="customers" />
    {(createdTickets.length>0||recentActivity.length>0)&&<section className="ui-template-home__activity"><h3>Recent activity</h3>{[...createdTickets,...recentActivity].map((item,i)=><div className="ui-template-activity" key={`${item}-${i}`}><Avatar initials={['MC','NG','EP'][i%3]} size="sm"/><span>{item}</span><small>{i+1}h</small></div>)}</section>}
  </div></Shell><AnimatePresence>{createOpen&&<CreateDialog title="New ticket" label="Create ticket" fields={[{name:'title',label:'Ticket title',required:true},{name:'description',label:'Description'}]} onClose={()=>setCreateOpen(false)} onSubmit={values=>{setCreatedTickets(current=>[`Created ticket: ${values.title}`,...current]);onAction?.('Ticket created')}}/>}</AnimatePresence></BrowserFrame>;
}
export function MarketingDashboardTemplate({className,onAction,metrics}:{className?:string;onAction?:(action:string)=>void;metrics?:StatCardItem[]}){return <BrowserFrame title="Marketing dashboard" className={className}><Shell selected="marketing" onAction={onAction}><MarketingWorkspace metrics={metrics} onAction={onAction}/></Shell></BrowserFrame>}
export type MedicalProfileData={name:string;birthDate:string;gender:string;bloodType:string;doctor:string;steps:string;sleepScore:number};
const defaultMedical:MedicalProfileData={name:'Maya Chen',birthDate:'June 28, 1987',gender:'Female',bloodType:'A+',doctor:'Dr. Avery',steps:'31,600',sleepScore:98};
export function MedicalProfileTemplate({className,onAction,profile=defaultMedical}:{className?:string;onAction?:(action:string)=>void;profile?:MedicalProfileData}){return <BrowserFrame title="Medical profile" className={className}><Shell selected="medical" onAction={onAction}><MedicalWorkspace profile={profile} onAction={onAction}/></Shell></BrowserFrame>}
export function AIProfileTemplate({className,onAction,profile={name:'Maya Chen',initials:'MC',subtitle:'@maya · PRO',image:publicPath("/avatars/studio-portrait.png"),contributions:'$4,977',tokens:'667.7M',streak:'62 days'}}:{className?:string;onAction?:(action:string)=>void;profile?:{name:string;initials:string;subtitle:string;image?:string;contributions:string;tokens:string;streak:string}}){return <BrowserFrame title="AI profile" className={className}><Shell selected="profile" onAction={onAction}><ProfileWorkspace profile={profile} onAction={onAction}/></Shell></BrowserFrame>}
export type ChatMessage={id:string;role:'user'|'assistant';text:string};
export { AIChatTemplate } from './ai-chat-template';
const starterNav:SidebarItem[]=[{key:'chat',label:'Chat',icon:RiChatAiLine},{key:'home',label:'Dashboard',icon:RiDashboardLine},{key:'components',label:'Components and Blocks',icon:RiTaskLine},{key:'sign-in',label:'Sign in',icon:RiUser3Line},{key:'sign-up',label:'Sign up',icon:RiAddLine}];
export function ChatStarterTemplate({className,onAction}:TemplateProps){return <BrowserFrame title="Chat starter" className={cx('ui-chat-starter-template',className)}><Shell selected="chat" onAction={onAction} items={starterNav} routes={{chat:'/templates/chat-starter',home:'/templates/home-dashboard',components:'/components/button','sign-in':'/components/auth-card','sign-up':'/components/auth-card#sign-up'}}><ChatStarterWorkspace onAction={onAction}/></Shell></BrowserFrame>}
export function AIImageGenerationTemplate({className,onAction,onGenerate,images,initialPrompt,stylePresets,workspaceName='Studio workspace'}:{className?:string;onAction?:(action:string)=>void;onGenerate?:(prompt:string,style:string|null)=>Promise<{src:string;title:string}>|{src:string;title:string};images?:{src:string;title:string}[];initialPrompt?:string;stylePresets?:string[];workspaceName?:string}){return <BrowserFrame title="Image generation" className={cx('ui-image-generation-template',className)}><div className="ui-image-agent-shell"><AgentWorkspaceSidebar workspaceName={workspaceName} onAction={onAction}/><ImageGenerationWorkspace images={images} initialPrompt={initialPrompt} stylePresets={stylePresets} workspaceName={workspaceName} onGenerate={onGenerate} onAction={onAction}/></div></BrowserFrame>}
export function MultiAgentChatTemplate({className,onAction,agentList,onSend}:{className?:string;onAction?:(action:string)=>void;agentList?:AgentInfo[];onSend?:(message:string,agentIds:string[])=>void}) {
  return <BrowserFrame title="Multi-agent chat" className={className}><MultiAgentChatWorkspace agentList={agentList} onSend={onSend} onAction={onAction}/></BrowserFrame>;
}
export type BoardTask={id:string;title:string;description?:string;status:'backlog'|'todo'|'progress'|'review'|'done';priority?:'low'|'medium'|'high'|'urgent';assignee?:string;category?:string;project?:string;since?:string;resources?:{label:string;url:string}[];tokenMetric?:{value:string;change:string;history:number[];startLabel:string;endLabel:string};comments?:{author:string;time:string;text:string}[]};
const initialTasks:BoardTask[]=[
 {id:'DS-38',title:'Explore approval cards for agent handoffs',status:'backlog',priority:'low',assignee:'MC',category:'Agent handoff',project:'vibl',since:'Since 14 Sep'},
 {id:'BE-23',title:'Record an audit trail for agent actions',status:'backlog',priority:'medium',assignee:'EP',category:'Activity API',project:'vibl',since:'Since 12 Sep'},
 {id:'BE-19',title:'Return rolling limits with reset timestamps',status:'backlog',priority:'low',assignee:'EP',category:'Usage API',project:'vibl',since:'Since 10 Sep'},
 {id:'DS-34',title:'Define semantic tokens for elevated surfaces',status:'todo',priority:'high',assignee:'MC',category:'Foundations',project:'Studio',since:'Since 12 Sep'},
 {id:'FE-86',title:'Add saved views for each project team',description:'Keep personal views separate from team views, show when a view has unsaved changes, and handle empty results with a clear way to reset filters.',status:'todo',priority:'low',assignee:'NG',category:'Project board',project:'firstview',since:'Since 13 Sep',resources:[{label:'Motion',url:'https://motion.dev/'},{label:'React',url:'https://react.dev/'},{label:'React Aria',url:'https://react-aria.adobe.com/'}],tokenMetric:{value:'155.9M tokens',change:'−29.2%',history:[58,64,70,45,54,61,62,25,25,25,48,34,61,74,26,26,44],startLabel:'Sep 1',endLabel:'Sep 16'},comments:[{author:'Maya Chen',time:'2 hours ago',text:'I’ve added this to our next review. Let me know if anything is blocking progress.'}]},
 {id:'FE-82',title:'Add keyboard navigation to model picker',status:'todo',priority:'low',assignee:'NG',category:'Composer',project:'firstview',since:'Since 11 Sep'},
 {id:'FE-79',title:'Animate nested task groups as they stream',status:'progress',priority:'medium',assignee:'NG',category:'Agent progress',project:'firstview',since:'Since 9 Sep'},
 {id:'DS-31',title:'Tune chart contrast on dark dashboard cards',status:'progress',priority:'urgent',assignee:'MC',category:'Dark mode',project:'Studio',since:'Since 8 Sep'},
 {id:'FE-76',title:'Polish the transition between plan questions',description:'Forward and backward navigation should feel equally natural. Support long answers, validation messages, and reduced motion without abrupt height changes.',status:'review',priority:'low',assignee:'PS',category:'Questionnaire',project:'vibl',since:'Since 7 Sep',resources:[{label:'React',url:'https://react.dev/'},{label:'React Aria',url:'https://react-aria.adobe.com/'}],tokenMetric:{value:'77.5M tokens',change:'−36.8%',history:[49,43,76,82,55,62,80,46,50,35,34,54,44,44,69,81],startLabel:'Sep 1',endLabel:'Sep 16'},comments:[{author:'Maya Chen',time:'2 hours ago',text:'I’ve added this to our next review. Let me know if anything is blocking progress.'},{author:'Noah Williams',time:'5 hours ago',text:'The implementation is ready for review. Please check the backward transition and confirm that focus lands on the next question heading.'},{author:'Elif Kaya',time:'Yesterday',text:'I’ll take a look at this with the vibl team and share feedback here.'}]},
 {id:'DS-27',title:'Ship overlapping avatar groups for cards',status:'done',priority:'low',assignee:'MC',category:'Avatars',project:'Studio',since:'Completed 6 Sep'},
 {id:'FE-71',title:'Keep generated screens aligned while zooming',status:'done',priority:'medium',assignee:'EP',category:'Studio canvas',project:'Studio',since:'Completed 5 Sep'},
 {id:'BE-16',title:'Validate template dependencies during build',status:'done',priority:'low',assignee:'NG',category:'Registry',project:'Core',since:'Completed 4 Sep'},
 {id:'DS-25',title:'Document reduced-motion behavior for blocks',status:'done',priority:'low',assignee:'EP',category:'Motion',project:'Studio',since:'Completed 3 Sep'},
];
export function ProjectBoardTemplate({className,onAction,initialItems=initialTasks,title='Studio design tasks',workspaceName='Studio workspace'}:{className?:string;onAction?:(action:string)=>void;initialItems?:BoardTask[];title?:string;workspaceName?:string}){
 return <div className={cx('ui-template-board-application',className)}><Shell selected="board" onAction={onAction} workspaceIdentity={{name:workspaceName,initials:workspaceName.trim().charAt(0).toUpperCase()||'W'}}><ProjectBoardWorkspace initialItems={initialItems} title={title} workspaceName={workspaceName} onAction={onAction}/></Shell></div>
}

export { AgentWorkspaceTemplate } from './agent-workspace-template';
