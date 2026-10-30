'use client';

import {useId,useLayoutEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type ReactNode} from 'react';
import {motion} from 'motion/react';
import {useMediaQuery} from '@/hooks/use-media-query';
import {useLocale} from 'react-aria-components';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import {useFieldDisabled} from '@/components/base/field/field-context';
import {cx} from '@/utils/cx';

export type SegmentOption={value:string;label:string;icon?:ReactNode;isDisabled?:boolean};
export type SegmentedControlProps={
 options:SegmentOption[];value?:string;defaultValue?:string;onValueChange?:(value:string)=>void;
 variant?:'soft'|'outline'|'underline';size?:'small'|'medium';orientation?:'horizontal'|'vertical';fit?:'content'|'equal';isDisabled?:boolean;
 id?:string;'aria-label':string;'aria-describedby'?:string;className?:string;style?:CSSProperties;
};

/** A compact configuration choice. Native RadioGroup is preferred for form fields. */
export function SegmentedControl({options,value,defaultValue,onValueChange,variant='soft',size='medium',orientation='horizontal',fit='content',isDisabled:disabled,id:domId,'aria-label':ariaLabel,'aria-describedby':descriptionId,className,style}:SegmentedControlProps){
 const {direction}=useLocale(),isDisabled=useFieldDisabled(disabled);
 const [internal,setInternal]=useState(defaultValue??options.find(option=>!option.isDisabled)?.value??'');
 const selected=value??internal;
 const tabStop=options.find(option=>!option.isDisabled&&option.value===selected)?.value??options.find(option=>!option.isDisabled)?.value;
 const id=useId(),root=useRef<HTMLDivElement>(null),reduced=useMediaQuery('(prefers-reduced-motion: reduce)'),tokens=useMotionTokens(root);
 function reveal(target:HTMLElement){
  const group=root.current;if(!group)return;
  const frame=group.getBoundingClientRect(),item=target.getBoundingClientRect();
  if(orientation==='vertical'){
   const scale=frame.height/group.clientHeight||1,delta=item.top<frame.top?item.top-frame.top:item.bottom>frame.bottom?item.bottom-frame.bottom:0;
   if(group.scrollHeight>group.clientHeight)group.scrollTop+=delta/scale;
  }else{
   const scale=frame.width/group.clientWidth||1,delta=item.left<frame.left?item.left-frame.left:item.right>frame.right?item.right-frame.right:0;
   if(group.scrollWidth>group.clientWidth)group.scrollLeft+=delta/scale;
  }
 }
 useLayoutEffect(()=>{
  const target=root.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(selected)}"]`);if(target)reveal(target);
 },[selected,orientation]);
 function choose(next:string){if(isDisabled)return;if(value===undefined)setInternal(next);onValueChange?.(next);}
 function onKeyDown(event:KeyboardEvent<HTMLDivElement>){
  if(isDisabled||event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  event.preventDefault();
  const enabled=options.filter(option=>!option.isDisabled);if(!enabled.length)return;
  // Follow actual focus, preserving every key even when a controlled value lags.
  const focused=event.target instanceof Element?event.target.closest<HTMLElement>('[data-value]')?.dataset.value:undefined;
  const current=enabled.findIndex(option=>option.value===(focused??selected));
  const forward=event.key==='ArrowDown'||event.key===(direction==='rtl'?'ArrowLeft':'ArrowRight');
  const next=event.key==='Home'?0:event.key==='End'?enabled.length-1:forward?(current+1)%enabled.length:(current-1+enabled.length)%enabled.length;
  const target=enabled[next];if(!target)return;choose(target.value);
  event.currentTarget.querySelector<HTMLElement>(`[data-value="${CSS.escape(target.value)}"]`)?.focus({preventScroll:true});
 }
 return <div id={domId} ref={root} style={style} className={cx('ui-segmented',className)} role="radiogroup" aria-label={ariaLabel} aria-describedby={descriptionId} aria-orientation={orientation} aria-disabled={isDisabled||undefined} data-variant={variant} data-size={size} data-orientation={orientation} data-fit={fit} onKeyDown={onKeyDown} onFocus={event=>{const target=event.target.closest<HTMLElement>('[data-value]');if(target)reveal(target);}}>{options.map(option=><button key={option.value} type="button" role="radio" data-value={option.value} aria-checked={selected===option.value} tabIndex={tabStop===option.value?0:-1} disabled={isDisabled||option.isDisabled} onClick={()=>choose(option.value)}>{selected===option.value&&<motion.span layoutId={`${id}-segment`} className="ui-segmented__indicator" transition={{duration:reduced?0:tokens.standard,ease:tokens.ease}}/>}<span className="ui-segmented__content">{option.icon}<span className="ui-segmented__label">{option.label}</span></span></button>)}</div>;
}
