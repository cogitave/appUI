import { defaultDayActivity, type ActiveDaySelection, type RingMetric } from '@/components/charts/chart-cards';

export const initialDemoDay:ActiveDaySelection={date:'2026-07-10',day:10,levels:defaultDayActivity[9].levels};

/** Illustrative goal values shared by the docs and the medical workspace demo. */
export function demoDaySummary(day:ActiveDaySelection){
 const date=new Date(`${day.date}T00:00:00Z`);
 const minutes=Math.round(day.levels[1]*140);
 const rings:RingMetric[]=[
  {label:'Move',value:`${Math.round(day.levels[0]*1800).toLocaleString('en-US')} kcal`,progress:day.levels[0],color:'var(--chart-pink)'},
  {label:'Exercise',value:`${Math.floor(minutes/60)}h ${minutes%60}m`,progress:day.levels[1],color:'var(--chart-lime)'},
  {label:'Running',value:`${(day.levels[2]*8).toFixed(1)} km`,progress:day.levels[2],color:'var(--chart-blue)'},
 ];
 return {title:`Activity for ${date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}`,rings};
}
