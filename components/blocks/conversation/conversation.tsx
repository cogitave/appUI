'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { RiArrowDownLine } from '@remixicon/react';
import { animate } from 'motion/react';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMotionTokens } from '@/hooks/use-motion-tokens';
import { cx } from '@/utils/cx';

export type ConversationProps = {
  children: ReactNode;
  label?: string;
  conversationKey?: string;
  isStreaming?: boolean;
  autoScroll?: boolean;
  initialScroll?: 'start'|'end';
  height?: CSSProperties['height'];
  footer?: ReactNode;
  header?: ReactNode;
  className?: string;
  contentClassName?: string;
};

/** Follow new content while at the end; preserve a reader's position above it. */
export function Conversation({children,label='Conversation',conversationKey,isStreaming=false,autoScroll=true,initialScroll='end',height,header,footer,className,contentClassName}: ConversationProps) {
  const viewport=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),following=useRef(initialScroll==='end'),jumping=useRef(false),lastTop=useRef(0),manualIntent=useRef(false),touchStart=useRef<number|null>(null),scrollAnimation=useRef<{stop():void}|null>(null),scrollTarget=useRef<'start'|'end'|null>(null),scrollGeneration=useRef(0),scrollToLatest=useRef<(target:'start'|'end')=>void>(()=>{});
  const [atEnd,setAtEnd]=useState(true),reduced=useMediaQuery('(prefers-reduced-motion: reduce)'),motion=useMotionTokens(viewport);
  function measurePosition(fromScroll=false){const el=viewport.current;if(!el)return;const near=el.scrollHeight-el.clientHeight-el.scrollTop<=32;if(!jumping.current){if(manualIntent.current){if(fromScroll&&!near){manualIntent.current=false;following.current=false;}}else if(near)following.current=true;else if(fromScroll&&el.scrollTop<lastTop.current-.5)following.current=false;}lastTop.current=el.scrollTop;setAtEnd(near);}
  useLayoutEffect(()=>{
    const el=viewport.current,body=content.current;if(!el||!body)return;
    interrupt();manualIntent.current=false;touchStart.current=null;lastTop.current=0;
    following.current=initialScroll==='end';
    el.scrollTop=initialScroll==='end'?el.scrollHeight:0;measurePosition();
    const observer=new ResizeObserver(()=>{if(scrollTarget.current==='end'){scrollToLatest.current('end');}else if(autoScroll&&following.current){el.scrollTop=el.scrollHeight;}measurePosition();});
    observer.observe(el);observer.observe(body);
    return()=>{observer.disconnect();interrupt();};
  },[conversationKey,autoScroll,initialScroll]);
  function interrupt(){scrollGeneration.current++;scrollAnimation.current?.stop();scrollAnimation.current=null;scrollTarget.current=null;jumping.current=false;}
  function scrollTo(target:'start'|'end'){
    const el=viewport.current;if(!el)return;
    interrupt();const generation=scrollGeneration.current;
    scrollTarget.current=target;jumping.current=true;manualIntent.current=target==='start';following.current=target==='end';
    const top=target==='end'?Math.max(0,el.scrollHeight-el.clientHeight):0;
    function complete(){if(scrollGeneration.current!==generation)return;scrollAnimation.current=null;scrollTarget.current=null;jumping.current=false;measurePosition();}
    if(reduced||Math.abs(el.scrollTop-top)<.5){el.scrollTop=top;complete();return;}
    scrollAnimation.current=animate(el.scrollTop,top,{duration:motion.standard,ease:motion.ease,onUpdate:value=>{el.scrollTop=value;},onComplete:complete});
  }
  function jump(){viewport.current?.focus({preventScroll:true});scrollTo('end');}
  scrollToLatest.current=scrollTo;
  return <section className={cx('ui-conversation',className)} aria-label={label} style={height?{height}:undefined}>
    {header && <header className="ui-conversation__header">{header}</header>}
    <div className="ui-conversation__body">
    <div ref={viewport} className="ui-conversation__viewport" tabIndex={0} role="log" aria-label={`${label} messages`} aria-live="polite" aria-relevant="additions" aria-atomic="false" aria-busy={isStreaming || undefined} onScroll={()=>measurePosition(true)} onWheel={event=>{manualIntent.current=event.deltaY<0;if(event.deltaY<0)following.current=false;interrupt();}} onTouchStart={event=>{touchStart.current=event.touches[0]?.clientY??null;interrupt();}} onTouchMove={event=>{if(touchStart.current!==null){manualIntent.current=(event.touches[0]?.clientY??touchStart.current)>touchStart.current;if(manualIntent.current)following.current=false;}}} onTouchEnd={()=>{touchStart.current=null;}} onTouchCancel={()=>{touchStart.current=null;}} onPointerDown={interrupt} onKeyDown={event=>{if(event.defaultPrevented||(event.target as HTMLElement).closest('input,textarea,[contenteditable="true"]'))return;if((event.key==='Home'||event.key==='End')&&event.target===viewport.current){event.preventDefault();scrollTo(event.key==='End'?'end':'start');return;}if(event.key==='End'){manualIntent.current=false;following.current=true;}if(['ArrowUp','PageUp','Home'].includes(event.key)||event.key===' '&&event.shiftKey){manualIntent.current=true;following.current=false;}else if(['ArrowDown','PageDown',' '].includes(event.key))manualIntent.current=false;if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))interrupt();}}>
      <div ref={content} className={cx('ui-conversation__content',contentClassName)}>{children}</div>
    </div>
    {!atEnd && <div className="ui-conversation__jump"><Tooltip content="Jump to latest message"><IconButton icon={RiArrowDownLine} size="small" aria-label="Jump to latest message" onClick={jump}/></Tooltip></div>}
    </div>
    {footer && <div className="ui-conversation__footer">{footer}</div>}
  </section>;
}
