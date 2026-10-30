'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { RiAddLine } from '@remixicon/react';
import { Tabs, TabList, Tab, TabPanel } from '@/components/base/tabs/tabs';
import { CloseButton } from '@/components/base/buttons/close-button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type WorkspaceTab = { id:string; title:string; icon?:IconComponent; leading?:ReactNode; isDirty?:boolean; isDisabled?:boolean; isClosable?:boolean };
export type WorkspaceTabsProps = {
  items:WorkspaceTab[];
  label?:string;
  selectedId?:string|null;
  defaultSelectedId?:string;
  onSelectionChange?:(id:string)=>void;
  /** The application owns removal and any unsaved-change confirmation. */
  onClose?:(id:string)=>void;
  onNewTab?:()=>void;
  newTabLabel?:string;
  renderPanel:(tab:WorkspaceTab)=>ReactNode;
  empty?:ReactNode;
  variant?:'card'|'line'|'soft';
  density?:'comfortable'|'compact';
  keyboardActivation?:'automatic'|'manual';
  /** Shared top bar actions and persistent side/content surfaces. */
  toolbarLeading?:ReactNode;
  toolbarTrailing?:ReactNode;
  footer?:ReactNode;
  className?:string;
};

/** Accessible application tabs composed from the same Tabs used throughout appUI. */
export function WorkspaceTabs({items,label='Open work',selectedId,defaultSelectedId,onSelectionChange,onClose,onNewTab,newTabLabel='New tab',renderPanel,empty,variant='card',density='comfortable',keyboardActivation='automatic',toolbarLeading,toolbarTrailing,footer,className}:WorkspaceTabsProps) {
  const [internal,setInternal]=useState(defaultSelectedId??items.find(item=>!item.isDisabled)?.id??null);
  const requested=selectedId===undefined?internal:selectedId;
  const root=useRef<HTMLDivElement>(null),previousItems=useRef(items);
  const interaction=useRef(0);
  const pendingClose=useRef<{id:string;next:string|null;owned:boolean;activate:boolean;selected:string|null;interaction:number}|null>(null);
  const available=items.filter(item=>!item.isDisabled);
  const previousIndex=previousItems.current.filter(item=>!item.isDisabled).findIndex(item=>item.id===requested);
  const closed=pendingClose.current;
  const desired=closed?.activate&&closed.selected===requested&&!items.some(item=>item.id===closed.id)?closed.next:requested;
  const active=available.find(item=>item.id===desired)?.id??available[Math.max(0,Math.min(previousIndex,available.length-1))]?.id??null;
  function select(id:string){if(selectedId===undefined)setInternal(id);onSelectionChange?.(id);}
  function close(item:WorkspaceTab,focusAdjacent=false) {
    if(!onClose||item.isDisabled||item.isClosable===false)return;
    const target=document.activeElement;
    const owned=target instanceof Element&&target.closest('[data-workspace-tab]')?.getAttribute('data-workspace-tab')===item.id;
    const remaining=available.filter(tab=>tab.id!==item.id);
    const next=item.id===active||focusAdjacent?remaining[Math.min(available.findIndex(tab=>tab.id===item.id),remaining.length-1)]?.id:active;
    pendingClose.current={id:item.id,next:next??null,owned,activate:focusAdjacent&&keyboardActivation==='automatic',selected:active,interaction:interaction.current};
    onClose(item.id);
  }
  useLayoutEffect(()=>{
    previousItems.current=items;
    if(active&&active!==requested)select(active);
  },[items,active,requested]);
  useEffect(()=>{
    const request=pendingClose.current;
    if(!request||items.some(item=>item.id===request.id))return;
    if(!request.owned){pendingClose.current=null;return;}
    const focusTargetId=request.next;
    const focusInteraction=request.interaction;
    let frame=0;
    function restore(){
      if(pendingClose.current!==request)return;
      if(interaction.current!==focusInteraction){pendingClose.current=null;return;}
      // A confirmation dialog releases its focus scope at the end of its exit.
      const overlay=document.querySelector('.ui-modal-overlay');
      if(overlay){if(overlay.hasAttribute('data-exiting'))frame=requestAnimationFrame(restore);else pendingClose.current=null;return;}
      pendingClose.current=null;
      const focused=document.activeElement;
      if(focused!==document.body&&focused instanceof HTMLElement&&focused.isConnected&&!root.current?.contains(focused))return;
      const focusId=items.some(item=>item.id===focusTargetId&&!item.isDisabled)?focusTargetId:active;
      const target=focusId?root.current?.querySelector<HTMLElement>(`[role="tab"][data-key="${CSS.escape(focusId)}"]`):root.current?.querySelector<HTMLButtonElement>('.ui-workspace-tabs__new');
      target?.focus({preventScroll:true});
    }
    frame=requestAnimationFrame(restore);
    return()=>cancelAnimationFrame(frame);
  },[items,active]);
  return <Tabs ref={root} selectedKey={active} onSelectionChange={key=>select(String(key))} keyboardActivation={keyboardActivation} className={cx('ui-workspace-tabs',className)} data-appearance={variant} data-density={density}>
    <div className="ui-workspace-tabs__toolbar" onKeyDownCapture={()=>{interaction.current+=1;}} onPointerDownCapture={()=>{interaction.current+=1;}}>
      {toolbarLeading}
      <ScrollArea label={label} orientation="horizontal" className="ui-workspace-tabs__scroll" renderViewport={({ref,className})=><TabList ref={ref} aria-label={label} className={cx(className,'ui-workspace-tabs__list')} items={items}>{item=>{
        const Icon=item.icon,closable=Boolean(onClose&&item.isClosable!==false&&!item.isDisabled);
        return <Tab id={item.id} isDisabled={item.isDisabled} className="ui-workspace-tabs__tab" aria-label={`${item.title}${item.isDirty?' (unsaved changes)':''}`} render={(domProps,state)=><div className="ui-workspace-tabs__entry" data-workspace-tab={item.id} data-selected={state.isSelected||undefined} data-disabled={state.isDisabled||undefined} onKeyDownCapture={event=>{if(event.key==='Delete'&&closable&&(event.target as Element).closest('[role="tab"]')){event.preventDefault();event.stopPropagation();close(item,true);}}}>
          {'href' in domProps?<a {...domProps}/>:<div {...domProps}/>}{closable&&<CloseButton className="ui-workspace-tabs__close" size="xs" aria-label={`Close ${item.title}`} tabIndex={state.isSelected?0:-1} onClick={()=>close(item)}/>}
        </div>}>
          {item.leading?<span className="ui-workspace-tabs__leading">{item.leading}</span>:Icon&&<Icon aria-hidden/>}<span className="ui-workspace-tabs__title">{item.title}</span>{item.isDirty&&<span className="ui-workspace-tabs__dirty" aria-hidden/>}
        </Tab>;
      }}</TabList>}/>
      {onNewTab&&<Tooltip content={newTabLabel}><IconButton className="ui-workspace-tabs__new" icon={RiAddLine} variant="ghost" size="small" aria-label={newTabLabel} onClick={onNewTab}/></Tooltip>}
      {toolbarTrailing}
    </div>
    <div className="ui-workspace-tabs__body">
      <div className="ui-workspace-tabs__content">
    <div className="ui-workspace-tabs__panels" onKeyDownCapture={()=>{interaction.current+=1;}} onPointerDownCapture={()=>{interaction.current+=1;}}>
      {items.map(item=><TabPanel key={item.id} id={item.id} className="ui-workspace-tabs__panel">{({isExiting})=><div className="ui-workspace-tabs__panel-content" inert={isExiting} aria-hidden={isExiting||undefined}>{renderPanel(item)}</div>}</TabPanel>)}
      {!active&&<div className="ui-workspace-tabs__empty">{empty}</div>}
    </div>
      {footer}
      </div>
    </div>
  </Tabs>;
}
