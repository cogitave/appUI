'use client';

import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

/** Ignore only a queued scroll's dismissal when its anchor did not move. */
export function useAnchorScrollGuard(isOpen: boolean, anchor: RefObject<Element|null>|undefined) {
  const guard=useRef<(()=>boolean)|null>(null);
  useLayoutEffect(()=>{
    const trigger=anchor?.current;if(!isOpen||!trigger)return;
    const openedAt=trigger.getBoundingClientRect();
    let unchanged=false,scrollEvent:Event|null=null;
    const ignore=()=>unchanged&&scrollEvent!==null&&scrollEvent.eventPhase!==Event.NONE;
    guard.current=ignore;
    function onScroll(event:Event){
      if(event.target instanceof Node&&!event.target.contains(trigger??null))return;
      const current=trigger!.getBoundingClientRect();
      unchanged=Math.abs(current.x-openedAt.x)<.5&&Math.abs(current.y-openedAt.y)<.5;
      scrollEvent=event;
    }
    window.addEventListener('scroll',onScroll,true);
    return()=>{window.removeEventListener('scroll',onScroll,true);if(guard.current===ignore)guard.current=null;};
  },[isOpen,anchor]);
  return useCallback(()=>guard.current?.()??false,[]);
}
