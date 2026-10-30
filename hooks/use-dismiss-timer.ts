'use client';

import {useEffect,useLayoutEffect,useRef} from 'react';

/** Zero/invalid durations persist. Automatic messages remain readable for 5s. */
export function notificationTimeout(duration?:number){return duration!==undefined&&Number.isFinite(duration)&&duration>0?Math.min(2147483647,Math.max(5000,duration)):undefined;}

/** Pause without restarting; a new duration or content revision starts a new clock. */
export function useDismissTimer(duration:number|undefined,paused:boolean,enabled:boolean,onDismiss:()=>void,revision=0){
  const timeout=notificationTimeout(duration),latest=useRef(onDismiss),remaining=useRef(timeout??0),previous=useRef({timeout,revision});
  useLayoutEffect(()=>{latest.current=onDismiss;},[onDismiss]);
  useEffect(()=>{
    if(previous.current.timeout!==timeout||previous.current.revision!==revision){remaining.current=timeout??0;previous.current={timeout,revision};}
    if(!enabled||paused||!timeout)return;
    const started=performance.now(),timer=setTimeout(()=>latest.current(),Math.max(0,remaining.current));
    return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(performance.now()-started));};
  },[timeout,paused,enabled,revision]);
}
