'use client';

import { publicPath } from '@/config/deployment';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/base/buttons/button';
import {Dialog} from '@/components/base/dialog/dialog';
import {Input} from '@/components/base/input/input';
import {Select} from '@/components/base/select/select';
import {SegmentedControl} from '@/components/base/segmented-control/segmented-control';
import {Notification,NotificationProvider,useNotification,type NotificationViewportPosition,type NotificationQueueLayout} from '@/components/base/notification/notification';

function PreviewControls({onNotify}:{onNotify:(message:string)=>void}){
  const {notify}=useNotification(),[mainVisible,setMainVisible]=useState(true),[mainKey,setMainKey]=useState(0),[review,setReview]=useState(false);
  return <div className="docs-preview__notification">
    {mainVisible&&<Notification key={mainKey} title="Katherine Moss" timestamp="2 mins ago" description="I've finished adding my notes. Happy for us to review whenever you're ready!" avatar={{src:publicPath("/avatars/studio-portrait.png"),alt:'Katherine Moss',initials:'KM',presence:'online'}} secondaryAction={{label:'Dismiss',dismiss:true,onPress:()=>onNotify('Notification dismissed.')}} action={{label:'View changelog',onPress:()=>setReview(true)}} onExitComplete={()=>setMainVisible(false)}/>}
    <div className="docs-preview__notification-actions"><Button variant="secondary" size="small" onClick={()=>{setMainVisible(true);setMainKey(key=>key+1);}}>Replay notification</Button><Button variant="secondary" size="small" onClick={()=>notify({title:'New activity',description:'Your team has a new update.',tone:'information'})}>Information</Button><Button variant="secondary" size="small" onClick={()=>notify({title:'Could not save',description:'Please try again in a moment.',tone:'error'})}>Error</Button><Button variant="secondary" size="small" onClick={()=>notify({title:'Maya Chen',description:'Mentioned you in the launch checklist.',avatar:{src:publicPath("/avatars/studio-portrait.png"),alt:'Maya Chen',initials:'MC',presence:'online'}})}>With avatar</Button><Button variant="secondary" size="small" onClick={()=>notify({title:'Review ready',description:'Two changes are ready to review.',tone:'information',duration:0,secondaryAction:{label:'Not now',onPress:()=>onNotify('Review deferred.')},action:{label:'Review changes',onPress:()=>setReview(true)}})}>With buttons</Button></div>
    <Dialog title="Review changes" description="Changes in this preview" isOpen={review} onOpenChange={setReview}><ul className="docs-notification-review"><li>Shared typography keeps notification actions consistent.</li><li>Queue cards retain keyboard access while they are visible.</li></ul></Dialog>
  </div>;
}
export function NotificationDemo({onNotify}:{onNotify:(message:string)=>void}){return <NotificationProvider label="Preview notifications"><PreviewControls onNotify={onNotify}/></NotificationProvider>;}

function QueueControls({onPositionChange,position}:{onPositionChange:(position:NotificationViewportPosition)=>void;position:NotificationViewportPosition}){
  const notifications=useNotification(),sequence=useRef(0),last=useRef(''),[status,setStatus]=useState(''),[name,setName]=useState('Studio'),[saved,setSaved]=useState(''),[pending,setPending]=useState(false);
  const job=useRef<{timer:ReturnType<typeof setTimeout>;reject:(error:unknown)=>void}|null>(null),active=useRef(true);
  useEffect(()=>{active.current=true;return()=>{active.current=false;if(job.current){clearTimeout(job.current.timer);job.current.reject(new DOMException('Preview closed','AbortError'));job.current=null;}};},[]);
  function enqueue(){const number=++sequence.current;last.current=notifications.notify({title:`Task ${number} ready`,description:'This notification remains until it is dismissed.',duration:0});setStatus(`Task ${number} added.`);}
  function cancel(){const current=job.current;if(!current)return;job.current=null;clearTimeout(current.timer);current.reject(new DOMException('Save cancelled','AbortError'));}
  async function save(){
    if(job.current||pending||!name.trim())return;const snapshot=name.trim();setPending(true);
    const operation=new Promise<string>((resolve,reject)=>{const timer=setTimeout(()=>{job.current=null;resolve(snapshot);},1200);job.current={timer,reject};});
    try{const value=await notifications.promise(operation,{loading:{title:'Saving workspace',description:snapshot,action:{label:'Cancel save',onPress:cancel}},success:value=>({title:'Workspace saved',description:`${value} is saved in this preview.`,tone:'success'}),error:error=>({title:'Save interrupted',description:error instanceof Error?error.message:'Try again.',tone:'error'})});if(active.current){setSaved(value);setStatus('Workspace name saved.');}}
    catch(error){if(active.current)setStatus(error instanceof DOMException&&error.name==='AbortError'?'Save cancelled.':'Could not save.');}
    finally{if(active.current)setPending(false);}
  }
  return <div className="docs-extended-stack docs-notification-queue-demo"><div className="docs-extended-actions"><Button variant="secondary" size="small" onClick={enqueue}>Add notification</Button><Button variant="secondary" size="small" onClick={()=>{for(let index=0;index<5;index++)enqueue();}}>Queue five</Button><Button variant="quiet" size="small" onClick={()=>setStatus(notifications.update(last.current,{title:'Task updated',description:'The same card now contains this longer update, preserving its key and focus.'})?'Last notification updated.':'The last notification is no longer queued.')}>Update last</Button><Button variant="quiet" size="small" onClick={()=>{notifications.notify({title:'Workspace update',description:`Update ${++sequence.current}`,duration:0},{id:'workspace-update'});setStatus('A repeated identity updates its existing card.');}}>Deduplicated update</Button><Button variant="quiet" size="small" onClick={()=>{notifications.clear();setStatus('Notifications cleared.');}}>Clear notifications</Button></div>
    <Select label="Notification position" selectedKey={position} onSelectionChange={key=>{if(key)onPositionChange(String(key) as NotificationViewportPosition);}} options={(['top-left','top-center','top-right','bottom-left','bottom-center','bottom-right'] as const).map(id=>({id,label:id.replaceAll('-',' ')}))}/>
    <form className="docs-notification-save-form" onSubmit={event=>{event.preventDefault();void save();}}><Input label="Saved workspace name" value={name} onChange={setName} isRequired hint={saved?`Saved value: ${saved}`:'Editing during the save keeps the newer draft.'}/><Button type="submit" isLoading={pending} loadingLabel="Saving…">Save workspace name</Button></form>
    <p className="docs-inline-result" role="status">{status||'Three notifications are visible; additional items stay queued.'}</p>
  </div>;
}
export function NotificationQueueExample(){const[position,setPosition]=useState<NotificationViewportPosition>('bottom-right');return <NotificationProvider position={position} maxVisible={3} maxQueued={8} label="Queued notifications"><QueueControls position={position} onPositionChange={setPosition}/></NotificationProvider>;}

function StackControls({layout,onLayoutChange,position,onPositionChange}:{layout:NotificationQueueLayout;onLayoutChange:(layout:NotificationQueueLayout)=>void;position:NotificationViewportPosition;onPositionChange:(position:NotificationViewportPosition)=>void}){
  const notifications=useNotification();
  function show(){
    notifications.notify({title:'Export complete',description:'Your project files are ready to download.',tone:'success',duration:0},{id:'stack-export'});
    notifications.notify({title:'Review requested',description:'Maya left two comments on the latest design.',duration:0},{id:'stack-review'});
    notifications.notify({title:'Changes saved',description:'Your workspace is up to date.',tone:'information',duration:0},{id:'stack-saved'});
  }
  return <div className="docs-notification-stack-demo"><SegmentedControl aria-label="Notification queue layout" value={layout} onValueChange={value=>onLayoutChange(value as NotificationQueueLayout)} options={[{value:'list',label:'List'},{value:'stack',label:'Stack'}]}/><Select label="Stack position" hideLabel size="small" selectedKey={position} onSelectionChange={key=>{if(key)onPositionChange(String(key) as NotificationViewportPosition);}} options={(['top-left','top-center','top-right','bottom-left','bottom-center','bottom-right'] as const).map(id=>({id,label:id.replaceAll('-',' ')}))}/><Button variant="secondary" size="small" onClick={show}>Show three notifications</Button><Button variant="quiet" size="small" onClick={()=>notifications.clear()}>Clear stack</Button></div>;
}

export function NotificationStackExample(){
  const[layout,setLayout]=useState<NotificationQueueLayout>('stack'),[position,setPosition]=useState<NotificationViewportPosition>('bottom-left');
  return <NotificationProvider layout={layout} position={position} maxVisible={3} label="Stacked notifications"><StackControls layout={layout} onLayoutChange={setLayout} position={position} onPositionChange={setPosition}/></NotificationProvider>;
}
