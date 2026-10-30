'use client';

import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {animate,motion,usePresence,useReducedMotion} from 'motion/react';
import {useMotionTokens} from '@/hooks/use-motion-tokens';

/** Native rows collapse their cells together; outgoing controls become inert at once. */
export function DataTableRow({children,id,isSelected,animateOnMount}:{children:ReactNode;id:string;isSelected?:boolean;animateOnMount:boolean}) {
 const root=useRef<HTMLTableRowElement>(null),[present,safeToRemove]=usePresence(),reduced=useReducedMotion(),tokens=useMotionTokens(root),entered=useRef(!animateOnMount),lastPresent=useRef(true);
 useLayoutEffect(()=>{
  const row=root.current,reversing=present&&!lastPresent.current;lastPresent.current=present;if(!row||present&&entered.current&&!reversing)return;
  let cancelled=false;
  const cells=[...row.cells].map(cell=>{const inner=cell.firstElementChild as HTMLElement;return {cell,inner,current:{height:cell.getBoundingClientRect().height,inner:inner.getBoundingClientRect().height,top:parseFloat(getComputedStyle(cell).paddingTop),bottom:parseFloat(getComputedStyle(cell).paddingBottom)}};});
  for(const {cell,inner} of cells){cell.style.height='';cell.style.paddingTop='';cell.style.paddingBottom='';inner.style.height='';}
  const controls=cells.flatMap(({cell,inner,current})=>{
   const end={height:cell.getBoundingClientRect().height,inner:inner.getBoundingClientRect().height,top:parseFloat(getComputedStyle(cell).paddingTop),bottom:parseFloat(getComputedStyle(cell).paddingBottom)};
   const from=present&&!entered.current?{height:0,inner:0,top:0,bottom:0}:current;
   inner.style.overflow='hidden';
   return [animate(cell,{height:[from.height,present?end.height:0],paddingTop:[from.top,present?end.top:0],paddingBottom:[from.bottom,present?end.bottom:0]},{duration:reduced?0:tokens.standard,ease:tokens.ease}),animate(inner,{height:[from.inner,present?end.inner:0]},{duration:reduced?0:tokens.standard,ease:tokens.ease})];
  });
  const rowStyle=getComputedStyle(row),rowPadding={top:parseFloat(rowStyle.paddingTop)||0,bottom:parseFloat(rowStyle.paddingBottom)||0,gap:parseFloat(rowStyle.rowGap)||0};
  controls.push(animate(row,{opacity:[present&&!entered.current?0:+getComputedStyle(row).opacity,present?1:0],paddingTop:[rowPadding.top,present?rowPadding.top:0],paddingBottom:[rowPadding.bottom,present?rowPadding.bottom:0],rowGap:[rowPadding.gap,present?rowPadding.gap:0]},{duration:reduced?0:tokens.standard,ease:tokens.ease}));
  Promise.all(controls).then(()=>{if(cancelled)return;if(present){entered.current=true;row.style.opacity='';row.style.paddingTop='';row.style.paddingBottom='';row.style.rowGap='';for(const {cell,inner} of cells){cell.style.height='';cell.style.paddingTop='';cell.style.paddingBottom='';inner.style.height='';inner.style.overflow='';}}else safeToRemove?.();});
  return()=>{cancelled=true;for(const control of controls)control.stop();};
 },[present,reduced,tokens.standard,tokens.ease,safeToRemove]);
 return <motion.tr layout="position" transition={{duration:reduced?0:tokens.standard,ease:tokens.ease}} ref={root} data-row-id={id} data-selected={isSelected||undefined} data-exiting={!present||undefined} inert={!present} aria-hidden={!present||undefined}>{children}</motion.tr>;
}
