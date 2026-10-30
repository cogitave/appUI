'use client';

import {createContext,useContext,useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type FocusEvent,type KeyboardEvent,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {mergeProps,useButton,useToast,useToastRegion} from 'react-aria';
import {ToastQueue,useToastQueue,type QueuedToast,type ToastState} from 'react-stately';
import {motion,useIsPresent,useReducedMotion} from 'motion/react';
import {CloseButton} from '@/components/base/buttons/close-button';
import {Button} from '@/components/base/buttons/button';
import {Collapsible} from '@/components/base/collapsible/collapsible';
import {RiArrowDownSLine} from '@remixicon/react';
import {NotificationQueue} from './notification-queue';
import {ScrollArea} from '@/components/base/scroll-area/scroll-area';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import {useDismissTimer} from '@/hooks/use-dismiss-timer';
import {NotificationBody} from './notification-content';
import type {NotificationContent,NotificationOptions,NotificationViewportPosition,NotificationQueueLayout} from './notification-types';
import {cx} from '@/utils/cx';

type Entry={content:NotificationOptions;revision:number;returnFocus:HTMLElement|null};
type FocusHandoff={key:string;index:number;origin:HTMLElement|null;keyboard:boolean};
type QueueFocus={root:{current:HTMLDivElement|null};pending:FocusHandoff|null;outside:HTMLElement|null;keyboard:boolean};
export type NotificationAPI={
  notify:(content:NotificationOptions,options?:{id?:string;returnFocus?:HTMLElement|null})=>string;
  update:(key:string,content:Partial<NotificationOptions>)=>boolean;
  dismiss:(key:string)=>void;
  clear:()=>void;
  promise:<T>(promise:Promise<T>,messages:{loading:NotificationOptions;success:NotificationOptions|((value:T)=>NotificationOptions);error:NotificationOptions|((error:unknown)=>NotificationOptions)})=>Promise<T>;
};
export type NotificationProviderProps={children:ReactNode;position?:NotificationViewportPosition;layout?:NotificationQueueLayout;maxVisible?:number;maxQueued?:number;defaultDuration?:number;label?:string;className?:string};
const Context=createContext<NotificationAPI|null>(null);
export function useNotification(){const api=useContext(Context);if(!api)throw new Error('useNotification must be used inside NotificationProvider.');return api;}
function bounded(value:number,fallback:number,min:number,max:number){return Number.isFinite(value)?Math.min(max,Math.max(min,Math.floor(value))):fallback;}
function canFocus(element:Element|null):element is HTMLElement{
  return element instanceof HTMLElement&&element!==document.body&&element!==document.documentElement&&element.isConnected&&!element.closest('[inert]')&&!element.matches(':disabled')&&!!element.getClientRects().length&&getComputedStyle(element).visibility!=='hidden';
}

function ToastCard({toast,state,entry,paused,focus,hidden=false}:{toast:QueuedToast<NotificationOptions>;state:ToastState<NotificationOptions>;entry:Entry;paused:boolean;focus:QueueFocus;hidden?:boolean}){
  const root=useRef<HTMLDivElement>(null),close=useRef<HTMLButtonElement>(null),present=useIsPresent();
  const content=entry.content,descriptionId=useId(),hasDescription=content.description!==undefined&&content.description!==null;
  const {toastProps,contentProps,titleProps,descriptionProps,closeButtonProps}=useToast({toast,'aria-describedby':hasDescription?descriptionId:undefined},state,root);
  const {buttonProps}=useButton({...closeButtonProps,isDisabled:!present||hidden},close);
  useDismissTimer(content.duration,paused||hidden,present,()=>state.close(toast.key),entry.revision);
  function action(item:NonNullable<NotificationContent['action']>){
    if(item.dismiss!==false){
      state.close(toast.key);
      // The action owns its next focus destination, including a newly opened dialog.
      focus.pending=null;
      if(canFocus(entry.returnFocus))entry.returnFocus.focus({preventScroll:true});
    }
    item.onPress();
  }
  return <div {...toastProps} role={present&&!hidden?toastProps.role:undefined} ref={root} aria-describedby={hasDescription?descriptionId:undefined} className="ui-notification" data-tone={content.tone??'neutral'} data-toast-key={toast.key} data-exiting={!present||undefined} inert={!present||hidden} aria-hidden={!present||hidden||undefined}>
    <NotificationBody content={content} contentProps={contentProps} titleProps={titleProps} descriptionProps={{...descriptionProps,id:descriptionId}} onAction={action}/>
    <CloseButton {...buttonProps} ref={close} className="ui-notification__close" size="xs" aria-label={`Dismiss ${content.title}`}/>
  </div>;
}

function Region({state,entries,position,layout,label,className,focus}:{state:ToastState<NotificationOptions>;entries:Map<string,Entry>;position:NotificationViewportPosition;layout:NotificationQueueLayout;label:string;className?:string;focus:QueueFocus}){
  const root=focus.root,{regionProps}=useToastRegion({'aria-label':label},state,root),tokens=useMotionTokens(root),reduced=useReducedMotion();
  const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[hidden,setHidden]=useState(false);
  const [expanded,setExpanded]=useState(false),[pinned,setPinned]=useState(false),toggle=useRef<HTMLButtonElement>(null),queueId=useId(),lastCount=useRef(0);
  if(state.visibleToasts.length>1)lastCount.current=state.visibleToasts.length;
  useEffect(()=>{function visibility(){setHidden(document.hidden);}visibility();document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[]);
  // Presence keeps outgoing cards mounted. Preserve owned focus before inert can
  // blur a removed control, including when a previously empty queue is reused.
  useLayoutEffect(()=>{
    const pending=focus.pending;if(!pending)return;focus.pending=null;
    const active=document.activeElement;
    if(canFocus(active)&&(!root.current?.contains(active)&&active!==pending.origin||active.closest('[data-toast-key]:not([data-exiting])')))return;
    const retained=state.visibleToasts.find(toast=>toast.key===pending.key);
    const next=retained??(pending.keyboard?state.visibleToasts[Math.min(pending.index,state.visibleToasts.length-1)]:undefined);
    const target=next?root.current?.querySelector<HTMLElement>(`[data-toast-key="${CSS.escape(next.key)}"]:not([data-exiting])`):pending.origin;
    if(canFocus(target??null))target!.focus({preventScroll:true});
  },[state.visibleToasts,entries,focus,root]);
  const paused=hovered||focused||hidden;
  function onFocus(event:FocusEvent<HTMLDivElement>){setFocused(true);if(layout==='stack'&&!toggle.current?.contains(event.target))setExpanded(true);if(canFocus(event.relatedTarget)&&!event.currentTarget.contains(event.relatedTarget))focus.outside=event.relatedTarget;}
  function onBlur(event:FocusEvent<HTMLDivElement>){if(!event.currentTarget.contains(event.relatedTarget)){setFocused(false);if(!hovered&&!pinned)setExpanded(false);if(canFocus(event.relatedTarget))focus.pending=null;}}
  function onKeyDown(event:KeyboardEvent<HTMLDivElement>){
    focus.keyboard=true;
    if(event.key==='Escape'&&layout==='stack'&&expanded&&state.visibleToasts.length>1){event.preventDefault();event.stopPropagation();toggle.current?.focus({preventScroll:true});setExpanded(false);setPinned(false);}
  }
  return createPortal(<motion.div className={cx('ui-notification-region',className)} data-position={position} data-layout={layout} data-expanded={layout==='stack'&&expanded||undefined} data-empty={!state.visibleToasts.length||undefined} data-paused={paused||undefined} layout="position" layoutDependency={position} transition={{layout:{duration:reduced?0:tokens.standard,ease:tokens.ease}}}>
    <div {...mergeProps(regionProps,{onMouseEnter:()=>setHovered(true),onMouseLeave:()=>{setHovered(false);if(!focused&&!pinned)setExpanded(false);},onKeyDownCapture:onKeyDown,onPointerDownCapture:()=>{focus.keyboard=false;},onFocusCapture:onFocus,onBlurCapture:onBlur})} ref={root} className="ui-notification-region__landmark" inert={!state.visibleToasts.length} aria-hidden={!state.visibleToasts.length||undefined}>
      <ScrollArea label={label} className="ui-notification-region__scroll" renderViewport={({ref,className,children})=><div ref={ref} className={className} tabIndex={-1} onMouseEnter={()=>{if(layout==='stack')setExpanded(true);}}>{children}</div>}>
        <NotificationQueue id={queueId} keys={state.visibleToasts.map(toast=>toast.key)} layout={layout} expanded={expanded} bottom={position.startsWith('bottom')} tokens={tokens}>{(key,index,hidden)=>{const toast=state.visibleToasts[index];return <ToastCard toast={toast} state={state} entry={entries.get(key)??{content:toast.content,revision:0,returnFocus:null}} paused={paused} focus={focus} hidden={hidden}/>;}}</NotificationQueue>
      </ScrollArea>
      <Collapsible isOpen={layout==='stack'&&state.visibleToasts.length>1}><div className="ui-notification-stack__toolbar"><Button ref={toggle} variant="ghost" size="small" trailingIcon={RiArrowDownSLine} aria-expanded={expanded} aria-controls={queueId} onClick={()=>{const next=!expanded;setExpanded(next);setPinned(next);}}>{expanded?'Collapse notifications':`Show ${lastCount.current} notifications`}</Button></div></Collapsible>
    </div>
  </motion.div>,document.body);
}

/** A scoped queue, with shared cards and public React Aria focus/landmark behavior. */
export function NotificationProvider({children,position='top-right',layout='list',maxVisible=3,maxQueued=20,defaultDuration=5000,label='Notifications',className}:NotificationProviderProps){
  const [visibleLimit]=useState(()=>bounded(maxVisible,3,1,5)),[mounted,setMounted]=useState(false);
  const [queue]=useState(()=>new ToastQueue<NotificationOptions>({maxVisibleToasts:visibleLimit}));
  const nativeState=useToastQueue(queue),entriesRef=useRef(new Map<string,Entry>()),identities=useRef(new Map<string,string>()),[entries,setEntries]=useState(new Map<string,Entry>());
  const visibleRef=useRef(nativeState.visibleToasts);visibleRef.current=nativeState.visibleToasts;
  const focus=useRef<QueueFocus>({root:{current:null},pending:null,outside:null,keyboard:true}).current;
  const alive=useRef(true),options=useRef({defaultDuration,maxQueued});options.current={defaultDuration,maxQueued};
  useEffect(()=>setMounted(true),[]);
  useLayoutEffect(()=>{alive.current=true;return()=>{alive.current=false;queue.clear();entriesRef.current.clear();identities.current.clear();};},[queue]);
  const api=useMemo<NotificationAPI>(()=>{
    function rememberFocus(){
      const active=document.activeElement,card=focus.root.current?.contains(active)?active?.closest<HTMLElement>('[data-toast-key]'):null,key=card?.dataset.toastKey,index=visibleRef.current.findIndex(toast=>toast.key===key);
      if(!key||index<0)return;
      focus.pending={key,index,origin:canFocus(focus.outside)?focus.outside:entriesRef.current.get(key)?.returnFocus??null,keyboard:focus.keyboard};
    }
    function close(key:string){
      rememberFocus();
      // The landmark's last focused element must survive an empty queue cycle.
      // Its native viewport remains mounted while the outgoing card becomes inert.
      if(visibleRef.current.length===1&&focus.pending?.key===key){
        const anchor=focus.root.current?.querySelector<HTMLElement>('.ui-scroll-area__viewport');
        if(canFocus(anchor??null))anchor!.focus({preventScroll:true});
      }
      queue.close(key);
    }
    function sync(){if(alive.current)setEntries(new Map(entriesRef.current));}
    function update(key:string,patch:Partial<NotificationOptions>){
      const entry=entriesRef.current.get(key);if(!alive.current||!entry)return false;rememberFocus();
      entriesRef.current.set(key,{...entry,content:{...entry.content,...patch},revision:entry.revision+1});sync();return true;
    }
    function notify(content:NotificationOptions,dedupe?:{id?:string;returnFocus?:HTMLElement|null}){
      if(!alive.current)return '';
      // A queue addition may synchronously update focus, so capture the producer first.
      const returnFocus=dedupe?.returnFocus!==undefined?dedupe.returnFocus:document.activeElement instanceof HTMLElement&&!document.activeElement.closest('.ui-notification-region')?document.activeElement:null;
      const existing=dedupe?.id?identities.current.get(dedupe.id):undefined;
      const prepared={...content,duration:content.duration??(content.tone==='error'||content.isPending?0:options.current.defaultDuration)};
      if(existing&&update(existing,prepared))return existing;
      const limit=bounded(options.current.maxQueued,20,visibleLimit,100);
      while(entriesRef.current.size>=limit){const oldest=entriesRef.current.keys().next().value;if(oldest===undefined)break;close(oldest);}
      rememberFocus();
      const key=queue.add(prepared,{onClose:()=>{const entry=entriesRef.current.get(key);entriesRef.current.delete(key);for(const [id,value]of identities.current)if(value===key)identities.current.delete(id);sync();entry?.content.onDismiss?.();}});
      entriesRef.current.set(key,{content:prepared,revision:0,returnFocus});if(dedupe?.id)identities.current.set(dedupe.id,key);sync();return key;
    }
    function replace(key:string,content:NotificationOptions){const entry=entriesRef.current.get(key);if(!alive.current||!entry)return;rememberFocus();entriesRef.current.set(key,{...entry,content,revision:entry.revision+1});sync();}
    return {notify,update,dismiss:close,clear:()=>{for(const key of [...entriesRef.current.keys()])close(key);},promise:async<T,>(promise:Promise<T>,messages:{loading:NotificationOptions;success:NotificationOptions|((value:T)=>NotificationOptions);error:NotificationOptions|((error:unknown)=>NotificationOptions)})=>{
      const key=notify({...messages.loading,isPending:true,duration:0});
      try{const value=await promise,content=typeof messages.success==='function'?messages.success(value):messages.success;replace(key,{...content,isPending:false,duration:content.duration??options.current.defaultDuration});return value;}
      catch(error){const content=typeof messages.error==='function'?messages.error(error):messages.error;replace(key,{...content,isPending:false,duration:content.duration??0});throw error;}
    }};
  },[queue,visibleLimit,focus]);
  const state={...nativeState,close:api.dismiss};
  return <Context.Provider value={api}>{children}{mounted&&<Region state={state} entries={entries} position={position} layout={layout} label={label} className={className} focus={focus}/>}</Context.Provider>;
}
