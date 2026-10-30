'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RiArrowLeftSLine, RiArrowRightSLine, RiEdit2Line, RiShareLine } from '@remixicon/react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { ContributionsCard, LineChartCard } from '@/components/charts/chart-cards';

export type ProfileData = { name: string; initials: string; subtitle: string; image?: string; contributions: string; tokens: string; streak: string };

function AgentsActivity() {
  const [monthOffset,setMonthOffset]=useState(0);
  const reducedMotion=useReducedMotion();
  const month=new Date(Date.UTC(2026,11+monthOffset,1));
  const label=month.toLocaleDateString('en-US',{month:'long',timeZone:'UTC'});
  const count=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
  const values=Array.from({length:count},(_,index)=>Math.max(2,Math.round(5+10*Math.abs(Math.sin((index+3+monthOffset*7)*1.43))+8*Math.abs(Math.cos((index+monthOffset)*.52))-((index+monthOffset*3)%7===3?12:0))));
  return <section className="ui-profile-agents"><header><div><span>Agents</span><strong>32 agents</strong></div><div role="group" aria-label="Agents month"><button type="button" aria-label="Previous month" onClick={()=>setMonthOffset(current=>current-1)}><RiArrowLeftSLine size={17}/></button><span>{label}</span><button type="button" aria-label="Next month" onClick={()=>setMonthOffset(current=>current+1)}><RiArrowRightSLine size={17}/></button></div></header><div className="ui-profile-agents__bars" key={label} role="img" aria-label={`${label} agent activity`}>{values.map((value,index)=><div key={index} title={`${label} ${index+1}: ${value} sessions`}><motion.span initial={reducedMotion?false:{scaleY:0}} animate={{scaleY:1}} transition={{duration:reducedMotion?0:.44,delay:reducedMotion?0:index*.012,ease:[.2,.75,.25,1]}} style={{height:`${value*4}%`}}/></div>)}</div><footer><span>1 {label}</span><span>{count} {label}</span></footer></section>;
}

export function ProfileWorkspace({profile,onAction}:{profile:ProfileData;onAction?:(action:string)=>void}) {
  const [display,setDisplay]=useState(profile);
  const [editing,setEditing]=useState(false);
  useEffect(()=>{if(!editing)return;const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')setEditing(false)};window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown)},[editing]);
  function update(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);setDisplay(current=>({...current,name:String(data.get('name')??current.name),subtitle:String(data.get('subtitle')??current.subtitle)}));setEditing(false);onAction?.('Profile updated')}
  async function share(){try{await navigator.clipboard.writeText(location.href);onAction?.('Profile link copied')}catch{onAction?.('Could not copy profile link')}}
  return <div className="ui-profile"><section className="ui-profile-card"><div className="ui-profile-card__cover" role="img" aria-label="Warm architectural cover artwork"/><div className="ui-profile-card__body"><div className="ui-profile-card__identity"><Avatar size="lg" initials={display.initials} src={display.image} alt={display.name}/><div><h1>{display.name}</h1><span>{display.subtitle}</span></div><div className="ui-profile-card__actions"><Button variant="secondary" size="small" leadingIcon={RiShareLine} onClick={share}>Share</Button><Button variant="secondary" size="small" leadingIcon={RiEdit2Line} onClick={()=>setEditing(true)}>Edit</Button></div></div><ContributionsCard value={display.contributions} /></div></section><AgentsActivity/><LineChartCard title="Tokens" value={display.tokens} change="+9.4%"/>
    <AnimatePresence>{editing&&<div className="ui-dash-dialog-layer"><button className="ui-dash-dialog-layer__scrim" type="button" aria-label="Close profile editor" onClick={()=>setEditing(false)}/><motion.section className="ui-dash-dialog" role="dialog" aria-modal="true" aria-label="Edit profile" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}><header><h2>Edit profile</h2><button type="button" aria-label="Close profile editor" onClick={()=>setEditing(false)}>×</button></header><form onSubmit={update}><label>Name<input name="name" defaultValue={display.name} autoFocus required/></label><label>Subtitle<input name="subtitle" defaultValue={display.subtitle} required/></label><footer><Button variant="secondary" size="small" type="button" onClick={()=>setEditing(false)}>Cancel</Button><Button size="small" type="submit">Save changes</Button></footer></form></motion.section></div>}</AnimatePresence>
  </div>;
}
