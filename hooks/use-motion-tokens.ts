'use client';

import {useLayoutEffect,useState,type RefObject} from 'react';

export type MotionTokens={fast:number;standard:number;settle:number;ease:[number,number,number,number]};
const defaults:MotionTokens={fast:.16,standard:.24,settle:.36,ease:[.2,.75,.25,1]};
function seconds(value:string,fallback:number){const match=value.trim().match(/^([\d.]+)(ms|s)$/);if(!match)return fallback;const amount=Number(match[1])/(match[2]==='ms'?1000:1);return Number.isFinite(amount)&&amount>=0?amount:fallback;}

/** Use the same scoped CSS tokens for JavaScript layout/glyph animation. */
export function useMotionTokens(scope?:RefObject<Element|null>){
  const [tokens,setTokens]=useState<MotionTokens>(defaults);
  useLayoutEffect(()=>{
    const element=scope?.current??document.documentElement;
    function read(){
      const style=getComputedStyle(element),curve=style.getPropertyValue('--motion-ease').match(/^\s*cubic-bezier\(([^)]+)\)/)?.[1].split(',').map(Number);
      const ease=curve?.length===4&&curve.every(Number.isFinite)?curve as MotionTokens['ease']:defaults.ease;
      const next={fast:seconds(style.getPropertyValue('--motion-fast'),defaults.fast),standard:seconds(style.getPropertyValue('--motion-standard'),defaults.standard),settle:seconds(style.getPropertyValue('--motion-settle'),defaults.settle),ease};
      setTokens(current=>current.fast===next.fast&&current.standard===next.standard&&current.settle===next.settle&&current.ease.every((value,index)=>value===next.ease[index])?current:next);
    }
    read();const observer=new MutationObserver(read);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['style','class','data-accent']});
    if(element!==document.documentElement)observer.observe(element,{attributes:true,attributeFilter:['style','class']});
    return()=>observer.disconnect();
  },[scope]);
  return tokens;
}
