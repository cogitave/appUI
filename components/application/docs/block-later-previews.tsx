'use client';

import { publicPath } from '@/config/deployment';
import { useState, type ReactNode } from 'react';
import { RiCloudLine, RiErrorWarningLine, RiMoneyDollarCircleLine, RiRefundLine, RiShieldCheckLine, RiShoppingBasketLine, RiTeamLine, RiUserAddLine } from '@remixicon/react';
import { ComposerLoader } from '@/components/blocks/composer-loader/composer-loader';
import { Composer } from '@/components/blocks/composer/composer';
import { ComposerPanelPreview, ComposerPanelExamples } from './composer-panel-examples';
import { CustomerTablePreview } from './customer-table-demo';
import { NotificationCenter, type InboxNotification } from '@/components/blocks/notification-center/notification-center';
import { Questionnaire, type Question } from '@/components/blocks/questionnaire/questionnaire';
import { SettingsModal } from '@/components/blocks/settings-modal/settings-modal';
import { SettingsFormExamples } from './settings-form-examples';
import { StatCards, type StatCardItem } from '@/components/blocks/stat-cards/stat-cards';
import { TaskList, type AgentTask } from '@/components/blocks/task-list/task-list';
import { WebSearch, type SearchStep } from '@/components/blocks/web-search/web-search';
import { Button } from '@/components/base/buttons/button';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { ChartPreview, ChartExamples } from './chart-previews';

type Props = { slug: DocSlug; onNotify: (message: string) => void };
const notices = (onNotify:(message:string)=>void): InboxNotification[] => [
 {id:'mention',category:'mentions',title:'Livia mentioned you',description:'Can you review the new empty state before we ship the dashboard?',time:'2m',unread:true,avatar:{src:publicPath("/avatars/studio-portrait.png"),alt:'Livia Saris',initials:'LS'},action:{label:'Reply',onPress:()=>onNotify('Reply selected.')},secondaryAction:{label:'View thread',variant:'secondary',onPress:()=>onNotify('Thread opened.')}},
 {id:'backup',category:'system',title:'Workspace backup is ready',description:'The July 23 backup finished successfully and is ready to download.',time:'18m',unread:true,status:'success',icon:RiCloudLine,action:{label:'Download',variant:'secondary',onPress:()=>onNotify('Backup download started.')}},
 {id:'invite',category:'activity',title:'You joined Project Sea',description:'Maria added you as an editor. You now have access to all project files.',time:'1h',unread:true,status:'information',icon:RiUserAddLine},
 {id:'review',category:'mentions',title:'Jaydon requested your review',description:'Pull request #284 updates the notification preferences flow.',time:'Mon',avatar:{alt:'Jaydon Aminoff',initials:'JA'},action:{label:'Review changes',variant:'secondary',onPress:()=>onNotify('Review opened.')}},
 {id:'security',category:'system',title:'Security check completed',description:'No exposed credentials or vulnerable dependencies were found.',time:'Sun',status:'success',icon:RiShieldCheckLine},
 {id:'deploy',category:'system',title:'Preview deployment failed',description:'The build stopped while validating the application routes.',time:'Sat',unread:true,status:'error',icon:RiErrorWarningLine,action:{label:'Retry',onPress:()=>onNotify('Deployment retry started.')},secondaryAction:{label:'View logs',variant:'secondary',onPress:()=>onNotify('Deployment logs opened.')}},
];
const questions: Question[] = [{ id:'controls', prompt:'Which workspace controls should stay in the top bar?', type:'multiple', options:[{id:'self',label:'Show up self toggle',description:'Keep your personal view one click away.'},{id:'wallpaper',label:'Wallpaper picker',description:'Change the workspace backdrop.'},{id:'play',label:'Play level-up',description:'Replay the welcome sequence and animations.'}],allowOther:true },{ id:'goal', prompt:'What would you like to work on?', type:'single', options:[{id:'product',label:'A product experience',description:'Interfaces and interactions'}, {id:'brand',label:'A visual identity',description:'A clear design language'}, {id:'research',label:'Research',description:'Evidence for the next decision'}],allowOther:true },{ id:'tools', prompt:'Which tools do you use?',type:'multiple',options:[{id:'design',label:'Design tools'},{id:'code',label:'Code editor'},{id:'docs',label:'Documentation'}] },{id:'priority',prompt:'What matters most right now?',type:'single',options:[{id:'speed',label:'Speed',description:'Get a working result sooner.'},{id:'quality',label:'Craft',description:'Refine the details and interactions.'},{id:'clarity',label:'Clarity',description:'Make the experience easier to use.'}]}];
const metrics: StatCardItem[] = [{id:'revenue',label:'Total revenue',value:'$152,313.92',change:16,color:'blue',icon:RiMoneyDollarCircleLine,description:'Revenue across all orders'}, {id:'orders',label:'Total orders',value:'25,162',change:20,color:'orange',icon:RiShoppingBasketLine,description:'Orders in the selected period'}, {id:'customers',label:'New customers',value:'3,847',change:8.1,color:'violet',icon:RiTeamLine,description:'First time customers'}, {id:'refunds',label:'Refunds',value:'$4,209.44',change:-2.4,color:'pink',icon:RiRefundLine,description:'Refunded payments'}];
const tasks: AgentTask[] = [{id:'read',title:'Found project files',status:'complete',kind:'search',events:[{id:'a',label:'Searching "app/page.tsx, components structure"'},{id:'b',label:'Read',resource:'page.tsx'},{id:'c',label:'Scanning 52 files'},{id:'d',label:'Reading files',resource:'layout.tsx'}]}, {id:'build',title:'Working',status:'running'}];
const taskStates: AgentTask[] = [{id:'read',title:'Found project files',status:'complete',kind:'search',events:tasks[0].events}, {id:'edit',title:'Editing files',status:'complete',kind:'code',events:[{id:'a',label:'Created',resource:'theme-toggle.tsx'}]}, {id:'build',title:'Working',status:'running'}];
const searches: SearchStep[] = [
 {id:'heading',label:'Ran 3 searches',heading:true,dwell:2000},
 {id:'pricing',label:'Searching for what teams actually pay for in a component library',meta:'5 results',dwell:2300,sources:[
  {id:'reddit',title:'Component library pricing discussions',brand:'reddit',url:'https://www.reddit.com/r/reactjs/',domain:'reddit.com'},
  {id:'linkedin',title:'Design system team experience',brand:'linkedin',url:'https://www.linkedin.com/',domain:'linkedin.com'},
  {id:'github',title:'Open source component registries',brand:'github',url:'https://github.com/',domain:'github.com'},
  {id:'figma',title:'Design library comparisons',brand:'figma',url:'https://www.figma.com/',domain:'figma.com'},
  {id:'notion',title:'Component library cost notes',brand:'notion',url:'https://www.notion.so/',domain:'notion.so'},
 ]},
 {id:'x',label:'Searched X for',query:'component library OR design system pricing',brand:'x',meta:'7 posts',dwell:1900},
 {id:'reddit-search',label:'Searched Reddit for',query:'r/reactjs worth paying for',brand:'reddit',meta:'12 threads',dwell:1600},
 {id:'reading',label:'Reading the strongest three threads',dwell:1000},
];
const loaderPalettes = [{name:'Spectrum',swatch:'conic-gradient(#2678f5,#7959d9,#d44c8b,#35ac9a,#e9a67f,#2678f5)',colors:['#5eead4','#46baec','#9677c8','#e633a4','#00faa7']},{name:'Blue',swatch:'#4f86fa',colors:['#286df2','#63b4ff','#a3ddff']},{name:'Violet',swatch:'#7452d8',colors:['#6844d5','#a27bfa','#d0b9ff']},{name:'Pink',swatch:'#d5469a',colors:['#cf308c','#f477bf','#ffc2dc']},{name:'Green',swatch:'#39a980',colors:['#17996c','#62cdaa','#b4e9d6']},{name:'Orange',swatch:'#e9a057',colors:['#d47d2b','#ffb66c','#ffe2a7']}];
function Section({title,description,children}:{title:string;description:string;children:ReactNode}){return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p><div className="docs-example__surface docs-example__block">{children}</div></section>}

export function BlockLaterPreview({slug,onNotify}:Props){
 const [open,setOpen]=useState(false);const [loaderPalette,setLoaderPalette]=useState(0);const [searchRun,setSearchRun]=useState(0);
 switch(slug){
  case 'composer-loader':return <div className="docs-preview__loader"><div className="docs-preview__loader-colors" role="group" aria-label="Loading colors">{loaderPalettes.map((palette,index)=><button type="button" key={palette.name} aria-label={`${palette.name} loading colors`} aria-pressed={loaderPalette===index} onClick={()=>setLoaderPalette(index)} style={{background:palette.swatch}} />)}</div><ComposerLoader active colors={loaderPalettes[loaderPalette].colors}><Composer models={[{id:'fable',label:'Fable 5'},{id:'mini',label:'GPT-5.6 Mini'}]} onVoice={()=>onNotify('Voice input selected.')} onSend={message=>onNotify(`Sent: ${message}`)} /></ComposerLoader></div>;
  case 'composer-panel':return <ComposerPanelPreview onNotify={onNotify} />;
  case 'data-table':return <CustomerTablePreview onAction={onNotify} />;
  case 'notification-center':return <div className="docs-preview__block"><NotificationCenter items={notices(onNotify)} onReadChange={()=>onNotify('Notification marked as read.')} onMarkAllRead={()=>onNotify('All notifications marked as read.')} /></div>;
  case 'questionnaire':return <div className="docs-preview__block"><Questionnaire questions={questions} onClose={()=>onNotify('Questionnaire closed.')} onComplete={()=>onNotify('Answers submitted.')} /></div>;
  case 'settings-modal':return <><Button variant="secondary" onClick={()=>setOpen(true)}>Open settings</Button><SettingsModal isOpen={open} onClose={()=>setOpen(false)} workspaceName="Studio workspace" name="Maya Chen" email="maya@studio.co" onSave={()=>onNotify('Settings saved.')} /></>;
  case 'stat-cards':return <StatCards items={metrics} />;
  case 'task-list':return <div className="docs-preview__block"><TaskList tasks={tasks} startDelay={120} stepInterval={590} /></div>;
  case 'web-search':return <div className="docs-preview__block"><WebSearch key={searchRun} steps={searches} onRunAgain={()=>setSearchRun(run=>run+1)} /></div>;
  default:return <ChartPreview slug={slug} onNotify={onNotify}/>;
 }
}
export function BlockLaterExamples({slug,onNotify}:Props){
 const [open,setOpen]=useState(false);
 switch(slug){
  case 'composer-loader':return <><Section title="Active state" description="The edge animates only while the surface is working."><ComposerLoader active><div style={{padding:18}}>Generating a response…</div></ComposerLoader></Section><Section title="Custom colors" description="Pass a small set of colors to fit the surrounding experience."><ComposerLoader active colors={['#2b7fff','#31c7b3','#8d67e6']}><div style={{padding:18}}>Processing files…</div></ComposerLoader></Section></>;
  case 'composer-panel':return <ComposerPanelExamples onNotify={onNotify} />;
  case 'data-table':return null;
  case 'notification-center':return <Section title="Categories" description="Tabs filter mentions and system updates while unread state remains independent."><NotificationCenter items={notices(onNotify)} /></Section>;
  case 'questionnaire':return <Section title="Multiple choice" description="Move to the second step to choose several options."><Questionnaire questions={questions} onComplete={()=>onNotify('Questionnaire complete.')} /></Section>;
  case 'settings-modal':return <><Section title="Initial page" description="The caller chooses which settings page opens first."><Button variant="secondary" onClick={()=>setOpen(true)}>Open profile settings</Button><SettingsModal isOpen={open} onClose={()=>setOpen(false)} initialPage="profile" workspaceName="Studio workspace" name="Maya Chen" email="maya@studio.co" onSave={()=>onNotify('Profile saved.')} /></Section><SettingsFormExamples/></>;
  case 'stat-cards':return <><Section title="Compact variant" description="Four metrics fit a dashboard header."><StatCards items={metrics} variant="compact" /></Section><Section title="Bring your own data" description="Values, comparisons and icons come from the application."><StatCards items={metrics.slice(0,2)} /></Section></>;
  case 'task-list':return <Section title="Task states" description="Completed and running work retain their own status while the log streams."><TaskList tasks={taskStates} title="Preparing your project" /></Section>;
  case 'web-search':return <Section title="Sources" description="Site marks show where the search went; expanding the branch reveals the links."><WebSearch steps={searches} revealed={6} working={false} /></Section>;
  default:return <ChartExamples slug={slug} onNotify={onNotify}/>;
 }
}
