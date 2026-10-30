'use client';

import {motion} from 'motion/react';
import {useId,useRef,useState,type Ref,type ReactNode} from 'react';
import {Button} from '@/components/base/buttons/button';
import {Collapsible} from '@/components/base/collapsible/collapsible';
import {ScrollArea} from '@/components/base/scroll-area/scroll-area';
import {useElementSize} from '@/hooks/use-element-size';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import {useMediaQuery} from '@/hooks/use-media-query';
import {cx} from '@/utils/cx';

export const analyticColors=['var(--chart-blue)','var(--chart-violet)','var(--chart-teal)','var(--chart-amber)','var(--chart-pink)','var(--chart-lime)'];
export const finiteChartValue=(value:number)=>Number.isFinite(value)?Math.max(-Number.MAX_SAFE_INTEGER,Math.min(Number.MAX_SAFE_INTEGER,value)):0;
export const chartNumber=(value:number)=>finiteChartValue(value).toLocaleString(undefined,{maximumFractionDigits:2});
export type AnalyticRow={id:string;label:string;values:readonly string[];color?:string};
export type AnalyticAppearance='plain'|'bordered';
export type AnalyticProps={title:string;description?:string;appearance?:AnalyticAppearance;className?:string};

export function useChartMotion(){const ref=useRef<HTMLElement>(null),tokens=useMotionTokens(ref),reduced=useMediaQuery('(prefers-reduced-motion: reduce)');return {ref,reduced,transition:{duration:reduced?0:tokens.standard,ease:tokens.ease}};}

export function AnalyticChart({title,description,appearance='bordered',className,children,rows,columns,activeId,onActiveChange,headerActions,motionRef}:{title:string;description?:string;appearance?:AnalyticAppearance;className?:string;children:ReactNode;rows:readonly AnalyticRow[];columns:readonly string[];activeId?:string;onActiveChange?:(id:string)=>void;headerActions?:ReactNode;motionRef?:Ref<HTMLElement>}){
  const titleId=useId(),tableId=useId(),[tableOpen,setTableOpen]=useState(false);
  const descriptionSnapshot=useRef(description);if(description)descriptionSnapshot.current=description;
  return <section ref={motionRef} className={cx('ui-analytic-chart',className)} data-appearance={appearance} aria-labelledby={titleId}>
    <header className="ui-analytic-chart__header"><div><h3 id={titleId}>{title}</h3><Collapsible isOpen={Boolean(description)}><p>{descriptionSnapshot.current}</p></Collapsible></div><div className="ui-analytic-chart__actions">{headerActions}<Button variant="ghost" size="small" aria-expanded={tableOpen} aria-controls={tableId} onClick={()=>setTableOpen(open=>!open)}>{tableOpen?'Hide data':'View data'}</Button></div></header>
    {rows.length?children:<p className="ui-analytic-chart__empty">No chart data yet.</p>}
    {!!rows.length&&<ul className="ui-analytic-chart__legend" aria-label={`${title} values`}>{rows.map((row,index)=><li key={row.id}>{onActiveChange?<button type="button" aria-pressed={activeId===row.id} onClick={()=>onActiveChange(row.id)} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const rtl=getComputedStyle(event.currentTarget).direction==='rtl',forward=event.key==='ArrowDown'||event.key===(rtl?'ArrowLeft':'ArrowRight'),next=event.key==='Home'?0:event.key==='End'?rows.length-1:Math.max(0,Math.min(rows.length-1,index+(forward?1:-1)));event.currentTarget.closest('ul')?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();}}><i style={{background:row.color??analyticColors[index%analyticColors.length]}} aria-hidden/><span>{row.label}</span><strong>{row.values.join(' · ')}</strong></button>:<div><i style={{background:row.color??analyticColors[index%analyticColors.length]}} aria-hidden/><span>{row.label}</span><strong>{row.values.join(' · ')}</strong></div>}</li>)}</ul>}
    <Collapsible isOpen={tableOpen}><div id={tableId} className="ui-analytic-chart__data"><ScrollArea label={`${title} data`} orientation="horizontal"><table><caption className="sr-only">{title} data</caption><thead><tr><th scope="col">Label</th>{columns.map((column,index)=><th scope="col" key={`${column}:${index}`}>{column}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}><th scope="row">{row.label}</th>{row.values.map((value,index)=><td key={index}>{value}</td>)}</tr>)}</tbody></table></ScrollArea></div></Collapsible>
  </section>;
}

/** Measured in CSS pixels; small containers scroll instead of shrinking the type. */
export function AnalyticPlot({label,height=220,minWidth=360,children}:{label:string;height?:number;minWidth?:number;children:(width:number,height:number)=>ReactNode}){
  const {ref,width}=useElementSize<HTMLDivElement>(600,height);
  return <ScrollArea label={label} orientation="horizontal" className="ui-analytic-chart__scroll"><div ref={ref} className="ui-analytic-chart__plot" style={{height,minWidth}}><svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>{children(width,height)}</svg></div></ScrollArea>;
}

/** Static SVG targets bypass the animation renderer when reduced motion changes live. */
export function ChartRect({geometry,fill,rx=0,reduced,transition}:{geometry:{x:number;y:number;width:number;height:number};fill:string;rx?:number;reduced:boolean;transition:import('motion/react').Transition}){return reduced?<rect {...geometry} fill={fill} rx={rx}/>:<motion.rect initial={false} animate={geometry} fill={fill} rx={rx} transition={transition}/>;}
export function ChartLine({geometry,stroke,strokeWidth=2,strokeLinecap,reduced,transition}:{geometry:{x1:number;x2:number;y1:number;y2:number};stroke:string;strokeWidth?:number;strokeLinecap?:'round'|'butt';reduced:boolean;transition:import('motion/react').Transition}){return reduced?<line {...geometry} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap}/>:<motion.line initial={false} animate={geometry} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} transition={transition}/>;}
