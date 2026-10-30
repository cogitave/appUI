'use client';

import { Badge } from '@/components/base/badges/badge';
import { ProfileCard } from '@/components/blocks/profile-card/profile-card';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RiAddLine, RiBankLine, RiBellLine, RiCalendarLine, RiCloseLine, RiCoinsLine, RiFilter3Line, RiHeartPulseLine, RiNotification3Line, RiSearchLine, RiStethoscopeLine, RiUser3Line, RiWallet3Line } from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Tabs, TabList, Tab, TabPanel } from '@/components/base/tabs/tabs';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { NotificationCenter, type InboxNotification } from '@/components/blocks/notification-center/notification-center';
import { StatCards, type StatCardItem } from '@/components/blocks/stat-cards/stat-cards';
import { ActivityRingsCard, AreaChartCard, ComboChartCard, FunnelChartCard, HeatmapChartCard, MostActiveDaysCard, RadialChartCard, SankeyChartCard, ScatterChartCard, SleepScoreCard, StepsCard } from '@/components/charts/chart-cards';
import { demoDaySummary, initialDemoDay } from '@/utils/demo-day-activity';

type Action = (message: string) => void;

const notifications: InboxNotification[] = [
  { id: 'n1', category: 'mentions', title: 'Maya mentioned you', description: 'The project brief is ready for review.', time: '2m', unread: true, avatar: { initials: 'MC', alt: 'Maya Chen' } },
  { id: 'n2', category: 'system', title: 'Workspace backup is ready', description: 'Your latest backup is available.', time: '18m', unread: true },
  { id: 'n3', category: 'activity', title: 'Project Sea is ready', description: 'Your team finished the latest review.', time: '1h', unread: true },
  { id: 'n4', category: 'mentions', title: 'Noah requested feedback', description: 'Take a look at the new dashboard cards.', time: '3h', unread: true, avatar: { initials: 'NG', alt: 'Noah Gray' } },
  { id: 'n5', category: 'system', title: 'Monthly summary', description: 'Your workspace report is available.', time: '1d', unread: true },
];

export function DashboardHeader({ title, location, actionLabel, onCreate, onAction }: { title: string; location: string; actionLabel: string; onCreate: () => void; onAction?: Action }) {
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [range, setRange] = useState('Last 30 days');
  const [readIds,setReadIds]=useState<string[]>([]);
  const unread=notifications.filter(item=>item.unread&&!readIds.includes(item.id)).length;
  return <div className="ui-dash-header">
    <div className="ui-dash-header__breadcrumbs"><span className="ui-dash-header__avatar">S</span><span>Studio workspace</span><b>›</b><span className="ui-dash-header__avatar">M</span><span>Maya</span><b>›</b><strong>{location}</strong></div>
    <div className="ui-dash-header__row"><h1>{title}</h1><div className="ui-dash-header__actions">
      <button className="ui-dash-header__icon" type="button" aria-label="Notifications" aria-expanded={noticesOpen} onClick={() => { setNoticesOpen(open => !open); setFiltersOpen(false); }}><RiNotification3Line size={19} aria-hidden />{unread>0&&<i>{unread}</i>}</button>
      <button className="ui-dash-header__control" type="button" aria-label="Filters" aria-expanded={filtersOpen} onClick={() => { setFiltersOpen(open => !open); setNoticesOpen(false); }}><RiFilter3Line size={18} aria-hidden />Filters</button>
      <Button size="small" leadingIcon={RiAddLine} onClick={onCreate}>{actionLabel}</Button>
    </div></div>
    <AnimatePresence>{noticesOpen && <motion.div className="ui-dash-header__popover" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}><NotificationCenter items={notifications.map(item=>({...item,unread:item.unread&&!readIds.includes(item.id)}))} onReadChange={id=>setReadIds(current=>current.includes(id)?current:[...current,id])} onMarkAllRead={()=>setReadIds(notifications.map(item=>item.id))} onAction={(_, action) => onAction?.(action)} /></motion.div>}</AnimatePresence>
    <AnimatePresence>{filtersOpen && <motion.div className="ui-dash-header__filters" role="group" aria-label="Dashboard date range" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}><span>Date range</span>{['Last 7 days', 'Last 30 days', 'This year'].map(option => <button type="button" key={option} aria-pressed={range === option} onClick={() => { setRange(option); setFiltersOpen(false); onAction?.(`Date range: ${option}`); }}>{option}</button>)}</motion.div>}</AnimatePresence>
  </div>;
}

export function CreateDialog({ title, label, fields, onClose, onSubmit }: { title: string; label: string; fields: { name: string; label: string; type?: string; required?: boolean }[]; onClose: () => void; onSubmit: (values: Record<string, string>) => void }) {
  const reducedMotion = useReducedMotion();
  useEffect(()=>{const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown)},[onClose]);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit(Object.fromEntries(data.entries()) as Record<string, string>); onClose(); }
  return <div className="ui-dash-dialog-layer"><button type="button" className="ui-dash-dialog-layer__scrim" aria-label="Close dialog" onClick={onClose}/><motion.section className="ui-dash-dialog" role="dialog" aria-modal="true" aria-label={title} initial={reducedMotion ? false : { opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: .99 }} transition={{ duration: reducedMotion ? 0 : .22 }}><header><h2>{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose}><RiCloseLine size={18}/></button></header><form onSubmit={submit}>{fields.map(field => <label key={field.name}>{field.label}<input name={field.name} type={field.type ?? 'text'} required={field.required} autoFocus={field === fields[0]}/></label>)}<footer><Button variant="secondary" size="small" type="button" onClick={onClose}>Cancel</Button><Button size="small" type="submit">{label}</Button></footer></form></motion.section></div>;
}

const financeMetrics: StatCardItem[] = [
  { id: 'balance', label: 'Total balance', value: '$84,230', change: 3.2, icon: RiWallet3Line },
  { id: 'income', label: 'Income', value: '$18,420', change: 6.1, icon: RiCoinsLine },
  { id: 'expenses', label: 'Expenses', value: '$9,140', change: -2.4, icon: RiBankLine },
  { id: 'invested', label: 'Invested', value: '$32,400', change: 8.4, icon: RiBankLine },
];
type Transaction = { id: string; name: string; account: string; category: string; date: string; amount: string };
const initialTransactions: Transaction[] = [
  { id: 't1', name: 'Whole Foods Market', account: 'Savings', category: 'Groceries', date: 'Oct 28, 2026', amount: '-$135' },
  { id: 't2', name: 'Spotify', account: 'Savings', category: 'Subscriptions', date: 'Jul 15, 2026', amount: '-$12' },
  { id: 't3', name: 'Acme Corp payroll', account: 'Savings', category: 'Income', date: 'Jun 17, 2026', amount: '+$6,200' },
  { id: 't4', name: 'iCloud storage', account: 'Savings', category: 'Subscriptions', date: 'Feb 03, 2026', amount: '-$3' },
  { id: 't5', name: 'Electric utility', account: 'Credit card', category: 'Utilities', date: 'Jun 06, 2026', amount: '-$91' },
  { id: 't6', name: 'Studio K invoice', account: 'Checking', category: 'Income', date: 'Dec 14, 2026', amount: '+$1,286' },
];
const transactionColumns: ColumnDef<Transaction, any>[] = [
  { accessorKey: 'name', header: 'Transaction', cell: info => <strong>{String(info.getValue())}</strong> },
  { accessorKey: 'account', header: 'Account' }, { accessorKey: 'category', header: 'Category' }, { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'amount', header: 'Amount', cell: info => <span className="ui-dash-amount" data-positive={String(info.getValue()).startsWith('+') || undefined}>{String(info.getValue())}</span> },
];
const financeFlows = [
  {from:'Salary',to:'Housing',value:2.58},{from:'Salary',to:'Groceries',value:1.29},{from:'Salary',to:'Transport',value:.55},{from:'Salary',to:'Subscriptions',value:.37},{from:'Salary',to:'Dining',value:.92},{from:'Salary',to:'Investing',value:3},{from:'Salary',to:'Savings',value:3.69},
  {from:'Freelance',to:'Investing',value:2.7},{from:'Freelance',to:'Savings',value:1.1},{from:'Dividends',to:'Investing',value:.93},{from:'Dividends',to:'Savings',value:1.29},
];

export function FinanceWorkspace({ metrics = financeMetrics, onAction }: { metrics?: StatCardItem[]; onAction?: Action }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [createOpen, setCreateOpen] = useState(false);
  return <div className="ui-dash ui-dash--finance"><DashboardHeader title="Finance" location="Finance" actionLabel="Add transaction" onCreate={() => setCreateOpen(true)} onAction={onAction}/><StatCards items={metrics} variant="compact"/>
    <div className="ui-dash__cash"><SankeyChartCard title="Cash flow" value="$18,420" change="+6.1%" links={financeFlows} unit="K" period="This month" startLabel="Income" endLabel="Spending" /></div>
    <div className="ui-dash__triple"><RadialChartCard title="Spending by category" value="$5,810" change="+2.4%" series={[{label:'Housing',value:2180},{label:'Groceries',value:1080},{label:'Transport',value:760},{label:'Subscriptions',value:640},{label:'Dining',value:1150}]}/><ScatterChartCard title="Portfolio" value="7%" change="+6.2%"/><HeatmapChartCard title="Daily spending" value="$4,390" change="+3.6%"/></div>
    <DataTable data={transactions} columns={transactionColumns} getRowId={row => row.id} filters={[{id:'account',label:'All accounts',options:['Savings','Checking','Credit card'].map(value=>({value,label:value})),getValue:row=>row.account},{id:'category',label:'All categories',options:['Groceries','Subscriptions','Income','Utilities'].map(value=>({value,label:value})),getValue:row=>row.category}]} resultLabel="transactions" pageSize={5}/>
    <AnimatePresence>{createOpen && <CreateDialog title="Add transaction" label="Save transaction" onClose={() => setCreateOpen(false)} fields={[{name:'name',label:'Transaction',required:true},{name:'account',label:'Account',required:true},{name:'category',label:'Category',required:true},{name:'amount',label:'Amount',required:true}]} onSubmit={values => { setTransactions(current => [{ id:`t${Date.now()}`, name:values.name, account:values.account, category:values.category, amount:values.amount, date:new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}) }, ...current]); onAction?.('Transaction added'); }}/>}</AnimatePresence>
  </div>;
}

const marketingMetrics: StatCardItem[] = [
  { id:'spend',label:'Ad spend',value:'$24,380',change:8.4,icon:RiCoinsLine },
  { id:'impressions',label:'Impressions',value:'1.94M',change:12.6,icon:RiSearchLine },
  { id:'conversions',label:'Conversions',value:'1,286',change:5.2,icon:RiUser3Line },
  { id:'cpc',label:'Cost per click',value:'$1.24',change:-3.1,icon:RiFilter3Line },
];
const channels = {
  Channels: [{label:'Google Ads',value:39},{label:'Meta',value:25},{label:'X Ads',value:14},{label:'LinkedIn',value:8},{label:'Email',value:7}],
  Campaigns: [{label:'Launch',value:42},{label:'Retargeting',value:26},{label:'Awareness',value:19},{label:'Newsletter',value:13}],
  'Landing pages': [{label:'Product',value:48},{label:'Pricing',value:25},{label:'Use cases',value:17},{label:'About',value:10}],
} as const;
function ChannelCard() {
  const [tab,setTab]=useState<keyof typeof channels>('Channels');
  const indicatorId=useId();
  const reducedMotion=useReducedMotion();
  return <section className="ui-dash-channels"><Tabs selectedKey={tab} onSelectionChange={key=>setTab(key as keyof typeof channels)}>
    <header className="ui-dash-channels__header"><TabList className="ui-dash-channels__tabs" aria-label="Acquisition breakdown">{(Object.keys(channels) as (keyof typeof channels)[]).map(item=><Tab id={item} key={item}>{item}{tab===item&&<motion.span className="ui-dash-channels__indicator" layoutId={indicatorId} transition={{duration:reducedMotion?0:.2,ease:'easeOut'}}/>}</Tab>)}</TabList><span>Sessions</span></header>
    {(Object.entries(channels)).map(([name,items])=><TabPanel id={name} key={name} className="ui-dash-channels__panel"><div className="ui-dash-channels__rows">{items.map(item=><div key={item.label}><motion.span initial={reducedMotion?false:{width:0}} animate={{width:`${item.value/Math.max(...items.map(row=>row.value))*100}%`}} transition={{duration:reducedMotion?0:.5,ease:'easeOut'}}/><strong>{item.label}</strong><em>{item.value}%</em></div>)}</div></TabPanel>)}
  </Tabs></section>;
}
function MarketingSpendCard() {
  const [period, setPeriod] = useState<'Last 7 days' | 'Last 30 days' | 'This quarter'>('Last 30 days');
  const periods = ['Last 7 days', 'Last 30 days', 'This quarter'] as const;
  const scale = period === 'Last 7 days' ? .25 : period === 'This quarter' ? 2.75 : 1;
  const distribution = [{ label: 'Paid search', value: 11400, color: '#94df00' }, { label: 'Paid social', value: 7620, color: '#318dff' }, { label: 'Email', value: 3180, color: '#bd64f9' }, { label: 'Affiliates', value: 2680, color: '#f65aa7' }];
  return <section className="ui-dash-spend"><header><div><span>Spend by channel</span><strong>${Math.round(24880 * scale).toLocaleString()} <em>+8.4%</em></strong></div><button type="button" aria-label={`Period: ${period}. Change period`} onClick={() => setPeriod(current => periods[(periods.indexOf(current) + 1) % periods.length])}><RiCalendarLine size={16}/>{period}</button></header><div className="ui-dash-spend__meter"><svg viewBox="0 0 240 140" role="img" aria-label="Paid search accounts for 46 percent of channel spending"><path d="M 30 118 A 90 90 0 0 1 210 118" fill="none" stroke="var(--surface-muted)" strokeWidth="28" strokeLinecap="round"/><motion.path d="M 30 118 A 90 90 0 0 1 210 118" fill="none" stroke="var(--chart-lime)" strokeWidth="28" strokeLinecap="round" pathLength={100} strokeDasharray="46 100" initial={{strokeDashoffset:46}} animate={{strokeDashoffset:0}} transition={{duration:.8,ease:[.2,.75,.25,1]}}/></svg><div><strong>46%</strong><span>Paid search</span></div></div><footer>{distribution.map(item=><div key={item.label}><i style={{background:item.color}}/><span>{item.label}</span><strong>${Math.round(item.value * scale).toLocaleString()}</strong></div>)}</footer></section>;
}
type Campaign = { id:string; name:string; channel:string; status:string; budget:string; conversions:number };
const initialCampaigns: Campaign[] = [{id:'c1',name:'September launch',channel:'Google Ads',status:'Active',budget:'$8,200',conversions:382},{id:'c2',name:'Studio awareness',channel:'Meta',status:'Active',budget:'$5,600',conversions:245},{id:'c3',name:'Product remarketing',channel:'X Ads',status:'Paused',budget:'$3,400',conversions:164}];
const campaignColumns: ColumnDef<Campaign, any>[]=[{accessorKey:'name',header:'Campaign',cell:info=><strong>{String(info.getValue())}</strong>},{accessorKey:'channel',header:'Channel'},{accessorKey:'status',header:'Status'},{accessorKey:'budget',header:'Budget'},{accessorKey:'conversions',header:'Conversions'}];

export function MarketingWorkspace({ metrics = marketingMetrics, onAction }: { metrics?: StatCardItem[]; onAction?: Action }) {
  const [campaigns,setCampaigns]=useState(initialCampaigns);const [createOpen,setCreateOpen]=useState(false);
  return <div className="ui-dash ui-dash--marketing"><DashboardHeader title="Marketing" location="Marketing" actionLabel="New campaign" onCreate={()=>setCreateOpen(true)} onAction={onAction}/><StatCards items={metrics} variant="compact"/>
    <div className="ui-dash__triple ui-dash__triple--marketing"><FunnelChartCard title="Acquisition funnel" value="96.4K" change="+5.8%" period="Last 30 days" series={[{label:'Visits',value:96400,displayValue:'96.4K'},{label:'Sign-ups',value:38600,displayValue:'38.6K'},{label:'Trials',value:14100,displayValue:'14.1K'},{label:'Customers',value:5200,displayValue:'5.2K'}]}/><MarketingSpendCard/><ChannelCard/></div>
    <div className="ui-dash__double"><ComboChartCard title="Ad spend · ROAS 3.6x" value="$217.7K" axisMax={25500} secondaryUnit="x" series={[{label:'Ad spend · total',value:217700,displayValue:'$217.7K'},{label:'ROAS · average',value:3.6,displayValue:'3.6x'}]}/><AreaChartCard title="Visitors" value="134,400" change="+8.8%"/></div><DataTable data={campaigns} columns={campaignColumns} getRowId={row=>row.id} filters={[{id:'channel',label:'All channels',options:['Google Ads','Meta','X Ads'].map(value=>({value,label:value})),getValue:row=>row.channel}]} resultLabel="campaigns" pageSize={5}/>
    <AnimatePresence>{createOpen && <CreateDialog title="New campaign" label="Create campaign" onClose={()=>setCreateOpen(false)} fields={[{name:'name',label:'Campaign name',required:true},{name:'channel',label:'Channel',required:true},{name:'budget',label:'Budget',required:true}]} onSubmit={values=>{setCampaigns(current=>[{id:`c${Date.now()}`,name:values.name,channel:values.channel,budget:values.budget,status:'Draft',conversions:0},...current]);onAction?.('Campaign created')}}/>}</AnimatePresence>
  </div>;
}

export type MedicalProfileData = { name:string; birthDate:string; gender:string; bloodType:string; doctor:string; steps:string; sleepScore:number };
export const defaultMedical:MedicalProfileData={name:'Maya Chen',birthDate:'June 28, 1987',gender:'Female',bloodType:'A+',doctor:'Dr. Avery',steps:'31,600',sleepScore:98};
type Patient={id:string;name:string;admission:string;status:string;condition:string;appointment:string};
const initialPatients:Patient[]=[{id:'p1',name:'Maya Chen',admission:'Aug 12, 2026',status:'Active',condition:'Wellness',appointment:'Oct 3, 2026'},{id:'p2',name:'Noah Williams',admission:'Jul 20, 2026',status:'Active',condition:'Follow-up',appointment:'Oct 7, 2026'},{id:'p3',name:'Elif Kaya',admission:'Jun 16, 2026',status:'Review',condition:'Cardiology',appointment:'Oct 12, 2026'}];
const patientColumns:ColumnDef<Patient,any>[]=[{accessorKey:'name',header:'Patient',cell:info=><strong>{String(info.getValue())}</strong>},{accessorKey:'admission',header:'Admission'},{accessorKey:'status',header:'Status'},{accessorKey:'condition',header:'Condition'},{accessorKey:'appointment',header:'Next appointment'}];

export function MedicalWorkspace({ profile=defaultMedical,onAction }: { profile?:MedicalProfileData;onAction?:Action }) {
  const [reports,setReports]=useState<string[]>([]);const [createOpen,setCreateOpen]=useState(false);
  const [activityDay,setActivityDay]=useState(initialDemoDay);
  const activitySummary=demoDaySummary(activityDay);
  return <div className="ui-dash ui-dash--medical"><DashboardHeader title="Medical Profile" location="Medical Profile" actionLabel="File a report" onCreate={()=>setCreateOpen(true)} onAction={onAction}/>
    <div className="ui-dash__triple ui-dash__triple--medical"><ProfileCard profile={profile}/><StepsCard value={profile.steps}/><SleepScoreCard score={profile.sleepScore}/></div>
    <div className="ui-dash__triple ui-dash__triple--medical"><MostActiveDaysCard selectedDate={activityDay.date} onDaySelect={setActivityDay}/><ActivityRingsCard {...activitySummary}/><section className="ui-dash-alerts"><header><span>Important alerts</span><strong>12 <small>this week</small></strong></header><div><article><time dateTime="2026-06-12"><Badge variant="subtle">June, 12</Badge></time><i>♥</i><strong>High Heart rate</strong><p>Your heart rate rose above 120 BPM while you seemed to be inactive for 10 minutes starting at 8:59 AM, 12 June.</p></article><article><time dateTime="2026-06-09"><Badge variant="subtle">June, 9</Badge></time><i>✳</i><strong>Medical ID</strong><p>Your emergency contact and allergy information is ready.</p></article>{reports.map((report,index)=><article key={index}><i>✓</i><strong>{report}</strong><p>Filed just now</p></article>)}</div></section></div>
    <DataTable data={initialPatients} columns={patientColumns} getRowId={row=>row.id} filters={[{id:'status',label:'All statuses',options:['Active','Review'].map(value=>({value,label:value})),getValue:row=>row.status},{id:'condition',label:'All conditions',options:['Wellness','Follow-up','Cardiology'].map(value=>({value,label:value})),getValue:row=>row.condition}]} resultLabel="patients" pageSize={5}/>
    <AnimatePresence>{createOpen && <CreateDialog title="File a report" label="File report" onClose={()=>setCreateOpen(false)} fields={[{name:'name',label:'Report title',required:true},{name:'description',label:'Summary',required:true}]} onSubmit={values=>{setReports(current=>[values.name,...current]);onAction?.('Report filed')}}/>}</AnimatePresence>
  </div>;
}
