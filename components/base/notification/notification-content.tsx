'use client';

import {useRef,type HTMLAttributes} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {RiCheckboxCircleLine,RiErrorWarningLine,RiInformationLine} from '@remixicon/react';
import {Avatar} from '@/components/base/avatar/avatar';
import {Button} from '@/components/base/buttons/button';
import {Spinner} from '@/components/base/spinner/spinner';
import {AnimatedHeight} from '@/components/base/animated-height/animated-height';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import type {NotificationContent} from './notification-types';

const icons={neutral:RiInformationLine,information:RiInformationLine,success:RiCheckboxCircleLine,error:RiErrorWarningLine};
export function NotificationBody({content,contentProps,titleProps,descriptionProps,onAction}:{content:NotificationContent;contentProps?:HTMLAttributes<HTMLDivElement>;titleProps?:HTMLAttributes<HTMLElement>;descriptionProps?:HTMLAttributes<HTMLParagraphElement>;onAction?:(action:NonNullable<NotificationContent['action']>)=>void}){
  const {title,description,tone='neutral',avatar,icon,iconKey,timestamp,action,secondaryAction,isPending}=content,Icon=icons[tone];
  const root=useRef<HTMLDivElement>(null),tokens=useMotionTokens(root),reduced=useReducedMotion();
  const identity=isPending?'pending':avatar?`avatar:${avatar.src??avatar.initials}`:icon?iconKey??'custom':tone;
  const press=(item:NonNullable<NotificationContent['action']>)=>onAction?onAction(item):item.onPress();
  return <AnimatedHeight className="ui-notification__body-height"><div className="ui-notification__body-row">
    <div ref={root} className="ui-notification__icon" aria-hidden><AnimatePresence initial={false}><motion.span className="ui-notification__icon-content" key={identity} data-icon-key={identity} initial={reduced?false:{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.8}} transition={{duration:reduced?0:tokens.fast,ease:tokens.ease}}>{isPending?<Spinner size="sm"/>:avatar?<><Avatar size="md" src={avatar.src} alt={avatar.alt} initials={avatar.initials}/>{avatar.presence&&<span className="ui-notification__presence" data-presence={avatar.presence}/>}</>:icon??<Icon size={20} aria-hidden/>}</motion.span></AnimatePresence></div>
    <div className="ui-notification__content"><div {...contentProps}><div className="ui-notification__heading"><strong {...titleProps}>{title}</strong>{timestamp&&<time>{timestamp}</time>}</div>{description!==undefined&&description!==null&&<p {...descriptionProps}>{description}</p>}</div>
      {(action||secondaryAction)&&<div className="ui-notification__actions">{secondaryAction&&<Button size="small" variant="secondary" onClick={()=>press(secondaryAction)}>{secondaryAction.label}</Button>}{action&&<Button size="small" className="ui-notification__primary" onClick={()=>press(action)}>{action.label}</Button>}</div>}
    </div>
  </div></AnimatedHeight>;
}
