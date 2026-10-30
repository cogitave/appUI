'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import { ActivityRingsCard, AreaChartCard, BarListCard, ComboChartCard, ContributionsCard, EarningsChartCard, FunnelChartCard, HeatmapChartCard, LineChartCard, MostActiveDaysCard, OrdersChartCard, RadarChartCard, RadialChartCard, RevenueChartCard, SankeyChartCard, ScatterChartCard, SleepScoreCard, StageBarsCard, StepsCard, type ChartPoint } from '@/components/charts/chart-cards';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { TemplatePreview } from './template-previews';
import { demoDaySummary, initialDemoDay } from '@/utils/demo-day-activity';

type Props = { slug: DocSlug; onNotify:(message:string)=>void };
const alternate:ChartPoint[] = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((label,i)=>({label,value:[25,35,46,41,56,62,58,72,78,74,84,95][i],secondary:[20,23,30,34,32,42,47,49,55,54,59,63][i],tertiary:[8,12,18,19,23,26,33,35,39,42,44,48][i]}));
const componentMap = {
 'activity-rings-card':ActivityRingsCard,'area-chart-card':AreaChartCard,'bar-list-card':BarListCard,'combo-chart-card':ComboChartCard,'contributions-card':ContributionsCard,'earnings-chart-card':EarningsChartCard,'funnel-chart-card':FunnelChartCard,'heatmap-chart-card':HeatmapChartCard,'line-chart-card':LineChartCard,'most-active-days-card':MostActiveDaysCard,'orders-chart-card':OrdersChartCard,'radar-chart-card':RadarChartCard,'radial-chart-card':RadialChartCard,'revenue-chart-card':RevenueChartCard,'sankey-chart-card':SankeyChartCard,'scatter-chart-card':ScatterChartCard,'sleep-score-card':SleepScoreCard,'stage-bars-card':StageBarsCard,'steps-card':StepsCard,
} as const;
function Section({title,description,children}:{title:string;description:string;children:ReactNode}){return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p><div className="docs-example__surface docs-example__chart">{children}</div></section>}
const customProps: Record<string, Record<string, unknown>> = {
 'activity-rings-card': { rings:[{label:'Move',value:'840 kcal',progress:.58,color:'var(--chart-pink)'},{label:'Exercise',value:'42 min',progress:.85,color:'var(--chart-lime)'},{label:'Distance',value:'4.1 km',progress:.45,color:'var(--chart-blue)'}] },
 'area-chart-card':{points:alternate},'combo-chart-card':{points:alternate},'earnings-chart-card':{points:alternate},'line-chart-card':{points:alternate},'orders-chart-card':{points:alternate},'radar-chart-card':{points:alternate.slice(0,6)},'revenue-chart-card':{points:alternate},'scatter-chart-card':{points:alternate},'steps-card':{points:alternate.slice(0,7).map((p,i)=>({...p,value:p.value*100,label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}))},
 'bar-list-card':{breakdowns:{Devices:[{label:'Desktop',value:52},{label:'Mobile',value:39},{label:'Tablet',value:9}],Browsers:[{label:'Safari',value:51},{label:'Chrome',value:37},{label:'Firefox',value:12}]}},
 'contributions-card':{cells:Array.from({length:84},(_,i)=>({value:(i*7+i%5)%6,label:`Day ${i+1}`}))},
 'heatmap-chart-card':{cells:Array.from({length:84},(_,i)=>({value:(i*3+i%7)%6,label:`Hour ${i+1}`}))},
 'funnel-chart-card':{series:[{label:'Viewed',value:420,color:'var(--chart-lime)'},{label:'Started',value:260,color:'var(--chart-blue)'},{label:'Completed',value:140,color:'var(--chart-violet)'}]},
 'most-active-days-card':{activity:Array.from({length:31},(_,i)=>({day:i+1,levels:[.35+(i%5)*.12,.4+(i%3)*.15,.25+(i%7)*.08]}))},
 'radial-chart-card':{series:[{label:'Desktop',value:320},{label:'Mobile',value:240},{label:'Tablet',value:120}]},
 'sankey-chart-card':{links:[{from:'Research',to:'Design',value:12,color:'var(--chart-teal)'},{from:'Research',to:'Writing',value:7,color:'var(--chart-blue)'},{from:'Review',to:'Design',value:6,color:'var(--chart-violet)'}]},
 'sleep-score-card':{score:74},
 'stage-bars-card':{series:[{label:'Visited',value:2200,color:'var(--chart-lime)'},{label:'Signed up',value:820,color:'var(--chart-blue)'},{label:'Active',value:370,color:'var(--chart-violet)'}]},
};
function ActiveDaysPreview(){
 const [day,setDay]=useState(initialDemoDay);
 const summary=demoDaySummary(day);
 return <div className="docs-preview__activity-pair"><MostActiveDaysCard selectedDate={day.date} onDaySelect={setDay}/><ActivityRingsCard {...summary}/></div>;
}
export function ChartPreview({slug,onNotify}:Props){const Card=componentMap[slug as keyof typeof componentMap] as ComponentType<any> | undefined;if(!Card)return <TemplatePreview slug={slug} onNotify={onNotify}/>;if(slug==='most-active-days-card')return <ActiveDaysPreview/>;return <div className="docs-preview__chart" data-chart={slug}><Card onPeriodChange={(period:string)=>onNotify(`${period} selected.`)} /></div>}
export function ChartExamples({slug,onNotify}:Props){const Card=componentMap[slug as keyof typeof componentMap] as ComponentType<any> | undefined;if(!Card)return null;return <><Section title="Custom data" description="Provide values from your data source; each visual calculates its geometry from those values."><Card {...customProps[slug]} onPeriodChange={(period:string)=>onNotify(`${period} selected.`)} /></Section><Section title="Responsive card" description="The card keeps labels, values and the plot readable when its container narrows."><div style={{width:'min(100%,340px)'}}><Card /></div></Section></>}
