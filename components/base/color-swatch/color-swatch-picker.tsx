'use client';

import {useId,useMemo,useRef,useState,type CSSProperties} from 'react';
import {ListBox,ListBoxItem,parseColor} from 'react-aria-components';
import {motion,useReducedMotion} from 'motion/react';
import {AnimatedHeight} from '@/components/base/animated-height/animated-height';
import {ScrollArea} from '@/components/base/scroll-area/scroll-area';
import {useFieldDisabled} from '@/components/base/field/field-context';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import {ColorSwatch,type SwatchAppearance,type SwatchShape,type SwatchSize} from './color-swatch';
import {cx} from '@/utils/cx';

export type ColorOption={color:string;label:string;isDisabled?:boolean};
export type ColorSwatchPickerProps={
 options:ColorOption[];value?:string;defaultValue?:string;onValueChange?:(color:string)=>void;
 size?:SwatchSize;shape?:SwatchShape;appearance?:SwatchAppearance;
 layout?:'grid'|'row'|'list';isDisabled?:boolean;maxHeight?:number|string;emptyLabel?:string;
 id?:string;'aria-label':string;'aria-describedby'?:string;className?:string;style?:CSSProperties;
};
const colorKey=(color:string)=>parseColor(color).toString('hexa').toLowerCase();

/** A named native single-selection collection. Equivalent colors must be unique. */
export function ColorSwatchPicker({options,value,defaultValue,onValueChange,size='medium',shape='circle',appearance='flat',layout='grid',isDisabled:disabled,maxHeight,emptyLabel='No colors available',id:domId,'aria-label':ariaLabel,'aria-describedby':descriptionId,className,style}:ColorSwatchPickerProps){
 const isDisabled=useFieldDisabled(disabled),id=useId(),root=useRef<HTMLDivElement>(null),reduced=useReducedMotion(),tokens=useMotionTokens(root);
 const colors=useMemo(()=>{const seen=new Set<string>();return options.map(option=>{const key=colorKey(option.color);if(seen.has(key))throw new Error(`ColorSwatchPicker requires unique colors: ${option.color}`);seen.add(key);return {...option,key};})},[options]);
 const [internal,setInternal]=useState(()=>defaultValue??options.find(option=>!option.isDisabled)?.color);
 const current=value??internal,selected=current?[colorKey(current)]:[];
 return <div ref={root} className={cx('ui-color-picker',className)} style={{'--color-picker-max-height':typeof maxHeight==='number'?`${maxHeight}px`:maxHeight,...style} as CSSProperties} data-layout={layout} data-size={size} data-constrained={maxHeight!==undefined||undefined} data-disabled={isDisabled||undefined}>
  <AnimatedHeight>{!colors.length&&<span id={`${id}-empty`} className="ui-color-picker__empty" role="status">{emptyLabel}</span>}
  <ScrollArea label={ariaLabel} orientation={layout==='row'?'horizontal':'vertical'} className="ui-color-picker__scroll" renderViewport={({ref,className:viewportClassName})=><ListBox ref={ref} id={domId} aria-label={ariaLabel} aria-describedby={[descriptionId,!colors.length?`${id}-empty`:undefined].filter(Boolean).join(' ')||undefined} className={cx('ui-color-picker__list',viewportClassName)} items={colors} dependencies={[size,shape,appearance,isDisabled,layout]} layout={layout==='list'?'stack':'grid'} orientation={layout==='list'?'vertical':'horizontal'} selectionMode="single" selectionBehavior="replace" disallowEmptySelection selectedKeys={selected} onSelectionChange={keys=>{if(isDisabled||keys==='all')return;const key=[...keys][0],option=colors.find(option=>option.key===key);if(!option||option.isDisabled)return;if(value===undefined)setInternal(option.color);onValueChange?.(option.color);}}>
    {option=><ListBoxItem id={option.key} textValue={option.label} aria-label={option.label} isDisabled={isDisabled||option.isDisabled} className="ui-color-picker__option" data-color={option.color}>{({isSelected})=><><span className="ui-color-picker__visual"><ColorSwatch color={option.color} aria-hidden size={size} shape={shape} appearance={appearance}/>{isSelected&&<motion.span layoutId={`${id}-color`} className="ui-color-picker__selection" data-shape={shape} transition={{duration:reduced?0:tokens.standard,ease:tokens.ease}}/>}</span>{layout==='list'&&<span className="ui-color-picker__label">{option.label}</span>}</>}</ListBoxItem>}
   </ListBox>}/></AnimatedHeight>
 </div>;
}
