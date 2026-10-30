'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import { CloseButton } from '@/components/base/buttons/close-button';
import { useDismissTimer,notificationTimeout } from '@/hooks/use-dismiss-timer';
import { useMotionTokens } from '@/hooks/use-motion-tokens';
import { NotificationBody } from './notification-content';
import { NotificationProvider,useNotification } from './notification-provider';
import type { NotificationOptions,NotificationViewportPosition } from './notification-types';
import { cx } from '@/utils/cx';

export { NotificationProvider,useNotification };
export type {NotificationAPI,NotificationProviderProps} from './notification-provider';
export type {NotificationOptions,NotificationViewportPosition,NotificationQueueLayout} from './notification-types';
export type NotificationProps=NotificationOptions&{onExitComplete?:()=>void;className?:string};

function NotificationSurface({content,onClose,paused,className}:{content:NotificationOptions;onClose:()=>void;paused:boolean;className?:string}){
  const present=useIsPresent(),root=useRef<HTMLDivElement>(null),tokens=useMotionTokens(root),reduced=useReducedMotion(),duration=notificationTimeout(content.duration);
  return <motion.div ref={root} className={cx('ui-notification',className)} data-tone={content.tone??'neutral'} data-paused={paused||undefined} data-exiting={!present||undefined} role={content.tone==='error'?'alert':'status'} inert={!present} aria-hidden={!present||undefined} initial={reduced?false:{opacity:0,y:9,scale:.985}} animate={{opacity:1,y:0,scale:1}} exit={{height:0,paddingTop:0,paddingBottom:0,borderTopWidth:0,borderBottomWidth:0,opacity:0,y:-6,scale:.985}} transition={{duration:reduced?0:tokens.standard,ease:tokens.ease}}>
    <NotificationBody content={content} onAction={item=>{if(item.dismiss)onClose();item.onPress();}}/><CloseButton className="ui-notification__close" size="xs" aria-label="Dismiss notification" onClick={onClose}/>
    {duration&&<span key={duration} className="ui-notification__countdown" style={{animationDuration:`${duration}ms`,animationPlayState:paused?'paused':'running'}} aria-hidden/>}
  </motion.div>;
}

export function Notification({onDismiss,onExitComplete,className,...content}:NotificationProps){
  const [visible,setVisible]=useState(true),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[hidden,setHidden]=useState(false),dismissed=useRef(false);
  useEffect(()=>{function visibility(){setHidden(document.hidden);}visibility();document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[]);
  const paused=hovered||focused||hidden;
  function dismiss(){if(dismissed.current)return;dismissed.current=true;setVisible(false);onDismiss?.();}
  useDismissTimer(content.duration,paused,visible,dismiss);
  return <div className="ui-notification-presence" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}><AnimatePresence onExitComplete={onExitComplete}>{visible&&<NotificationSurface content={content} paused={paused} onClose={dismiss} className={className}/>}</AnimatePresence></div>;
}

export function NotificationViewport({ children, position = 'top-right', className }: { children: ReactNode; position?: NotificationViewportPosition; className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<div className={cx('ui-notification-viewport', className)} data-position={position}>{children}</div>, document.body);
}
