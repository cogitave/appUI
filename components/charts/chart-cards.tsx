'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine, RiBuildingLine, RiCalendarLine, RiComputerLine, RiEyeLine, RiFlashlightLine, RiGroupLine, RiSmartphoneLine, RiTabletLine, RiUserAddLine, RiVipCrownLine } from '@remixicon/react';
import { cx } from '@/utils/cx';
import { useElementSize } from '@/hooks/use-element-size';
import { IconButton } from '@/components/base/buttons/icon-button';
import { useMediaQuery } from '@/hooks/use-media-query';

export type ChartPoint = { label: string; value: number; secondary?: number; tertiary?: number };
export type ChartSeries = { label: string; value: number; color?: string; displayValue?: string };
export type ChartCardProps = { title?: string; value?: string; change?: string; points?: ChartPoint[]; series?: ChartSeries[]; className?: string; onPeriodChange?: (period: string) => void };
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const sample: ChartPoint[] = months.map((label,i)=>({label,value:[31,38,49,45,56,55,68,72,69,80,84,91][i],secondary:[21,29,34,38,41,43,47,52,53,56,60,64][i],tertiary:[13,19,22,26,29,31,34,38,39,42,44,49][i]}));
const palette = ['var(--chart-lime)','var(--chart-blue)','var(--chart-violet)','var(--chart-pink)','var(--chart-teal)','var(--chart-amber)'];
function showCategoryLabel(index: number, count: number, spacing: number) {
  const stride = Math.max(1, Math.ceil(32 / Math.max(1, spacing)));
  return index === 0 || index === count - 1 || (index % stride === 0 && count - 1 - index >= stride);
}
function Frame({ title, value, change, valueSuffix, subtitle, headerExtra, children, className, periods = ['This year'], onPeriodChange, compact = false }: { title:string; value?:ReactNode; change?:string; valueSuffix?:string; subtitle?:string; headerExtra?:ReactNode; children:ReactNode; className?:string; periods?:string[]; onPeriodChange?: (period:string)=>void; compact?:boolean }) {
 const [period,setPeriod]=useState(periods[0]);
 const [periodMenuOpen,setPeriodMenuOpen]=useState(false);
 const menuOptions=period==='This year'?['This year','Last year','Last 30 days']:period==='Last 7 days'?['Last 7 days','Last 30 days']:period==='This week'?['This week','Last week']:period==='This quarter'?['This quarter','Last quarter']:period==='H1 2024'?['H1 2024','H2 2024']:[period,'Last period'];
 return <article className={cx('ui-chart-card',className)} data-compact={compact||undefined}><header className="ui-chart-card__header"><div><span className="ui-chart-card__eyebrow">{title}</span>{value && <div className="ui-chart-card__value"><strong>{value}</strong>{valueSuffix&&<small>{valueSuffix}</small>}{change && <em>{change}</em>}</div>}{subtitle && <span className="ui-chart-card__subtitle">{subtitle}</span>}</div>{headerExtra ?? (periods.length>1 ? <div className="ui-chart-card__periods" role="group" aria-label={`${title} period`}>{periods.map(item=><button type="button" key={item} aria-pressed={period===item} onClick={()=>{setPeriod(item);onPeriodChange?.(item);}}>{item}</button>)}</div> : periods.length===1 ? <div className="ui-chart-card__period-wrap"><button type="button" className="ui-chart-card__period" aria-label="Change period" aria-expanded={periodMenuOpen} onClick={()=>setPeriodMenuOpen(open=>!open)}><RiCalendarLine size={16} aria-hidden/><span>{period}</span><RiArrowDownSLine size={16} aria-hidden/></button>{periodMenuOpen&&<div className="ui-chart-card__period-menu" role="group" aria-label="Period options">{menuOptions.map(option=><button type="button" key={option} aria-pressed={period===option} onClick={()=>{setPeriod(option);setPeriodMenuOpen(false);onPeriodChange?.(option)}}>{option}</button>)}</div>}</div> : null)}</header>{children}</article>;
}
function WeekRangeControl({onChange,onOffsetChange}:{onChange?:(range:string)=>void;onOffsetChange?:(offset:number)=>void}) {
 const [offset,setOffset]=useState(0);
 const start=new Date(Date.UTC(2026,5,29+offset*7)),end=new Date(Date.UTC(2026,6,5+offset*7));
 const label=`${start.getUTCDate()} ${start.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'})} - ${end.getUTCDate()} ${end.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'})}`;
 function move(delta:number){const next=offset+delta;setOffset(next);onOffsetChange?.(next);const date=new Date(Date.UTC(2026,5,29+next*7));onChange?.(date.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}))}
 return <div className="ui-chart-week-range" role="group" aria-label="Week"><IconButton icon={RiArrowLeftSLine} size="xs" variant="ghost" aria-label="Previous week" onClick={()=>move(-1)}/><span>{label}</span><IconButton icon={RiArrowRightSLine} size="xs" variant="ghost" aria-label="Next week" onClick={()=>move(1)}/></div>;
}
function Footer({items}:{items:ChartSeries[]}){return <div className="ui-chart-card__footer">{items.map((item,i)=><div key={item.label}><span className="ui-chart-card__footer-label"><i style={{background:item.color??palette[i%palette.length]}} /><span title={item.label}>{item.label}</span></span><strong>{item.displayValue??item.value.toLocaleString()}</strong></div>)}</div>}
function gridLines(){return [0,1,2,3].map(i=><line key={i} x1="33" y1={18+i*43} x2="365" y2={18+i*43} stroke="var(--border-subtle)" strokeDasharray="3 4"/>)}
function linePath(points:ChartPoint[],key:'value'|'secondary'|'tertiary',max:number){return points.map((item,i)=>`${i?'L':'M'} ${35+i*(326/Math.max(1,points.length-1))} ${148-(item[key]??0)/max*125}`).join(' ')}
function ChartAxis({points}:{points:ChartPoint[]}){return <div className="ui-chart-card__axis">{points.map((item,i)=><span key={`${item.label}-${i}`}>{item.label}</span>)}</div>}
function LinePlot({points,variant='line',multiple=false,comparison=false}:{points:ChartPoint[];variant?:'line'|'area';multiple?:boolean;comparison?:boolean}){const id=useId().replaceAll(':','');const max=Math.max(1,...points.flatMap(item=>[item.value,item.secondary??0,item.tertiary??0]))*1.12;const primary=linePath(points,'value',max);const alt=linePath(points,'secondary',max);const third=linePath(points,'tertiary',max);return <div className="ui-chart-card__plot"><svg viewBox="0 0 400 168" role="img" aria-label={`Chart showing ${points.map(p=>`${p.label} ${p.value}`).join(', ')}`} preserveAspectRatio="none"><defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={multiple?'#9556f3':'var(--chart-lime)'} stopOpacity=".25"/><stop offset="1" stopColor="var(--chart-lime)" stopOpacity=".01"/></linearGradient></defs>{gridLines()}{comparison&&<path d={alt} fill="none" stroke="#cbd1da" strokeWidth="2" strokeDasharray="4 4"/>}{variant==='area'&&<path d={`${primary} L 361 148 L 35 148 Z`} fill={`url(#${id}-fill)`}/>}<path d={primary} fill="none" stroke={multiple?'var(--chart-violet)':'#8ed400'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>{multiple&&<><path d={alt} fill="none" stroke="var(--chart-blue)" strokeWidth="2.2"/><path d={third} fill="none" stroke="#9ee500" strokeWidth="2.2"/></>}{points.map((p,i)=><circle key={i} cx={35+i*(326/Math.max(1,points.length-1))} cy={148-p.value/max*125} r="7" fill="transparent"><title>{`${p.label}: ${p.value}`}</title></circle>)}</svg><ChartAxis points={points}/></div>}
function BarPlot({points,color='var(--chart-lime)',secondary=false,tertiary=false,goal=false}:{points:ChartPoint[];color?:string;secondary?:boolean;tertiary?:boolean;goal?:boolean}){const max=Math.max(1,...points.flatMap(p=>[p.value,p.secondary??0,p.tertiary??0]))*1.12;return <div className="ui-chart-card__bar-plot">{points.map((point,i)=><div key={`${point.label}-${i}`} className="ui-chart-card__bar-column" tabIndex={0} aria-label={`${point.label}: ${point.value}`} title={`${point.label}: ${point.value}`}><div className="ui-chart-card__bar-track">{goal&&<span className="ui-chart-card__bar-goal"/>}{secondary&&<i style={{height:`${(point.secondary??0)/max*100}%`,background:tertiary?'#d8dbea':'#b8bdd2'}}/>}{tertiary&&<i style={{height:`${(point.tertiary??0)/max*100}%`,background:'var(--chart-blue)'}}/>}<b style={{height:`${point.value/max*100}%`,background:color}} /></div><small>{point.label}</small></div>)}</div>}
function StackedAreaPlot({points,headline,onHover}:{points:ChartPoint[];headline:number;onHover:(index:number|null)=>void}) {
 const id=useId().replaceAll(':','');
 const {ref,width,height}=useElementSize<HTMLDivElement>(544,196);
 const [hover,setHover]=useState<number|null>(null);
 const count=Math.max(1,points.length);
 const left=44,right=width-12,baseline=height-30,top=4;
 const x=(i:number)=>left+i*(right-left)/Math.max(1,count-1);
 const stacks=[points.map(p=>p.value),points.map(p=>p.value+(p.secondary??0)),points.map(p=>p.value+(p.secondary??0)+(p.tertiary??0))];
 const max=Math.max(1,...stacks[2])*1.14;
 const y=(v:number)=>baseline-v/max*(baseline-top);
 function curve(values:number[]){return values.map((v,i)=>{if(!i)return `M ${x(0)} ${y(v)}`;const dx=(x(i)-x(i-1))/2;return `C ${x(i-1)+dx} ${y(values[i-1])}, ${x(i)-dx} ${y(v)}, ${x(i)} ${y(v)}`}).join(' ')}
 function band(upper:number[],lower:number[]){return `${curve(upper)} ${lower.map((_,i)=>`L ${x(lower.length-1-i)} ${y(lower[lower.length-1-i])}`).join(' ')} Z`}
 const axisMax=Math.ceil(headline/12*1.7/500)*500;
 const ticks=[3,2,1,0];
 const colors=['var(--chart-lime)','var(--chart-blue)','var(--chart-violet)'];
 return <div ref={ref} className="ui-chart-card__plot ui-chart-stacked-area"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Visitors by month: ${points.map(p=>`${p.label} ${p.value}`).join(', ')}`} onMouseMove={event=>{const r=event.currentTarget.getBoundingClientRect();const plotX=event.clientX-r.left;const index=Math.max(0,Math.min(count-1,Math.round((plotX/r.width*width-left)/(right-left)*(count-1))));if(index!==hover){setHover(index);onHover(index)}}} onMouseLeave={()=>{setHover(null);onHover(null)}}>
  <defs>{colors.map((color,i)=><linearGradient key={i} id={`${id}-area-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".45"/><stop offset="100%" stopColor={color} stopOpacity=".04"/></linearGradient>)}</defs>
  {ticks.map(step=><g key={step}><line x1={left} x2={right} y1={baseline-step*(baseline-top)/3} y2={baseline-step*(baseline-top)/3} stroke="var(--border-subtle)" strokeDasharray="4 4"/><text x={left-8} y={baseline-step*(baseline-top)/3+4} textAnchor="end" className="ui-chart-stacked-area__axis">{step===0?'0':step===1?`${(axisMax/3000).toFixed(1)}K`:step===2?`${(axisMax*2/3000).toFixed(0)}K`:`${(axisMax/1000).toFixed(1)}K`}</text></g>)}
  {stacks.map((upper,i)=>{const lower=i===0?points.map(()=>0):stacks[i-1];return <g key={i}><path d={band(upper,lower)} fill={`url(#${id}-area-${i})`} stroke="none"/><path d={curve(upper)} fill="none" stroke={colors[i]} strokeWidth="2"/></g>})}
  {points.map((p,i)=>showCategoryLabel(i,count,(right-left)/Math.max(1,count-1))&&<text key={`${p.label}-${i}`} x={x(i)} y={height-2} textAnchor="middle" className="ui-chart-stacked-area__axis">{p.label}</text>)}
  {hover!==null&&<><line x1={x(hover)} x2={x(hover)} y1={top} y2={baseline} stroke="var(--text-subtle)" strokeDasharray="4 4" opacity=".8"/>{stacks.map((series,i)=><circle key={i} cx={x(hover)} cy={y(series[hover])} r="4" fill={colors[i]} stroke="var(--surface-base)" strokeWidth="2"/>)}</>}
  </svg>{hover!==null&&<div className="ui-chart-stacked-area__tooltip" style={{left:`${Math.max(17,Math.min(83,x(hover)/width*100))}%`}}><strong>{points[hover].label}</strong><span>Organic {points[hover].value}</span><span>Referral {points[hover].secondary??0}</span><span>Paid {points[hover].tertiary??0}</span></div>}</div>;
}
export function AreaChartCard({title='Visitors',value='94,700',change='+8.2%',points=sample,className,onPeriodChange}:ChartCardProps){const [hover,setHover]=useState<number|null>(null);const total=Number(value.replace(/[^\d]/g,''))||0;const current=hover===null?value:Math.round(total*(points[hover].value+(points[hover].secondary??0)+(points[hover].tertiary??0))/Math.max(1,points.reduce((sum,p)=>sum+p.value+(p.secondary??0)+(p.tertiary??0),0))).toLocaleString();return <Frame title={title} value={current} change={hover===null?change:undefined} className={cx('ui-chart-card--area',className)} onPeriodChange={onPeriodChange}><StackedAreaPlot points={points} headline={total} onHover={setHover}/><Footer items={[{label:'Organic',value:50500},{label:'Referral',value:25900},{label:'Paid',value:18300}]}/></Frame>}
function SimpleAreaPlot({points,headline,onHover}:{points:ChartPoint[];headline:number;onHover:(index:number|null)=>void}) {
 const id=useId().replaceAll(':','');
 const [hover,setHover]=useState<number|null>(null);
 const count=Math.max(1,points.length),left=44,right=538,baseline=194,top=12;
 const x=(i:number)=>left+i*(right-left)/Math.max(1,count-1);
 const max=Math.max(1,...points.map(p=>p.value))*1.12;
 const y=(v:number)=>baseline-v/max*(baseline-top);
 const path=points.map((p,i)=>{if(!i)return `M ${x(0)} ${y(p.value)}`;const dx=(x(i)-x(i-1))/2;return `C ${x(i-1)+dx} ${y(points[i-1].value)}, ${x(i)-dx} ${y(p.value)}, ${x(i)} ${y(p.value)}`}).join(' ');
 const axisMax=Math.max(1000,Math.round(headline/3/1000)*1000);
 return <div className="ui-chart-card__plot ui-chart-simple-area"><svg viewBox="0 0 544 220" preserveAspectRatio="none" role="img" aria-label={`${points.map(p=>`${p.label}: ${p.value}`).join(', ')}`} onMouseMove={event=>{const r=event.currentTarget.getBoundingClientRect();const index=Math.max(0,Math.min(count-1,Math.round(((event.clientX-r.left)/r.width*544-44)/494*(count-1))));if(index!==hover){setHover(index);onHover(index)}}} onMouseLeave={()=>{setHover(null);onHover(null)}}>
  <defs><linearGradient id={`${id}-line-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-lime)" stopOpacity=".26"/><stop offset="100%" stopColor="var(--chart-lime)" stopOpacity=".01"/></linearGradient></defs>
  {[3,2,1,0].map(step=><text key={step} x="36" y={baseline-step*(baseline-top)/3+4} textAnchor="end" className="ui-chart-stacked-area__axis">{step===0?'$0':`$${Math.round(axisMax*step/3/1000)}K`}</text>)}
  <path d={`${path} L ${right} ${baseline} L ${left} ${baseline} Z`} fill={`url(#${id}-line-fill)`} stroke="none"/>
  <path d={path} fill="none" stroke="#84c900" strokeWidth="2.4" strokeLinecap="round"/>
  {points.map((p,i)=><text key={`${p.label}-${i}`} x={x(i)} y="218" textAnchor="middle" className="ui-chart-stacked-area__axis">{p.label}</text>)}
  {hover!==null&&<><line x1={x(hover)} x2={x(hover)} y1={top} y2={baseline} stroke="var(--text-subtle)" strokeDasharray="4 4"/><circle cx={x(hover)} cy={y(points[hover].value)} r="5" fill="var(--chart-lime)" stroke="var(--surface-base)" strokeWidth="2"/></>}
  </svg>{hover!==null&&<div className="ui-chart-stacked-area__tooltip" style={{left:`${Math.max(16,Math.min(84,x(hover)/544*100))}%`}}><strong>{points[hover].label}</strong><span>{points[hover].value.toLocaleString()}</span></div>}</div>;
}
export function LineChartCard({title='Revenue',value='$18,240',change='+9.4%',points=sample,className,onPeriodChange}:ChartCardProps){const [hover,setHover]=useState<number|null>(null);const [period,setPeriod]=useState('Weekly');const total=Number(value.replace(/[^\d]/g,''))||0;const periodPoints=points.map((p,i)=>({...p,value:period==='Monthly'?p.value*(.88+Math.sin(i*.7)*.08):period==='Yearly'?p.value*(1.05+Math.cos(i*.55)*.1):p.value}));const display=hover===null?value:`$${Math.round(total*periodPoints[hover].value/Math.max(1,periodPoints.reduce((sum,p)=>sum+p.value,0))).toLocaleString()}`;return <Frame title={title} value={display} change={hover===null?change:undefined} className={cx('ui-chart-card--line',className)} periods={['Weekly','Monthly','Yearly']} onPeriodChange={next=>{setPeriod(next);onPeriodChange?.(next)}}><SimpleAreaPlot points={periodPoints} headline={total} onHover={setHover}/></Frame>}
const revenuePoints=months.map((label,i)=>({label,value:[10,10.2,11.3,10.9,12.1,12.6,14.1,13.2,14.6,15.1,14.8,14.5][i],secondary:[8.3,8.4,9.7,10.1,10.2,10.7,11.3,11.9,12.2,12.4,12.7,12.5][i]}));
function RevenuePlot({points,onHover}:{points:ChartPoint[];onHover:(index:number|null)=>void}){const id=useId().replaceAll(':','');const [hover,setHover]=useState<number|null>(null);const count=Math.max(points.length,1),left=54,right=666,baseline=201,top=16,x=(i:number)=>left+i*(right-left)/Math.max(1,count-1),y=(v:number)=>baseline-v/17.5*(baseline-top);function curve(key:'value'|'secondary'){return points.map((p,i)=>{const v=p[key]??0;if(!i)return `M ${x(i)} ${y(v)}`;const dx=(x(i)-x(i-1))/2;return `C ${x(i-1)+dx} ${y(points[i-1][key]??0)}, ${x(i)-dx} ${y(v)}, ${x(i)} ${y(v)}`}).join(' ')}const line=curve('value');return <div className="ui-chart-revenue-plot"><svg viewBox="0 0 688 230" preserveAspectRatio="none" role="img" aria-label={`Revenue trend from ${points[0]?.label??''} to ${points.at(-1)?.label??''}`} onMouseMove={event=>{const r=event.currentTarget.getBoundingClientRect();const index=Math.max(0,Math.min(count-1,Math.round(((event.clientX-r.left)/r.width*688-left)/(right-left)*(count-1))));if(index!==hover){setHover(index);onHover(index)}}} onMouseLeave={()=>{setHover(null);onHover(null)}}><defs><linearGradient id={`${id}-revenue`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--chart-lime)" stopOpacity=".2"/><stop offset="1" stopColor="var(--chart-lime)" stopOpacity=".015"/></linearGradient></defs>{[0,6,11,16].map(tick=><text key={tick} x="47" y={y(tick)+4} textAnchor="end" className="ui-chart-stacked-area__axis">{tick===0?'$0':`$${tick}k`}</text>)}<path d={`${line} L ${right} ${baseline} L ${left} ${baseline} Z`} fill={`url(#${id}-revenue)`}/><path d={curve('secondary')} fill="none" stroke="#cdd1d2" strokeWidth="2" strokeDasharray="4 5"/><path d={line} fill="none" stroke="#7dcb00" strokeWidth="2.6" strokeLinecap="round"/>{points.map((p,i)=><text key={`${p.label}-${i}`} x={x(i)} y="225" textAnchor="middle" className="ui-chart-stacked-area__axis">{p.label}</text>)}{hover!==null&&<><line x1={x(hover)} x2={x(hover)} y1={top} y2={baseline} stroke="var(--text-subtle)" strokeDasharray="3 4"/><circle cx={x(hover)} cy={y(points[hover].value)} r="4" fill="var(--chart-lime)" stroke="var(--surface-base)" strokeWidth="2"/></>}</svg></div>}
export function RevenueChartCard({title='Revenue',value='$152,314',change='+16%',points=revenuePoints,className}:ChartCardProps){const [hover,setHover]=useState<number|null>(null);const total=Number(value.replace(/[^\d]/g,''))||0;const lastYear=Math.round(total/1.16);const sum=points.reduce((acc,p)=>acc+p.value,0)||1;const headline=hover===null?value:`$${Math.round(total*points[hover].value/sum).toLocaleString()}`;return <Frame title={title} value={headline} change={hover===null?change:undefined} subtitle={hover===null?`$${lastYear.toLocaleString()} last year`:points[hover].label} className={cx('ui-chart-card--revenue',className)} headerExtra={<div className="ui-chart-card__legend"><span><i style={{background:'var(--chart-lime)'}}/>This year</span><span><i style={{background:'#cfd1d1'}}/>Last year</span></div>}><RevenuePlot points={points} onHover={setHover}/></Frame>}
function ComboPlot({points,onHover,axisMax=10500,secondaryUnit='%'}:{points:ChartPoint[];onHover:(index:number|null)=>void;axisMax?:number;secondaryUnit?:'%'|'x'}){
 const reducedMotion=useReducedMotion();
 const {ref,width,height}=useElementSize<HTMLDivElement>(544,196);
 const count=Math.max(points.length,1),left=56,right=width-34,baseline=height-28,top=8,step=(right-left)/count;
 const max=Math.max(1,...points.map(p=>p.value))*1.16;
 const conversionMax=Math.max(1,...points.map(p=>p.secondary??0))*1.3;
 const x=(i:number)=>left+step*(i+.5);
 const line=points.map((p,i)=>{const py=baseline-(p.secondary??0)/conversionMax*(baseline-top);if(!i)return `M ${x(0)} ${py}`;const prev=baseline-(points[i-1].secondary??0)/conversionMax*(baseline-top),dx=step/2;return `C ${x(i-1)+dx} ${prev}, ${x(i)-dx} ${py}, ${x(i)} ${py}`}).join(' ');
 return <div ref={ref} className="ui-chart-combo-plot"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Sessions and conversion from ${points[0]?.label??''} to ${points.at(-1)?.label??''}`}>
 {[3,2,1,0].map(tick=><g key={tick}><text x="45" y={baseline-tick*(baseline-top)/3+4} textAnchor="end" className="ui-chart-stacked-area__axis">{tick===0?'0':`${axisMax*tick/3000}K`}</text><text x={width-2} y={baseline-tick*(baseline-top)/3+4} textAnchor="end" className="ui-chart-stacked-area__axis">{secondaryUnit==='x'?`${(tick*2).toFixed(1)}x`:`${tick*2}%`}</text>{tick===3&&<line x1={left} x2={right} y1={top} y2={top} stroke="var(--border-subtle)" strokeDasharray="4 4"/>}</g>)}
 {points.map((p,i)=>{const h=p.value/max*(baseline-top);return <g key={`${p.label}-${i}`}><motion.rect x={x(i)-Math.min(22,step*.58)/2} width={Math.min(22,step*.58)} rx="9" fill="var(--chart-lime)" initial={reducedMotion?false:{y:baseline,height:0}} animate={{y:baseline-h,height:h}} transition={{duration:reducedMotion?0:.7,delay:reducedMotion?0:i*.035,ease:[.2,.75,.25,1]}}/>{showCategoryLabel(i,count,step)&&<text x={x(i)} y={height-2} textAnchor="middle" className="ui-chart-stacked-area__axis">{p.label}</text>}<rect x={x(i)-step/2} y={top} width={step} height={baseline-top} fill="transparent" onMouseEnter={()=>onHover(i)} onMouseLeave={()=>onHover(null)}><title>{`${p.label}: ${p.value}`}</title></rect></g>})}
 <motion.path d={line} fill="none" stroke="var(--chart-blue)" strokeWidth="2.2" strokeLinecap="round" initial={reducedMotion?false:{pathLength:0}} animate={{pathLength:1}} transition={{duration:reducedMotion?0:.95,ease:[.2,.75,.25,1]}}/>
 {points.map((p,i)=><circle key={`${p.label}-point`} cx={x(i)} cy={baseline-(p.secondary??0)/conversionMax*(baseline-top)} r="3" fill="var(--chart-blue)" stroke="var(--surface-base)" strokeWidth="1.6"/>)}
 </svg></div>
}
export function ComboChartCard({title='Sessions · Conversion 3.7%',value='83,200',change='+9.4%',points=sample,series,className,onPeriodChange,axisMax=10500,secondaryUnit='%'}:ChartCardProps & {axisMax?:number;secondaryUnit?:'%'|'x'}) {
  const [hover,setHover]=useState<number|null>(null);
  const suffix=value.match(/[KMB]$/i)?.[0].toUpperCase();
  const total=(Number(value.replace(/[^\d.]/g,''))||0)*(suffix==='K'?1000:suffix==='M'?1000000:suffix==='B'?1000000000:1);
  const sum=points.reduce((a,p)=>a+p.value,0)||1;
  const headline=hover===null?value:`${value.startsWith('$')?'$':''}${Math.round(total*points[hover].value/sum).toLocaleString()}`;
  const conversion=Number(title.match(/[\d.]+%/)?.[0].replace('%','')??3.7);
  return <Frame title={title} value={headline} change={hover===null?change:undefined} className={cx('ui-chart-card--combo',className)} onPeriodChange={onPeriodChange}><ComboPlot points={points} onHover={setHover} axisMax={axisMax} secondaryUnit={secondaryUnit}/><Footer items={series ?? [{label:'Sessions · total',value:total},{label:'Conversion · average',value:conversion,displayValue:`${conversion}%`,color:'var(--chart-blue)'}]}/></Frame>;
}
const earningsPoints=months.map((label,i)=>({label,value:[30,67,88,64,34,22,36,48,63,43,100,72][i]}));
function EarningsPlot({points}:{points:ChartPoint[]}){const reducedMotion=useReducedMotion();const count=Math.max(points.length,1),max=Math.max(1,...points.map(p=>p.value))*1.11,left=51,right=636,baseline=188,top=20,step=(right-left)/count;return <div className="ui-chart-earnings-plot"><svg viewBox="0 0 640 216" preserveAspectRatio="none" role="img" aria-label={`Earnings by month: ${points.map(p=>`${p.label} ${p.value}`).join(', ')}`}>{[0,1,2,3].map((tick)=><text key={tick} x="42" y={baseline-tick*(baseline-top)/3+4} textAnchor="end" className="ui-chart-stacked-area__axis">{['$0','$3K','$5K','$10K'][tick]}</text>)}{points.map((p,i)=>{const x=left+i*step+step*.18,w=step*.65,h=p.value/max*(baseline-top);return <g key={`${p.label}-${i}`}><rect x={x} y={top} width={w} height={baseline-top} rx="13" fill="var(--surface-muted)"/><motion.rect x={x} width={w} rx="12" fill="var(--chart-lime)" initial={reducedMotion?false:{y:baseline,height:0}} animate={{y:baseline-h,height:h}} transition={{duration:reducedMotion?0:.7,delay:reducedMotion?0:i*.04,ease:[.2,.75,.25,1]}}/><text x={x+w/2} y="212" textAnchor="middle" className="ui-chart-stacked-area__axis">{p.label}</text><rect x={x} y={top} width={w} height={baseline-top} fill="transparent"><title>{`${p.label}: ${p.value}`}</title></rect></g>})}</svg></div>}
export function EarningsChartCard({title='Earned so far',value='$7,462',change='+14.8%',points=earningsPoints,className,onPeriodChange}:ChartCardProps){const [period,setPeriod]=useState('Weekly');const displayed=points.map((p,i)=>({...p,value:period==='Monthly'?p.value*(.76+Math.sin(i*.7)*.2):period==='Yearly'?p.value*(1.04+Math.cos(i*.6)*.14):p.value}));return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--earnings',className)} periods={['Weekly','Monthly','Yearly']} onPeriodChange={next=>{setPeriod(next);onPeriodChange?.(next)}}><EarningsPlot points={displayed}/></Frame>}
function OrdersPlot({points,total,onHover}:{points:ChartPoint[];total:number;onHover:(index:number|null)=>void}) {
 const [hover,setHover]=useState<number|null>(null);
 const reducedMotion=useReducedMotion();
 const max=Math.max(1,...points.map(p=>Math.max(p.value,p.secondary??0)))*1.18;
 const baseline=188, top=28, left=56, plotWidth=618;
 const count=Math.max(1,points.length), cell=plotWidth/count;
 const axisTop=Math.ceil(total/12*1.25/100)*100;
 return <div className="ui-chart-orders-plot"><svg viewBox="0 0 688 220" role="img" aria-label={`Orders by month: ${points.map(p=>`${p.label} ${p.value}`).join(', ')}`} preserveAspectRatio="none">
  {[3,2,1,0].map((step)=><text key={step} x="36" y={baseline-(step/3)*(baseline-top)+4} textAnchor="end" className="ui-chart-orders-plot__axis">{step===0?'0':step===3?`${(axisTop/1000).toFixed(1)}k`:step===1?Math.round(axisTop/3).toLocaleString():`${((axisTop*2/3)/1000).toFixed(1)}k`}</text>)}
  {points.map((point,i)=>{const center=left+cell*(i+.5),prev=Math.max(0,point.secondary??0)/max*(baseline-top),current=point.value/max*(baseline-top),active=hover===i;return <g key={`${point.label}-${i}`}>
    <motion.rect x={center-12} width="10" rx="3" fill="#d0d0d0" initial={reducedMotion?false:{y:baseline,height:0}} animate={{y:baseline-prev,height:prev}} transition={{duration:reducedMotion?0:.7,delay:reducedMotion?0:i*.026,ease:[.2,.75,.25,1]}} />
    <motion.rect x={center+1} width="10" rx="3" fill="#6258ff" initial={reducedMotion?false:{y:baseline,height:0}} animate={{y:baseline-current,height:current}} transition={{duration:reducedMotion?0:.7,delay:reducedMotion?0:i*.026+.06,ease:[.2,.75,.25,1]}} />
    <text x={center} y="214" textAnchor="middle" className="ui-chart-orders-plot__axis">{point.label}</text>
    <rect x={center-cell/2} y="20" width={cell} height="186" fill="transparent" onMouseEnter={()=>{setHover(i);onHover(i)}} onMouseLeave={()=>{setHover(null);onHover(null)}}><title>{`${point.label}: ${point.value}`}</title></rect>
    {active&&<line x1={center} x2={center} y1="22" y2={baseline} stroke="var(--text-subtle)" strokeDasharray="3 4" opacity=".55"/>}
   </g>})}
  </svg></div>;
}
export function OrdersChartCard({title='Orders',value='25,162',change='+20%',points=sample,className}:ChartCardProps){const [hover,setHover]=useState<number|null>(null);const total=Number(value.replace(/[^\d]/g,''))||0;const sum=points.reduce((acc,p)=>acc+p.value,0)||1;const headline=hover===null?value:Math.round(total*points[hover].value/sum).toLocaleString();return <Frame title={title} value={headline} change={hover===null?change:undefined} subtitle={hover===null?`${Math.round(total/1.2).toLocaleString()} last year`:points[hover].label} headerExtra={<div className="ui-chart-card__legend"><span><i style={{background:'#6258ff'}}/>This year</span><span><i style={{background:'#d0d0d0'}}/>Last year</span></div>} className={cx('ui-chart-card--orders',className)}><OrdersPlot points={points} total={total} onHover={setHover}/></Frame>}
const stepDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const stepDayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const stepPoints = stepDays.map((label,i)=>({label,value:[5600,2200,1900,6300,7100,5300,3200][i]}));
function CountUp({value}:{value:number}) {
 const reducedMotion=useMediaQuery('(prefers-reduced-motion: reduce)');
 // Render real data consistently on the server and during hydration. Animate
 // subsequent selections from the current value, rather than inventing zero.
 const count=useMotionValue(value);
 const formatted=useTransform(count,latest=>Math.round(latest).toLocaleString('en-US'));
 useEffect(()=>{const control=animate(count,value,{duration:reducedMotion?0:.35,ease:[.2,.75,.25,1]});return()=>control.stop()},[count,value,reducedMotion]);
 return <motion.span>{formatted}</motion.span>;
}
export function StepsCard({title='Steps',value,points=stepPoints,className,onPeriodChange}:ChartCardProps) {
 const reducedMotion=useMediaQuery('(prefers-reduced-motion: reduce)');
 const [active,setActive]=useState<number|null>(null);
 const [weekOffset,setWeekOffset]=useState(0);
 const demoWeeks = [[5600,2200,1900,6300,7100,5300,3200],[3200,6400,2300,3800,5200,3900,5400]];
 const currentPoints=points===stepPoints ? stepDays.map((label,index)=>({label,value:demoWeeks[((weekOffset%2)+2)%2][index]})) : points;
 const max=points===stepPoints?8000:Math.max(1,...currentPoints.map(point=>point.value))*1.12;
 const total=value===undefined?currentPoints.reduce((sum,point)=>sum+point.value,0):Number(value.replace(/[^\d.]/g,''));
 const point=active===null?null:currentPoints[active];
 const day=point?(stepDayNames[stepDays.indexOf(point.label)]??point.label):title;
 return <Frame title={day} value={<CountUp value={point?.value??total}/>} valueSuffix={point?'steps':'total steps'} className={cx('ui-chart-card--steps',className)} headerExtra={<WeekRangeControl onChange={onPeriodChange} onOffsetChange={offset=>{setWeekOffset(offset);setActive(null)}}/>} compact>
  <div className="ui-steps-plot" onMouseLeave={()=>setActive(null)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setActive(null)}}>
   {currentPoints.map((point,index)=><button key={point.label} type="button" className="ui-steps-day" data-active={active===index||undefined} aria-label={`${stepDayNames[stepDays.indexOf(point.label)]??point.label}: ${point.value.toLocaleString('en-US')} steps`} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?currentPoints.length-1:(index+(event.key==='ArrowRight'?1:-1)+currentPoints.length)%currentPoints.length;event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()}}><span className="ui-steps-day__track"><motion.span key={weekOffset} className="ui-steps-day__fill" initial={reducedMotion?false:{height:0}} animate={{height:`${point.value/max*100}%`}} transition={{duration:reducedMotion?0:.65,ease:[.2,.75,.25,1]}}/></span><span className="ui-steps-day__label">{point.label}</span></button>)}
  </div>
 </Frame>;
}
export type BarListBreakdowns = Record<string, ChartSeries[]>;
const defaultBreakdowns:BarListBreakdowns={Devices:[{label:'Desktop',value:61},{label:'Mobile',value:31},{label:'Tablet',value:8}],Browsers:[{label:'Chrome',value:59},{label:'Safari',value:27},{label:'Firefox',value:14}],'Operating systems':[{label:'Windows',value:48},{label:'macOS',value:35},{label:'Linux',value:17}]};
export function BarListCard({title='Devices',series,breakdowns=defaultBreakdowns,className}:{title?:string;series?:ChartSeries[];breakdowns?:BarListBreakdowns;className?:string}){
 const tabs=Object.keys(breakdowns);
 const [tab,setTab]=useState(tabs.includes(title)?title:tabs[0]??'Devices');
 const items=series??breakdowns[tab]??[];
 const max=Math.max(1,...items.map(item=>item.value));
 return <article className={cx('ui-chart-card ui-chart-card--barlist',className)}><div className="ui-chart-barlist__tabs" role="tablist" aria-label="Visitor breakdown">{tabs.map(item=><button type="button" role="tab" aria-selected={tab===item} key={item} onClick={()=>setTab(item)}>{item}</button>)}<span>VISITORS</span></div><div className="ui-chart-barlist" role="tabpanel" aria-label={`${tab} breakdown`}>{items.map((item,i)=>{const Icon=tab==='Devices'?[RiComputerLine,RiSmartphoneLine,RiTabletLine][i]:null;return <div key={item.label} className="ui-chart-barlist__row" tabIndex={0} aria-label={`${item.label}: ${item.value}%`}><b style={{width:`${item.value/max*100}%`}}/><span>{Icon&&<Icon size={15} aria-hidden/>}{item.label}</span><strong>{item.value}%</strong></div>})}</div></article>
}
export type RingMetric = { label:string; value:string; progress:number; color:string };
const defaultRings:RingMetric[]=[{label:'Move',value:'1,592 kcal',progress:.83,color:'var(--chart-pink)'},{label:'Exercise',value:'1h 45m',progress:.76,color:'var(--chart-lime)'},{label:'Running',value:'5.2 km',progress:.69,color:'var(--chart-blue)'}];
function AnimatedRingArc({radius,color,dash}:{radius:number;color:string;dash:string}){
 const reducedMotion=useMediaQuery('(prefers-reduced-motion: reduce)');
 return <motion.circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" initial={false} animate={{strokeDasharray:dash}} transition={{duration:reducedMotion?0:.35,ease:'easeOut'}}/>;
}
function Rings({rings,small=false,activeRing,onActiveRingChange}:{rings:RingMetric[];small?:boolean;activeRing?:number|null;onActiveRingChange?:(index:number|null)=>void}){
 const center=small?14:100;
 return <svg className={cx('ui-chart-rings',small&&'ui-chart-rings--small')} viewBox={small?'0 0 28 28':'0 0 200 200'} role="img" aria-label={rings.map(r=>`${r.label}: ${r.value}`).join(', ')}>{rings.map((ring,i)=>{
  const radius=small?12-i*3.6:82-i*(rings.length>3?15:24),circumference=2*Math.PI*radius;
  const progress=Number.isFinite(ring.progress)?Math.max(0,Math.min(1,ring.progress)):0;
  const dash=`${(progress*circumference).toFixed(2)} ${(circumference*(1-progress)).toFixed(2)}`;
  return <g key={ring.label} className="ui-chart-ring" data-dimmed={activeRing!==null&&activeRing!==undefined&&activeRing!==i||undefined} transform={`rotate(-90 ${center} ${center})`} onMouseEnter={()=>onActiveRingChange?.(i)} onMouseLeave={()=>onActiveRingChange?.(null)}>
   <circle cx={center} cy={center} r={radius} fill="none" stroke={ring.color} opacity=".16" strokeWidth={small?2.2:18}/>
   {small?<circle cx={center} cy={center} r={radius} fill="none" stroke={ring.color} strokeWidth="2.2" strokeLinecap="round" strokeDasharray={dash}/>:<AnimatedRingArc radius={radius} color={ring.color} dash={dash}/>}
  </g>;
 })}</svg>;
}
export function ActivityRingsCard({title='Activity',className,rings=defaultRings}:{title?:string;className?:string;rings?:RingMetric[]}){const [activeRing,setActiveRing]=useState<number|null>(null);return <Frame title={title} className={cx('ui-chart-card--activity-rings',className)} periods={[]} compact><div className="ui-chart-ring-legend">{rings.map((r,i)=><div key={r.label} data-dimmed={activeRing!==null&&activeRing!==i||undefined} onMouseEnter={()=>setActiveRing(i)} onMouseLeave={()=>setActiveRing(null)}><span><i style={{background:r.color}}/>{r.label}</span><strong>{r.value}</strong></div>)}</div><div className="ui-chart-rings-plot"><Rings rings={rings} activeRing={activeRing} onActiveRingChange={setActiveRing}/></div></Frame>}
export function RadialChartCard({title='Visitors',value='925',change='+5.2%',className,series=[{label:'Other',value:90},{label:'Edge',value:173},{label:'Firefox',value:187},{label:'Safari',value:200},{label:'Chrome',value:275}]}:ChartCardProps){const colors=['var(--chart-lime)','var(--chart-blue)','var(--chart-violet)','var(--chart-pink)','#ffc400'];const reducedMotion=useReducedMotion();const max=Math.max(1,...series.map(item=>item.value))*1.18;const ordered=[...series].reverse();return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--radial',className)} periods={['Last 7 days']}><svg className="ui-chart-radial-rings" viewBox="0 0 220 220" role="img" aria-label={series.map(item=>`${item.label}: ${item.value}`).join(', ')}>{ordered.map((item,i)=>{const radius=100-i*12,circumference=2*Math.PI*radius,progress=Math.min(1,item.value/max);return <g key={item.label} transform="rotate(-90 110 110)"><circle cx="110" cy="110" r={radius} fill="none" stroke="#e7e7e7" strokeWidth="7"/><motion.circle cx="110" cy="110" r={radius} fill="none" stroke={colors[series.length-1-i]??colors[i%colors.length]} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circumference*progress} ${circumference}`} initial={reducedMotion?false:{strokeDashoffset:circumference*progress}} animate={{strokeDashoffset:0}} transition={{duration:reducedMotion?0:1.05,delay:reducedMotion?0:i*.08,ease:[.2,.75,.25,1]}}><title>{`${item.label}: ${item.value}`}</title></motion.circle></g>})}</svg><Footer items={series.map((item,i)=>({...item,color:colors[i%colors.length]}))}/></Frame>}
export function SleepScoreCard({score=98,title='Sleep score',className,details=[{label:'Duration: 7h 50m',value:49,color:'#ab62fa'},{label:'Bedtime: 20m earlier',value:29,color:'#ff4ba0'},{label:'Interruptions: 5m wake up',value:20,color:'#298dff'}]}:{score?:number;title?:string;className?:string;details?:ChartSeries[]}){return <Frame title={title} value={score>=85?'Excellent':score>=70?'Good':'Needs attention'} className={cx('ui-chart-card--sleep',className)} headerExtra={<WeekRangeControl/>} compact><div className="ui-chart-sleep"><svg viewBox="0 0 120 120" role="img" aria-label={`Sleep score ${score}`}><circle cx="60" cy="60" r="43" fill="none" stroke="#e9e9e9" strokeWidth="16"/><circle cx="60" cy="60" r="43" fill="none" stroke="#efefef" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${Math.min(score,100)/100*270} 270`} transform="rotate(-90 60 60)"/><text x="60" y="69" textAnchor="middle">{score}</text></svg></div><div className="ui-chart-sleep__details">{details.map((item,i)=><div key={item.label}><span><i style={{background:item.color}}/>{item.label}</span><strong>{item.value}/{[50,30,20][i]??50}</strong></div>)}</div></Frame>}
export type HeatCell = { value:number; label?:string };
const heatCells = Array.from({length:84},(_,i)=>({value:Math.round((Math.sin(i*.73)+1)*2.5),label:`Day ${i+1}`}));
const contributionCells = Array.from({length:364},(_,i)=>({value:Math.max(0,Math.min(5,Math.round((Math.sin(i*1.71)+Math.cos(i*.43)+2)*1.25))),label:`Day ${i+1}`}));
export function ContributionsCard({title='Contributions this year',value='958',change='+14.8%',cells=contributionCells,className}:{title?:string;value?:string;change?:string;cells?:HeatCell[];className?:string}){const [period,setPeriod]=useState('Weekly');return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--contributions',className)} periods={[]}><div className="ui-chart-summary"><span>9B <small>Lifetime tokens</small></span><span>562.7M <small>Peak tokens</small></span><span>12h 54m <small>Longest task</small></span><span>62 days <small>Top streak</small></span></div><div className="ui-chart-contributions__activity"><span>Activity</span><div role="group" aria-label="Activity period">{['Weekly','Monthly','Yearly'].map(item=><button type="button" key={item} aria-pressed={period===item} onClick={()=>setPeriod(item)}>{item}</button>)}</div></div><HeatGrid cells={cells} color="violet"/><div className="ui-chart-contributions__months">{months.map(item=><span key={item}>{item}</span>)}</div></Frame>}
function HeatGrid({cells,color='blue'}:{cells:HeatCell[];color?:'blue'|'violet'}){return <div className="ui-chart-heatgrid" data-color={color} style={{gridTemplateColumns:`repeat(${Math.max(1,Math.ceil(cells.length/7))},minmax(0,1fr))`}} role="img" aria-label={`Activity heatmap with ${cells.length} cells`}>{cells.map((cell,i)=><span key={i} data-level={Math.max(0,Math.min(5,cell.value))} title={`${cell.label??`Cell ${i+1}`}: ${cell.value}`} tabIndex={0}/>)}</div>}
const hourlyHeatCells=Array.from({length:84},(_,i)=>{const hour=Math.floor(i/7),day=i%7;return {value:Math.max(1,Math.min(5,Math.round(1.2+3.7*Math.exp(-Math.pow((hour-6)/3.7,2))+(day%3)*.2))),label:`${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][day]} ${String(hour*2).padStart(2,'0')}:00`}});
export function HeatmapChartCard({title='Active users',value='1,892',change='+5.2%',cells=hourlyHeatCells,className}:{title?:string;value?:string;change?:string;cells?:HeatCell[];className?:string}){return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--heatmap',className)} periods={['Last 7 days']}><div className="ui-chart-heatmap-layout"><div className="ui-chart-heatmap-days">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span key={day}>{day}</span>)}</div><HeatGrid cells={cells}/></div><div className="ui-chart-heatmap-hours">{Array.from({length:Math.ceil(cells.length/7)},(_,i)=><span key={i}>{String((i*2)%24).padStart(2,'0')}</span>)}</div><div className="ui-chart-heatlegend">Less <span/> <span/> <span/> <span/> <span/> More</div></Frame>}
export type DayActivity = { day:number; levels:number[]; date?:string };
export type ActiveDaySelection = { date:string; day:number; levels:number[] };
export type MostActiveDaysCardProps = {
 title?:string; value?:string; className?:string; activity?:DayActivity[];
 year?:number; initialMonth?:number; selectedDate?:string; defaultSelectedDate?:string;
 onDaySelect?:(day:ActiveDaySelection)=>void;
};
export const defaultDayActivity:DayActivity[]=Array.from({length:31},(_,i)=>({day:i+1,levels:[.48+Math.sin(i)*.24,.55+Math.cos(i*.7)*.24,.4+Math.sin(i*.37)*.26]}));
const dayRingLabels=['Move','Exercise','Running'];
const dayRingColors=['var(--chart-pink)','var(--chart-lime)','var(--chart-blue)'];
function activityDate(year:number,month:number,day:number){return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}

export function MostActiveDaysCard({title='Most active days',value='32,459',className,activity=defaultDayActivity,year=2026,initialMonth=6,selectedDate,defaultSelectedDate,onDaySelect}:MostActiveDaysCardProps){
 const startMonth=Math.max(0,Math.min(11,initialMonth));
 const [internalDate,setInternalDate]=useState(defaultSelectedDate);
 const selected=selectedDate??internalDate;
 const [activeMonth,setActiveMonth]=useState(startMonth);
 const [focusDate,setFocusDate]=useState(selected??activityDate(year,startMonth,1));
 const scrollRef=useRef<HTMLDivElement>(null);
 const monthRefs=useRef<(HTMLElement|null)[]>([]);
 const activeMonthRef=useRef(startMonth);
 const targetMonthRef=useRef<number|null>(null);
 const reducedMotion=useMediaQuery('(prefers-reduced-motion: reduce)');
 const monthNames=Array.from({length:12},(_,month)=>new Date(Date.UTC(year,month,1)).toLocaleDateString('en-US',{month:'long',timeZone:'UTC'}));
 const syncMonth=useCallback(()=>{
  const area=scrollRef.current;if(!area)return;
  let visibleMonth=0;
  monthRefs.current.forEach((month,index)=>{if(month&&month.offsetTop<=area.scrollTop+20)visibleMonth=index;});
  if(activeMonthRef.current!==visibleMonth){
   activeMonthRef.current=visibleMonth;setActiveMonth(visibleMonth);
   if(!area.contains(document.activeElement))setFocusDate(activityDate(year,visibleMonth,1));
  }
  const target=targetMonthRef.current;
  const section=target===null?null:monthRefs.current[target];
  // Keep rapid requests relative to their destination until scrolling reaches it.
  // A timeout can expire between a click and the browser's first scroll frame.
  if(section&&Math.abs(area.scrollTop-Math.max(0,section.offsetTop-10))<2)targetMonthRef.current=null;
 },[year]);
 const moveToMonth=useCallback((month:number,smooth=true)=>{
  const area=scrollRef.current;const section=monthRefs.current[month];if(!area||!section)return;
  targetMonthRef.current=month;
  area.scrollTo({top:Math.max(0,section.offsetTop-10),behavior:smooth&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});
 },[]);
 useLayoutEffect(()=>{
  const frame=requestAnimationFrame(()=>{moveToMonth(startMonth,false);syncMonth();});
  return()=>cancelAnimationFrame(frame);
 },[year,startMonth,moveToMonth,syncMonth]);
 useEffect(()=>{if(reducedMotion&&scrollRef.current&&targetMonthRef.current!==null)moveToMonth(targetMonthRef.current,false);},[reducedMotion,moveToMonth]);
 function move(delta:number){moveToMonth(Math.max(0,Math.min(11,(targetMonthRef.current??activeMonthRef.current)+delta)));}
 function interruptScroll(){const area=scrollRef.current;if(targetMonthRef.current!==null&&area){area.scrollTo({top:area.scrollTop,behavior:'auto'});targetMonthRef.current=null;}}
 function focusDay(event:KeyboardEvent<HTMLButtonElement>,index:number,localIndex:number,monthLength:number){
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  event.preventDefault();interruptScroll();
  const buttons=Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>('.ui-chart-days__day')??[]);
  const shift={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];
  const next=event.key==='Home'?index-localIndex%7:event.key==='End'?index+Math.min(6-localIndex%7,monthLength-1-localIndex):index+(shift??0);
  const button=buttons[Math.max(0,Math.min(buttons.length-1,next))];if(!button)return;
  button.focus({preventScroll:true});
  const area=scrollRef.current!,a=area.getBoundingClientRect(),b=button.getBoundingClientRect();
  const delta=b.top<a.top?b.top-a.top:b.bottom>a.bottom?b.bottom-a.bottom:0;
  if(delta)area.scrollBy({top:delta,behavior:reducedMotion?'auto':'smooth'});
 }
 let dayIndex=0;
 return <Frame title={title} value={value} valueSuffix="total steps" className={cx('ui-chart-card--days',className)} headerExtra={<div className="ui-chart-week-range ui-chart-month-range" role="group" aria-label="Month">
  <IconButton icon={RiArrowLeftSLine} size="xs" variant="ghost" aria-label="Previous month" disabled={activeMonth===0} onClick={()=>move(-1)}/>
  <span className="ui-chart-month-label" aria-live="polite" aria-atomic="true"><span className="sr-only">{monthNames[activeMonth]}</span><AnimatePresence initial={false}><motion.span key={activeMonth} aria-hidden="true" className="ui-chart-month-label__value" initial={reducedMotion?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reducedMotion?0:-10}} transition={{duration:reducedMotion?0:.22,ease:'easeOut'}}>{monthNames[activeMonth]}</motion.span></AnimatePresence></span>
  <IconButton icon={RiArrowRightSLine} size="xs" variant="ghost" aria-label="Next month" disabled={activeMonth===11} onClick={()=>move(1)}/>
 </div>} compact>
  <div className="ui-chart-days-viewport"><div ref={scrollRef} className="ui-chart-days" aria-label={`${year} daily activity`} onScroll={syncMonth} onWheel={interruptScroll} onTouchStart={interruptScroll} onPointerDown={interruptScroll}>
   <div className="ui-chart-days__months">{monthNames.map((monthName,month)=>{
    const count=new Date(Date.UTC(year,month+1,0)).getUTCDate();
    return <section key={month} ref={node=>{monthRefs.current[month]=node;}} data-month={month} className="ui-chart-days__month" aria-label={`${monthName} ${year}`}>
     <h3>{months[month]}</h3><div className="ui-chart-days__grid">{Array.from({length:count},(_,index)=>{
      const day=index+1,date=activityDate(year,month,day),position=dayIndex++;
      const item=activity.find(item=>item.date===date)??activity.find(item=>!item.date&&item.day===day);
      const levels=dayRingLabels.map((_,i)=>{const value=item?.levels[i]??0;return Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;});
      return <button key={date} type="button" data-date={date} className="ui-chart-days__day" aria-label={`Activity for ${monthName} ${day}, ${year}`} aria-pressed={selected===date} tabIndex={focusDate===date?0:-1} onFocus={()=>setFocusDate(date)} onKeyDown={event=>focusDay(event,position,index,count)} onClick={()=>{if(selectedDate===undefined)setInternalDate(date);onDaySelect?.({date,day,levels});}}>
       <strong>{day}</strong><Rings small rings={levels.map((progress,i)=>({label:dayRingLabels[i],value:`${Math.round(progress*100)}%`,progress,color:dayRingColors[i]}))}/>
      </button>;
     })}</div>
    </section>;
   })}</div>
  </div></div>
 </Frame>;
}
function FunnelPlot({ series }: { series: ChartSeries[] }) {
  const { ref, width, height } = useElementSize<HTMLDivElement>(640, 160);
  const max = Math.max(...series.map(item => item.value), 1);
  const count = Math.max(series.length, 1);
  const gap = 3;
  const segmentWidth = (width - gap * (count - 1)) / count;
  const middle = height / 2;
  const fullHeight = (value: number) => 24 + Math.max(0, height - 24) * value / max;
  function shape(index: number, inset: number) {
    const start = index * (segmentWidth + gap), end = start + segmentWidth;
    const current = Math.max(2, fullHeight(series[index].value) / 2 - inset);
    const next = Math.max(2, fullHeight(series[Math.min(index + 1, count - 1)].value) / 2 - inset);
    const shoulder = start + segmentWidth * .42, control = start + segmentWidth * .71;
    return `M ${start} ${middle-current} L ${shoulder} ${middle-current} C ${control} ${middle-current}, ${control} ${middle-next}, ${end} ${middle-next} L ${end} ${middle+next} C ${control} ${middle+next}, ${control} ${middle+current}, ${shoulder} ${middle+current} L ${start} ${middle+current} Z`;
  }
  return <div ref={ref} className="ui-chart-funnel" role="img" aria-label={series.map(item => `${item.label}: ${item.value}`).join(', ')}>
    <svg viewBox={`0 0 ${width} ${height}`}>
      {[{inset:0,opacity:.1},{inset:6,opacity:.22},{inset:12,opacity:1}].map(layer => <g key={layer.inset}>{series.map((item,index) => <path key={item.label} d={shape(index,layer.inset)} fill={item.color ?? palette[index % palette.length]} fillOpacity={layer.opacity}/>)}</g>)}
      {series.map((item,index) => {
        const label = `${Math.round(item.value/max*100)}%`;
        const x = index * (segmentWidth + gap) + segmentWidth / 2;
        const labelWidth = label.length * 7.2 + 16;
        return <g key={item.label}><rect x={x-labelWidth/2} y={middle-10} width={labelWidth} height={20} rx={10} fill="var(--surface-raised)"/><text x={x} y={middle+4} textAnchor="middle" className="ui-chart-funnel__percentage">{label}</text></g>;
      })}
    </svg>
  </div>;
}
export function FunnelChartCard({title='Sign-up funnel',value='197',change='+5.2%',series=[{label:'Link opened',value:197,color:'var(--chart-lime)'},{label:'Started',value:110,color:'var(--chart-blue)'},{label:'Completed',value:77,color:'var(--chart-violet)'},{label:'Converted',value:38,color:'var(--chart-pink)'}],className,period='Last 7 days'}:ChartCardProps & { period?: string }) {
  return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--funnel',className)} periods={[period]}><FunnelPlot series={series}/><Footer items={series}/></Frame>;
}
const radarPoints=['January','February','March','April','May','June'].map((label,i)=>({label,value:[186,305,237,273,209,214][i]}));
export function RadarChartCard({title='Visitors',value='1,424',change='+5.2%',points=radarPoints,className}:ChartCardProps){const count=points.length||1,max=Math.max(1,...points.map(p=>p.value))*1.13,centerX=180,centerY=112;const xy=(i:number,r:number)=>{const a=-Math.PI/2+i*2*Math.PI/count;return `${centerX+Math.cos(a)*r},${centerY+Math.sin(a)*r}`};const polygon=(r:number)=>Array.from({length:count},(_,i)=>xy(i,r)).join(' ');const measured=points.map((point,i)=>xy(i,86*point.value/max)).join(' ');return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--radar',className)} periods={['H1 2024']}><svg className="ui-chart-radar" viewBox="0 0 360 224" role="img" aria-label={points.map(p=>`${p.label}: ${p.value}`).join(', ')}>{[28,56,84].map(radius=><polygon key={radius} points={polygon(radius)} fill="none" stroke="#d5d5d5" strokeWidth="1"/>)}{Array.from({length:count},(_,i)=><line key={i} x1={centerX} y1={centerY} x2={Number(xy(i,84).split(',')[0])} y2={Number(xy(i,84).split(',')[1])} stroke="#d5d5d5"/>)}<polygon points={measured} fill="rgb(162 237 0 / .32)" stroke="#83c900" strokeWidth="2"/>{points.map((point,i)=>{const [x,y]=xy(i,108).split(',').map(Number);return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{point.label}</text>})}</svg><Footer items={points.map(p=>({label:p.label,value:p.value,color:'transparent'}))}/></Frame>}
const scatterPoints=[{label:'12',value:185},{label:'18',value:250},{label:'24',value:210},{label:'31',value:320},{label:'38',value:290},{label:'45',value:385},{label:'42',value:620},{label:'55',value:740},{label:'61',value:690},{label:'68',value:890},{label:'74',value:820},{label:'83',value:980},{label:'78',value:1260},{label:'86',value:1450},{label:'92',value:1340},{label:'97',value:1610}];
export function ScatterChartCard({title='Revenue per account',value='742',change='+6.8%',points=scatterPoints,className}:ChartCardProps){const reducedMotion=useReducedMotion();const max=Math.max(1700,...points.map(p=>p.value))*1.04;return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--scatter',className)} periods={['This quarter']}><div className="ui-chart-scatter-plot"><svg viewBox="0 0 544 227" preserveAspectRatio="none" role="img" aria-label={`Scatter plot of ${points.length} data points`}>{[0,550,1100,1700].map(tick=>{const y=187-tick/max*170;return <g key={tick}><line x1="52" x2="522" y1={y} y2={y} stroke="var(--border-subtle)" strokeDasharray="3 5"/><text x="43" y={y+4} textAnchor="end" className="ui-chart-stacked-area__axis">{tick===0?'0':tick===1100?'1.1K':tick===1700?'1.7K':tick}</text></g>})}{[0,25,50,75,100].map(tick=>{const x=52+tick/100*470;return <g key={tick}><line x1={x} x2={x} y1="17" y2="187" stroke="var(--border-subtle)" strokeDasharray="3 5"/><text x={x} y="220" textAnchor="middle" className="ui-chart-stacked-area__axis">{tick}</text></g>})}{points.map((point,i)=>{const numeric=Number(point.label),session=Number.isFinite(numeric)?numeric:(i+1)/points.length*100,x=52+session/100*470,y=187-point.value/max*170,color=point.value>=1100?'#b861ff':point.value>=550?'var(--chart-blue)':'var(--chart-lime)';return <motion.circle key={`${point.label}-${i}`} cx={x} cy={y} r={point.value>=1100?10:point.value>=550?8:6.5} fill={color} fillOpacity=".75" stroke={color} strokeWidth="1.5" initial={reducedMotion?false:{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:reducedMotion?0:.45,delay:reducedMotion?0:i*.035,ease:[.2,.75,.25,1]}}><title>{`Sessions ${Math.round(session)}, revenue ${point.value}`}</title></motion.circle>})}</svg></div><div className="ui-chart-scatter-labels"><span>Revenue</span><span>Sessions</span></div><Footer items={[{label:'Starter · avg',value:270},{label:'Growth · avg',value:783,color:'var(--chart-blue)'},{label:'Scale · avg',value:1388,color:'#b85dff'}]}/></Frame>}
export type FlowLink={from:string;to:string;value:number;color?:string};
const defaultFlowLinks:FlowLink[]=[
 {from:'Focus',to:'Browsing',value:15},{from:'Focus',to:'Writing',value:8},{from:'Focus',to:'Messaging',value:4},{from:'Focus',to:'Productivity',value:3},{from:'Focus',to:'Email',value:2},
 {from:'Meetings',to:'Video calls',value:12},{from:'Meetings',to:'Messaging',value:4},{from:'Meetings',to:'Productivity',value:2},
 {from:'Breaks',to:'Browsing',value:4},{from:'Breaks',to:'Everything else',value:4},{from:'Breaks',to:'Video calls',value:2},{from:'Breaks',to:'Productivity',value:2},
 {from:'Admin',to:'Email',value:5},{from:'Admin',to:'Writing',value:3},{from:'Admin',to:'Productivity',value:3},{from:'Admin',to:'Everything else',value:3},
 {from:'Learning',to:'Writing',value:4},{from:'Learning',to:'Browsing',value:2},{from:'Learning',to:'Messaging',value:2},{from:'Learning',to:'Everything else',value:2},
];
export function SankeyChartCard({title='Tracked time',value='86h',change,links=defaultFlowLinks,className,unit='h',period='This week',startLabel='Tracked time',endLabel='Share of tracked time'}:{title?:string;value?:string;change?:string;links?:FlowLink[];className?:string;unit?:string;period?:string;startLabel?:string;endLabel?:string}){
 const from=[...new Set(links.map(l=>l.from))],to=[...new Set(links.map(l=>l.to))];
 const fromTotal=new Map(from.map(name=>[name,links.filter(link=>link.from===name).reduce((sum,link)=>sum+link.value,0)]));
 const toTotal=new Map(to.map(name=>[name,links.filter(link=>link.to===name).reduce((sum,link)=>sum+link.value,0)]));
 const total=links.reduce((sum,link)=>sum+link.value,0)||1;
 const scale=Math.min(12,235/total);
 const topFor=(names:string[],totals:Map<string,number>,gap:number)=>{const result=new Map<string,number>();let y=15;for(const name of names){result.set(name,y);y+=(totals.get(name)??0)*scale+gap}return result};
 const sourceTop=topFor(from,fromTotal,10),targetTop=topFor(to,toTotal,7);
 const sourceOffset=new Map(from.map(name=>[name,0])),targetOffset=new Map(to.map(name=>[name,0]));
 const colors=['#02c89b','#bd61f8','#ffc400','#3790fa','#f75aa7'];
 const flows=links.map((link,i)=>{const thickness=link.value*scale,y1=(sourceTop.get(link.from)??0)+(sourceOffset.get(link.from)??0)+thickness/2,y2=(targetTop.get(link.to)??0)+(targetOffset.get(link.to)??0)+thickness/2;sourceOffset.set(link.from,(sourceOffset.get(link.from)??0)+thickness);targetOffset.set(link.to,(targetOffset.get(link.to)??0)+thickness);return {...link,id:i,y1,y2,thickness,color:link.color??colors[from.indexOf(link.from)%colors.length]}});
 const mobileFactor=1.9;
 return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--sankey',className)} periods={[period]}>
  <svg className="ui-chart-sankey" viewBox="0 0 640 310" preserveAspectRatio="xMidYMid meet" role="img" aria-label={links.map(l=>`${l.from} to ${l.to}: ${l.value}`).join(', ')}>{flows.map(flow=><path key={flow.id} d={`M 106 ${flow.y1} C 268 ${flow.y1}, 342 ${flow.y2}, 483 ${flow.y2}`} fill="none" stroke={flow.color} strokeWidth={flow.thickness} strokeOpacity=".4"><title>{`${flow.from} → ${flow.to}: ${flow.value}${unit}`}</title></path>)}{from.map((name,i)=>{const y=sourceTop.get(name)??0,h=(fromTotal.get(name)??0)*scale;return <g key={name}><rect x="101" y={y} width="11" height={h} rx="4" fill={colors[i%colors.length]}/><text x="94" y={y+h/2-2} textAnchor="end" className="ui-chart-sankey__name">{name}</text><text x="94" y={y+h/2+14} textAnchor="end" className="ui-chart-sankey__metric">{Math.round((fromTotal.get(name)??0)*100)/100}{unit}</text></g>})}{to.map(name=>{const y=targetTop.get(name)??0,h=(toTotal.get(name)??0)*scale;return <g key={name}><rect x="482" y={y} width="11" height={h} rx="4" fill="#a7a7a7"/><text x="501" y={y+h/2+3} className="ui-chart-sankey__name">{name}<tspan className="ui-chart-sankey__metric"> · {Math.round((toTotal.get(name)??0)/total*100)}%</tspan></text></g>})}</svg>
  <svg className="ui-chart-sankey ui-chart-sankey--mobile" viewBox="0 0 310 590" role="img" aria-label={links.map(l=>`${l.from} to ${l.to}: ${l.value}`).join(', ')}>{flows.map(flow=><path key={flow.id} d={`M 91 ${flow.y1*mobileFactor} C 132 ${flow.y1*mobileFactor}, 151 ${flow.y2*mobileFactor}, 181 ${flow.y2*mobileFactor}`} fill="none" stroke={flow.color} strokeWidth={flow.thickness*mobileFactor} strokeOpacity=".4"><title>{`${flow.from} → ${flow.to}: ${flow.value}${unit}`}</title></path>)}{from.map((name,i)=>{const y=(sourceTop.get(name)??0)*mobileFactor,h=(fromTotal.get(name)??0)*scale*mobileFactor;return <g key={name}><rect x="86" y={y} width="10" height={h} rx="4" fill={colors[i%colors.length]}/><text x="79" y={y+h/2-2} textAnchor="end" className="ui-chart-sankey__name">{name}</text><text x="79" y={y+h/2+14} textAnchor="end" className="ui-chart-sankey__metric">{Math.round((fromTotal.get(name)??0)*100)/100}{unit}</text></g>})}{to.map(name=>{const y=(targetTop.get(name)??0)*mobileFactor,h=(toTotal.get(name)??0)*scale*mobileFactor;return <g key={name}><rect x="180" y={y} width="11" height={h} rx="4" fill="#a7a7a7"/><text x="198" y={y+h/2+3} className="ui-chart-sankey__name">{name}<tspan className="ui-chart-sankey__metric"> · {Math.round((toTotal.get(name)??0)/total*100)}%</tspan></text></g>})}</svg>
  <div className="ui-chart-sankey__footer"><span>{startLabel}</span><span>{endLabel}</span></div>
 </Frame>;
}
export function StageBarsCard({title='Pipeline',value='1,180',change='+2.4%',series=[{label:'Visits',value:1180,color:'var(--chart-lime)'},{label:'Sign-up',value:790,color:'var(--chart-blue)'},{label:'Active',value:460,color:'var(--chart-violet)'},{label:'Pro',value:250,color:'var(--chart-pink)'},{label:'Team',value:120,color:'#ffc400'},{label:'Enterprise',value:40,color:'#05c8b0'}],className}:ChartCardProps){const max=Math.max(...series.map(s=>s.value),1);const icons=[RiEyeLine,RiUserAddLine,RiFlashlightLine,RiVipCrownLine,RiGroupLine,RiBuildingLine];return <Frame title={title} value={value} change={change} className={cx('ui-chart-card--stage',className)} periods={['Last 7 days']}><div className="ui-chart-stage">{series.map((s,i)=>{const Icon=icons[i%icons.length];return <div key={s.label}><span>{s.label}</span><div><b style={{width:`${s.value/max*100}%`,background:s.color??palette[i]}}/><Icon size={14} aria-hidden/></div><strong>{s.value.toLocaleString()} <small>{Math.round(s.value/max*100)}%</small></strong></div>})}</div><Footer items={series}/></Frame>}
