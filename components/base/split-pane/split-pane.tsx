'use client';

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject, type Ref } from 'react';
import { useElementSize } from '@/hooks/use-element-size';
import { cx } from '@/utils/cx';

export type ResizeHandleProps = {
  value: number;
  minValue?: number;
  maxValue?: number;
  minExpandedValue?: number;
  onChange: (value: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: (value: number) => void;
  onToggle?: () => void;
  onReset?: () => void;
  orientation?: 'horizontal' | 'vertical';
  unit?: 'percent' | 'pixel';
  edge?: 'start' | 'end';
  step?: number;
  isDisabled?: boolean;
  controls: string;
  primaryRef?: RefObject<HTMLElement | null>;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  'aria-label': string;
};
const finite = (value: number | undefined, fallback: number) => Number.isFinite(value) ? value! : fallback;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** A focusable window splitter. Orientation describes the direction of resizing. */
export function ResizeHandle({ value, minValue = 0, maxValue = 100, minExpandedValue, onChange, onResizeStart, onResizeEnd, onToggle, onReset, orientation = 'horizontal', unit = 'percent', edge = 'start', step = 1, isDisabled = false, controls, primaryRef, ref, className, 'aria-label': label }: ResizeHandleProps) {
  const minimum = finite(minValue, 0), maximum = Math.max(minimum, finite(maxValue, minimum + 100));
  const current = clamp(finite(value, minimum), minimum, maximum), increment = Math.max(.01, finite(step, 1));
  const expandedMinimum = clamp(finite(minExpandedValue, minimum), minimum, maximum);
  const currentValue = useRef(current);
  const gesture = useRef<{pointer: number; coordinate: number; original: number; start: number; factor: number; element: HTMLDivElement; orientation: string; unit: string; edge: string; minimum: number; maximum: number} | null>(null);
  const [dragging, setDragging] = useState(false);
  const instructions = useId();
  const disabled = isDisabled || minimum === maximum;
  useLayoutEffect(() => { currentValue.current = current; }, [current]);
  function emit(candidate: number, mode: 'pointer'|'arrow'|'edge'|'settle' = 'pointer') {
    let next = clamp(finite(candidate, minimum), minimum, maximum);
    if (mode === 'arrow' && next > minimum && next < expandedMinimum) next = expandedMinimum;
    if (mode === 'settle' && next < expandedMinimum) next = next < (minimum + expandedMinimum) / 2 ? minimum : expandedMinimum;
    const changed = next !== currentValue.current;
    currentValue.current = next;
    if (changed) onChange(next);
    return next;
  }
  useLayoutEffect(() => {
    const active = gesture.current;
    if (active && (disabled || active.orientation !== orientation || active.unit !== unit || active.edge !== edge || active.minimum !== minimum || active.maximum !== maximum)) finish(active.element, true);
  }, [orientation, unit, edge, disabled, minimum, maximum]);
  useLayoutEffect(() => () => {
    const active = gesture.current;
    gesture.current = null;
    if (active?.element.hasPointerCapture(active.pointer)) active.element.releasePointerCapture(active.pointer);
  }, []);
  function finish(element: HTMLDivElement, cancel = false) {
    const active = gesture.current;
    if (!active) return;
    gesture.current = null; setDragging(false);
    const next = emit(cancel ? active.original : currentValue.current, cancel ? 'edge' : 'settle');
    if (element.hasPointerCapture(active.pointer)) element.releasePointerCapture(active.pointer);
    onResizeEnd?.(next);
  }
  const hint = `${orientation === 'horizontal' ? 'Left and right' : 'Up and down'} arrows resize; Shift moves farther. Home and End move to the boundaries.${onToggle ? ' Enter collapses or restores the panel.' : ''}${onReset ? ' Double click resets its size.' : ''} Escape cancels a drag.`;
  return <div ref={ref} role="separator" tabIndex={disabled ? -1 : 0} aria-label={label} aria-describedby={instructions} aria-controls={controls} aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} aria-valuemin={minimum} aria-valuemax={maximum} aria-valuenow={current} aria-valuetext={`${Math.round(current * 100) / 100}${unit === 'percent' ? '%' : ' pixels'}`} aria-disabled={disabled || undefined} className={cx('ui-resize-handle', className)} data-orientation={orientation} data-resizing={dragging || undefined}
    onPointerDown={event => {
      if (disabled || event.button !== 0 || gesture.current) return;
      const element = event.currentTarget, container = element.parentElement;
      if (!container) return;
      event.preventDefault(); element.focus({preventScroll:true});
      const horizontal = orientation === 'horizontal', rect = container.getBoundingClientRect();
      const scale = (horizontal ? rect.width / container.offsetWidth : rect.height / container.offsetHeight) || 1;
      const style = getComputedStyle(container);
      const padding = horizontal ? parseFloat(style.paddingLeft)+parseFloat(style.paddingRight) : parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
      const available = Math.max(1, (horizontal ? container.clientWidth-element.offsetWidth : container.clientHeight-element.offsetHeight) - padding);
      const sign = (horizontal && style.direction === 'rtl' ? -1 : 1) * (edge === 'end' ? -1 : 1);
      const factor = sign * (unit === 'percent' ? 100 / (available * scale) : 1 / scale);
      const pane = primaryRef?.current?.getBoundingClientRect();
      const measured = pane ? (horizontal ? pane.width : pane.height) / scale : undefined;
      const start = measured === undefined ? currentValue.current : clamp(unit === 'percent' ? measured * 100 / available : measured, minimum, maximum);
      gesture.current = {pointer:event.pointerId,coordinate:horizontal?event.clientX:event.clientY,original:currentValue.current,start,factor,element,orientation,unit,edge,minimum,maximum};
      element.setPointerCapture(event.pointerId); setDragging(true); onResizeStart?.(); emit(start);
    }}
    onPointerMove={event=>{const active=gesture.current;if(!active || active.pointer!==event.pointerId)return;emit(active.start+((orientation==='horizontal'?event.clientX:event.clientY)-active.coordinate)*active.factor);}}
    onPointerUp={event=>{const active=gesture.current;if(active?.pointer===event.pointerId){emit(active.start+((orientation==='horizontal'?event.clientX:event.clientY)-active.coordinate)*active.factor);finish(event.currentTarget);}}}
    onPointerCancel={event=>{if(gesture.current?.pointer===event.pointerId)finish(event.currentTarget,true);}}
    onLostPointerCapture={event=>{if(gesture.current?.pointer===event.pointerId)finish(event.currentTarget,true);}}
    onDoubleClick={event=>{if(disabled || !onReset)return;event.preventDefault();onReset();}}
    onKeyDown={event=>{
      if(disabled)return;
      if(event.key==='Escape' && gesture.current){event.preventDefault();event.stopPropagation();finish(event.currentTarget,true);return;}
      if(gesture.current)return;
      if(event.key==='Enter' && onToggle){event.preventDefault();onToggle();return;}
      const horizontal=orientation==='horizontal', negative=horizontal?'ArrowLeft':'ArrowUp',positive=horizontal?'ArrowRight':'ArrowDown';
      if(![negative,positive,'Home','End'].includes(event.key))return;
      event.preventDefault();
      const rtl=horizontal && getComputedStyle(event.currentTarget.parentElement!).direction==='rtl';
      const sign=(rtl?-1:1)*(edge==='end'?-1:1);
      const candidate=event.key==='Home'?minimum:event.key==='End'?maximum:currentValue.current+(event.key===positive?1:-1)*sign*increment*(event.shiftKey?10:1);
      onResizeEnd?.(emit(candidate,event.key==='Home'||event.key==='End'?'edge':'arrow'));
    }}><span className="ui-resize-handle__grip" aria-hidden/><span className="sr-only" id={instructions}>{hint}</span></div>;
}

export type SplitPaneProps = {
  primary: ReactNode;
  secondary: ReactNode;
  primaryLabel: string;
  secondaryLabel: string;
  primaryId?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onResizeEnd?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Logical edge occupied by the primary panel. */
  primaryEdge?: 'start' | 'end';
  /** Switch to vertical panes at this container width without remounting content. */
  stackAt?: number;
  height?: number | string;
  collapsible?: boolean;
  isDisabled?: boolean;
  className?: string;
};
export function SplitPane({ primary, secondary, primaryLabel, secondaryLabel, primaryId:providedPrimaryId, value, defaultValue = 35, onValueChange, onResizeEnd, minValue = 20, maxValue = 80, orientation = 'horizontal', primaryEdge='start', stackAt, height = 360, collapsible = false, isDisabled, className }: SplitPaneProps) {
  const [internal,setInternal] = useState(finite(defaultValue,35));
  const [resizing,setResizing] = useState(false);
  const minimum=clamp(finite(minValue,20),0,100), maximum=clamp(finite(maxValue,80),minimum,100);
  const raw=finite(value??internal,minimum), current=collapsible && resizing?clamp(raw,0,maximum):collapsible && raw<=0?0:clamp(raw,minimum,maximum);
  const previous=useRef(clamp(finite(defaultValue,35),minimum,maximum));
  const primaryRef=useRef<HTMLDivElement>(null),secondaryRef=useRef<HTMLDivElement>(null),handleRef=useRef<HTMLDivElement>(null);
  const {ref,width}=useElementSize<HTMLDivElement>(640,360);
  const id=useId(), primaryId=providedPrimaryId??`${id}-primary`,secondaryId=`${id}-secondary`;
  const direction=orientation==='horizontal' && stackAt!==undefined && width<=stackAt?'vertical':orientation;
  function change(next:number){if((next===0 && primaryRef.current?.contains(document.activeElement)) || (next===100 && secondaryRef.current?.contains(document.activeElement)))handleRef.current?.focus({preventScroll:true});if(next>0)previous.current=next;if(value===undefined)setInternal(next);onValueChange?.(next);}
  function toggle(){change(current===0?clamp(previous.current,minimum,maximum):0);}
  return <div ref={ref} className={cx('ui-split-pane',className)} data-orientation={direction} data-primary-edge={primaryEdge} style={{'--split-primary':`${current}fr`,'--split-secondary':`${100-current}fr`,'--split-height':typeof height==='number'?`${Math.max(0,finite(height,360))}px`:height} as CSSProperties}>
    <div ref={primaryRef} id={primaryId} role="region" aria-label={primaryLabel} className="ui-split-pane__panel" inert={current===0} aria-hidden={current===0 || undefined} data-collapsed={current===0 || undefined}>{primary}</div>
    <ResizeHandle ref={handleRef} value={current} minValue={collapsible?0:minimum} minExpandedValue={minimum} maxValue={maximum} onChange={change} onResizeStart={()=>setResizing(true)} onResizeEnd={next=>{setResizing(false);onResizeEnd?.(next);}} onToggle={collapsible?toggle:undefined} onReset={()=>change(clamp(finite(defaultValue,35),minimum,maximum))} orientation={direction} edge={primaryEdge} controls={primaryId} primaryRef={primaryRef} aria-label={primaryLabel} isDisabled={isDisabled}/>
    <div ref={secondaryRef} id={secondaryId} role="region" aria-label={secondaryLabel} className="ui-split-pane__panel" inert={current===100} aria-hidden={current===100 || undefined} data-collapsed={current===100 || undefined}>{secondary}</div>
  </div>;
}
