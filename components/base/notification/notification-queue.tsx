'use client';

import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {AnimatePresence,motion,useIsPresent,useReducedMotion} from 'motion/react';
import type {MotionTokens} from '@/hooks/use-motion-tokens';
import type {NotificationQueueLayout} from './notification-types';

const gap=10,depth=8,inset=4;

function QueueItem({children,y,height,scale,zIndex,peek,tokens,following}:{children:ReactNode;y:number;height:number;scale:number;zIndex:number;peek:boolean;tokens:MotionTokens;following:boolean}){
  const present=useIsPresent(),reduced=useReducedMotion();
  return <motion.div className="ui-notification-region__item" data-peek={peek||undefined} data-exiting={!present||undefined} inert={peek||!present} aria-hidden={peek||!present||undefined}
    style={{zIndex}} initial={reduced?false:{opacity:0,y:y+8,scale}} animate={{opacity:1,y,height,scale}}
    exit={{height:0,opacity:0,y:y-6,scale}} transition={{duration:reduced?0:tokens.standard,ease:tokens.ease,height:{duration:reduced||following?0:tokens.standard},y:{duration:reduced||following?0:tokens.standard}}}>{children}</motion.div>;
}

/** Measure natural cards independently of their animated placement and stack shells. */
export function NotificationQueue({keys,layout,expanded,bottom,tokens,children,id}:{keys:string[];layout:NotificationQueueLayout;expanded:boolean;bottom:boolean;tokens:MotionTokens;children:(key:string,index:number,hidden:boolean)=>ReactNode;id:string}){
  const root=useRef<HTMLDivElement>(null),reduced=useReducedMotion(),[heights,setHeights]=useState<Record<string,number>>({}),[following,setFollowing]=useState(false);
  const identities=JSON.stringify(keys);
  useLayoutEffect(()=>{
    const element=root.current;if(!element)return;
    const cards=[...element.querySelectorAll<HTMLElement>('.ui-notification:not([data-exiting])')];
    let alive=true;const observed=new WeakSet<Animation>();
    function measure(){
      if(!alive)return;
      const next=Object.fromEntries(cards.filter(card=>card.isConnected).map(card=>[card.dataset.toastKey!,card.offsetHeight]));
      const moving=cards.flatMap(card=>card.getAnimations({subtree:true})).filter(animation=>animation.playState==='running'&&'transitionProperty' in animation&&animation.transitionProperty==='height');
      setFollowing(moving.length>0);
      for(const animation of moving)if(!observed.has(animation)){observed.add(animation);animation.finished.then(measure,measure);}
      setHeights(current=>Object.keys(current).length===Object.keys(next).length&&Object.entries(next).every(([key,value])=>current[key]===value)?current:next);
    }
    measure();const observer=new ResizeObserver(measure);cards.forEach(card=>observer.observe(card,{box:'border-box'}));
    return()=>{alive=false;observer.disconnect();};
  },[identities]);
  const sizes=keys.map(key=>heights[key]??74),front=sizes[0]??0,stacked=layout==='stack'&&!expanded;
  const contentHeight=stacked?front+depth*Math.max(0,keys.length-1):sizes.reduce((sum,size)=>sum+size,0)+gap*Math.max(0,keys.length-1);
  let offset=0;
  return <motion.div ref={root} id={id} className="ui-notification-region__list" data-layout={layout} data-expanded={layout==='stack'&&expanded||undefined}
    initial={false} animate={{height:keys.length?contentHeight+inset*2:0}} transition={{duration:reduced||following?0:tokens.standard,ease:tokens.ease}}>
    <AnimatePresence initial={false}>{keys.map((key,index)=>{
      const hidden=stacked&&index>0,ownHeight=sizes[index],height=hidden?front:ownHeight;
      const y=stacked?(bottom?depth*(keys.length-1-index):depth*index):layout==='stack'&&bottom?contentHeight-offset-ownHeight:offset;
      offset+=ownHeight+gap;
      return <QueueItem key={key} y={y+inset} height={height} scale={hidden?1-index*.025:1} zIndex={keys.length-index} peek={hidden} tokens={tokens} following={following}>{children(key,index,hidden)}</QueueItem>;
    })}</AnimatePresence>
  </motion.div>;
}
