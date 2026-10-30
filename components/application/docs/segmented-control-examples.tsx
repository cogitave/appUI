'use client';

import {useState} from 'react';
import {RiGridLine,RiListCheck,RiTableLine} from '@remixicon/react';
import {Button} from '@/components/base/buttons/button';
import {Direction} from '@/components/base/direction/direction';
import {FieldSet} from '@/components/base/field/field';
import {SegmentedControl} from '@/components/base/segmented-control/segmented-control';
import {DocExampleSection as Section} from './doc-example-section';

const periods=[{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'},{value:'yearly',label:'Yearly'}];
const views=[{value:'list',label:'List',icon:<RiListCheck/>},{value:'grid',label:'Grid',icon:<RiGridLine/>},{value:'table',label:'Table',icon:<RiTableLine/>}];

export function SegmentedControlExamples(){
 const [period,setPeriod]=useState('monthly'),[view,setView]=useState('list'),[size,setSize]=useState<'small'|'medium'>('medium'),[disabled,setDisabled]=useState(false);
 return <>
  <Section title="Controlled selection" description="Use one persistent choice to configure the surrounding view. Arrow keys, Home and End select an enabled option."><div className="docs-example__button-row"><SegmentedControl aria-label="Report period" options={periods} value={period} onValueChange={setPeriod}/><output className="docs-example__date-result" aria-live="polite">{period}</output></div></Section>
  <Section title="With icons" description="Optional icons support short labels while preserving a single choice."><div className="docs-segmented-example"><SegmentedControl aria-label="View" options={views} value={view} onValueChange={setView}/></div></Section>
  <Section title="Surfaces" description="Soft, outlined and underlined treatments share the same moving selection and keyboard behavior."><div className="docs-extended-stack">{(['soft','outline','underline'] as const).map(variant=><SegmentedControl key={variant} aria-label={`${variant} period`} variant={variant} options={periods} defaultValue="monthly"/>)}</div></Section>
  <Section title="Sizes" description="Small and medium use complete shared type roles. Changing size animates the control's actual geometry."><div className="docs-extended-stack"><SegmentedControl aria-label="Control size" size="small" options={[{value:'small',label:'Small'},{value:'medium',label:'Medium'}]} value={size} onValueChange={value=>setSize(value as typeof size)}/><SegmentedControl aria-label="Sized period" size={size} options={periods} defaultValue="monthly"/></div></Section>
  <Section title="Equal width and vertical" description="Equal choices fill the supplied width. A vertical group keeps its indicator at the leading edge."><div className="docs-extended-stack"><SegmentedControl aria-label="Equal view" fit="equal" options={views} defaultValue="list"/><SegmentedControl aria-label="Vertical period" orientation="vertical" variant="underline" options={periods} defaultValue="monthly"/></div></Section>
  <Section title="Disabled choices" description="Disabled options are skipped by navigation. A shared fieldset disables the entire group."><div className="docs-extended-stack"><SegmentedControl aria-label="Available periods" options={[...periods,{value:'custom',label:'Custom',isDisabled:true}]} defaultValue="weekly"/><Button variant="secondary" size="small" aria-pressed={disabled} onClick={()=>setDisabled(value=>!value)}>Lock preferences</Button><FieldSet legend="Preferences" disabled={disabled}><SegmentedControl aria-label="Locked period" options={periods} defaultValue="monthly"/></FieldSet></div></Section>
  <Section title="Right to left" description="Direction scopes keep visual order and keyboard navigation together, including an inner left-to-right group."><div className="docs-extended-stack"><Direction dir="rtl"><SegmentedControl aria-label="RTL period" options={periods} defaultValue="monthly"/><div className="docs-segmented-directions"><SegmentedControl aria-label="RTL vertical period" orientation="vertical" variant="underline" options={periods} defaultValue="monthly"/><Direction dir="ltr"><SegmentedControl aria-label="Nested LTR vertical period" orientation="vertical" variant="underline" options={periods} defaultValue="monthly"/></Direction></div></Direction></div></Section>
 </>;
}
