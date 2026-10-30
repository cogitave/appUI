'use client';

import { Select as AriaSelect, Label, Button, SelectValue, Popover, ListBox, ListBoxItem, SelectStateContext, type SelectProps as AriaSelectProps } from 'react-aria-components';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';
import {useOverlayPosition,usePreventScroll} from 'react-aria';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import {useAnchorScrollGuard} from '@/hooks/use-anchor-scroll-guard';
import { FieldFeedback } from '@/components/base/input/field-feedback';

function DisabledSelectCloser({isDisabled}:{isDisabled?:boolean}) {
  const state=useContext(SelectStateContext);
  usePreventScroll({isDisabled:!state?.isOpen});
  useEffect(()=>{if(isDisabled&&state?.isOpen)state.close();},[isDisabled,state]);
  return null;
}

function SelectTrigger({trigger,className,children}:{trigger:RefObject<HTMLButtonElement|null>;className?:string;children:ReactNode}) {
  const state=useContext(SelectStateContext);
  const dismissPress=useRef(false);
  return <Button ref={trigger} render={domProps=><button {...domProps} aria-invalid={state?.displayValidation.isInvalid || undefined} onPointerDownCapture={event=>{
    // Native select-style mouse presses open on down. A second press closes
    // through the public state, before the native opening handler can run.
    dismissPress.current=Boolean(state?.isOpen)&&event.button===0;
    if(dismissPress.current){event.preventDefault();event.stopPropagation();state?.close();trigger.current?.focus({preventScroll:true});}
  }} onClickCapture={event=>{if(dismissPress.current){event.preventDefault();event.stopPropagation();dismissPress.current=false;}}}/>} className={className}>{children}</Button>;
}

function SelectExitFocus({isExiting,trigger,surface,restore,children}:{isExiting:boolean;trigger:RefObject<HTMLButtonElement|null>;surface:RefObject<HTMLElement|null>;restore:RefObject<boolean>;children:ReactNode}) {
  const state=useContext(SelectStateContext);
  useEffect(()=>{
    if(!state?.isOpen||isExiting)return;
    const focusOnOpening=()=>{
      const list=surface.current?.querySelector<HTMLElement>('[role="listbox"]');
      if(!list||list.contains(document.activeElement))return;
      const options=[...list.querySelectorAll<HTMLElement>('.ui-select__option:not([data-disabled])')];
      const selected=options.find(option=>option.hasAttribute('data-selected'));
      const target=selected??(state.focusStrategy==='last'?options.at(-1):options[0])??list;
      target.focus({preventScroll:true});
    };
    // A reversal keeps the collection mounted. Restore its focus only after
    // containment resumes, without overwriting navigation already inside it.
    const frame=requestAnimationFrame(focusOnOpening);
    return()=>cancelAnimationFrame(frame);
  },[isExiting,state?.isOpen,state?.collection.size,state?.focusStrategy,surface]);
  useEffect(()=>{
    if(!isExiting){
      const element=surface.current;
      const remember=()=>{restore.current=!!element?.contains(document.activeElement);};
      remember();element?.addEventListener('focusin',remember);
      return()=>element?.removeEventListener('focusin',remember);
    }
    if(!restore.current)return;
    const active=document.activeElement,dialog=trigger.current?.closest('[role="dialog"], [role="alertdialog"]');
    // The popover releases containment during exit. Its inert option may have
    // blurred into the enclosing dialog; preserve deliberate focus elsewhere.
    if(active===document.body||active===dialog||surface.current?.contains(active))trigger.current?.focus({preventScroll:true});
    restore.current=false;
  },[isExiting,restore,surface,trigger]);
  return children;
}

export type SelectOption = { id: string; label: string; detail?: string; leading?: ReactNode; isDisabled?: boolean };
export type SelectProps = Omit<AriaSelectProps<SelectOption>, 'children' | 'className' | 'items' | 'selectedKey' | 'defaultSelectedKey' | 'onSelectionChange'> & {
  options: SelectOption[];
  label?: string;
  name?: string;
  placeholder?: string;
  selectedKey?: string | null;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string | null) => void;
  isDisabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  hideIndicator?: boolean;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  density?: 'comfortable' | 'compact' | 'touch';
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

export function Select({ options, label, name, placeholder = 'Select an option', selectedKey, defaultSelectedKey, onSelectionChange, isDisabled: disabled, className, triggerClassName, popoverClassName, hideIndicator = false, hideLabel = false, hint, error, isInvalid, size = 'medium', density = 'comfortable', isOpen, onOpenChange, 'aria-label': ariaLabel, 'aria-describedby': descriptionId, ...props }: SelectProps) {
  const isDisabled = useFieldDisabled(disabled);
  const trigger=useRef<HTMLButtonElement>(null),surface=useRef<HTMLElement>(null);
  const [surfaceMounted,setSurfaceMounted]=useState(false);
  const setSurface=useCallback((element:HTMLElement|null)=>{surface.current=element;setSurfaceMounted(Boolean(element));},[]);
  const restoreOnExit=useRef(false);
  const [internalOpen,setInternalOpen]=useState(false);
  const open=isOpen??internalOpen;
  const ignoreScrollClose=useAnchorScrollGuard(open,trigger);
  const position=useOverlayPosition({targetRef:trigger,overlayRef:surface,isOpen:open||surfaceMounted,placement:'bottom start',offset:6,maxHeight:312,onClose:null});
  useEffect(()=>{
    if(!open&&!surfaceMounted)return;let frame=0,previous='';
    // An ancestor can move during a height/grid transition without resizing
    // the trigger. Follow its actual rectangle through the public position hook.
    // Keep following during exit: the surface is painted until it unmounts.
    function follow(){const rect=trigger.current?.getBoundingClientRect();if(rect){const next=[rect.x,rect.y,rect.width,rect.height].join(':');if(next!==previous){previous=next;position.updatePosition();}}frame=requestAnimationFrame(follow);}
    frame=requestAnimationFrame(follow);return()=>cancelAnimationFrame(frame);
  },[open,surfaceMounted,position.updatePosition]);
  function changeOpen(open:boolean){
    if(!open&&ignoreScrollClose())return;
    if(isOpen===undefined)setInternalOpen(open);
    restoreOnExit.current=!open&&!!surface.current?.contains(document.activeElement);
    onOpenChange?.(open);
  }
  return <AriaSelect {...props} name={name} selectedKey={selectedKey} defaultSelectedKey={defaultSelectedKey} onSelectionChange={key => onSelectionChange?.(key == null ? null : String(key))} isDisabled={isDisabled} isInvalid={error ? true : isInvalid} isOpen={open} onOpenChange={changeOpen} aria-describedby={descriptionId} aria-label={ariaLabel ?? (label ? undefined : placeholder)} data-size={size} className={cx('ui-select', className)}>
    <DisabledSelectCloser isDisabled={isDisabled}/>
    {label && <Label className={cx('ui-select__label',hideLabel && 'sr-only')}>{label}{props.isRequired && <span aria-hidden>*</span>}</Label>}
    <SelectTrigger trigger={trigger} className={cx('ui-select__trigger', triggerClassName)}><SelectValue<SelectOption>>{({ selectedItem, selectedText }) => <span className="ui-select__value">{selectedItem?.leading}<span>{selectedText || placeholder}</span></span>}</SelectValue>{!hideIndicator && <RiArrowDownSLine size={16} aria-hidden />}</SelectTrigger>
    <Popover isNonModal style={position.overlayProps.style} ref={setSurface} data-density={density} className={cx('ui-select__popover', popoverClassName)} placement="bottom start" offset={6} maxHeight={312}>{({isExiting})=><SelectExitFocus isExiting={isExiting} trigger={trigger} surface={surface} restore={restoreOnExit}><div className="ui-select__surface" inert={isExiting || Boolean(isDisabled)}><ScrollArea indicatorPlacement="gutter" label={`${label ?? ariaLabel ?? 'Select'} options`} className="ui-select__scroll" renderViewport={({ref,className:viewportClassName})=><ListBox ref={ref} className={cx('ui-select__list',viewportClassName)} items={options}>{item => <ListBoxItem id={item.id} textValue={item.label} isDisabled={item.isDisabled} className="ui-select__option"><span><strong>{item.leading && <span className="ui-select__leading">{item.leading}</span>}{item.label}</strong>{item.detail && <small>{item.detail}</small>}</span><RiCheckLine size={16} aria-hidden /></ListBoxItem>}</ListBox>}/></div></SelectExitFocus>}</Popover>
    <FieldFeedback hint={hint} error={error}/>
  </AriaSelect>;
}
