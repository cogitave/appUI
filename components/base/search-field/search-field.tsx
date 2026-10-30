'use client';

import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Input, type InputProps } from '@/components/base/input/input';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Spinner } from '@/components/base/spinner/spinner';
import { cx } from '@/utils/cx';

export type SearchFieldProps = Omit<InputProps,'type'|'leading'|'trailing'|'trailingAction'|'inputRef'> & {isLoading?:boolean;onClear?:()=>void;inputRef?:Ref<HTMLInputElement>;};
export function SearchField({value,defaultValue='',onChange,onClear,isLoading=false,className,isDisabled,inputRef,...props}:SearchFieldProps) {
  const [internal,setInternal]=useState(defaultValue),text=value??internal,input=useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();
  useImperativeHandle(inputRef,()=>input.current!,[]);
  function change(next:string){if(value===undefined)setInternal(next);onChange?.(next);}
  return <Input {...props} type="search" aria-busy={isLoading || undefined} value={text} onChange={change} isDisabled={isDisabled} inputRef={input} className={cx('ui-search-field',className)} leading={<RiSearchLine size={17}/>} trailing={<AnimatePresence initial={false}>{isLoading && <motion.span className="ui-search-field__pending" initial={{width:0,opacity:0}} animate={{width:14,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:reduced?0:.16,ease:[.2,.75,.25,1]}}><Spinner size="xs"/></motion.span>}</AnimatePresence>} trailingAction={text?<CloseButton size="xs" aria-label={`Clear ${props.label.toLowerCase()}`} disabled={isDisabled} onClick={()=>{change('');onClear?.();input.current?.focus();}}/>:undefined}/>;
}
