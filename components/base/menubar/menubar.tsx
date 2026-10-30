'use client';

import { useContext, useLayoutEffect, useRef, useState, type ContextType, type ReactNode } from 'react';
import { RootMenuTriggerStateContext } from 'react-aria-components';
import { ActionMenuPopover, ActionMenuRoot, ActionMenuTrigger } from '@/components/base/action-menu/action-menu';
import { cx } from '@/utils/cx';

export type MenubarEntry = { id: string; label: string; children: ReactNode; isDisabled?: boolean };
export type MenubarProps = {
  items: MenubarEntry[];
  'aria-label': string;
  openId?: string | null;
  defaultOpenId?: string | null;
  onOpenChange?: (id: string | null) => void;
  density?: 'comfortable' | 'compact';
  variant?: 'bordered' | 'plain';
  className?: string;
};
type MenuState = NonNullable<ContextType<typeof RootMenuTriggerStateContext>>;
type Controller = { state: MenuState; trigger: HTMLButtonElement | null };

/** Application commands with roving focus, logical arrows and shared action menus. */
export function Menubar({items, 'aria-label': label, openId, defaultOpenId = null, onOpenChange, density = 'comfortable', variant = 'bordered', className}: MenubarProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpenId);
  const [focusedId, setFocusedId] = useState(items.find(item => !item.isDisabled)?.id);
  const requested = openId === undefined ? internalOpen : openId;
  const active = items.some(item => item.id === requested && !item.isDisabled) ? requested : null;
  const desired = useRef(active);
  desired.current = active;
  const controllers = useRef(new Map<string, Controller>());
  const bar = useRef<HTMLDivElement>(null);
  const focusId = items.some(item => item.id === focusedId && !item.isDisabled) ? focusedId : items.find(item => !item.isDisabled)?.id;

  function change(id: string, isOpen: boolean) {
    // An outgoing menu may report its close after the next menu opens.
    if (!isOpen && desired.current !== id) return;
    const next = isOpen ? id : null;
    desired.current = next;
    if (openId === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }
  function move(id: string, direction: number | 'first' | 'last', open: boolean) {
    const available = items.filter(item => !item.isDisabled);
    if (!available.length) return;
    const current = available.findIndex(item => item.id === id);
    const index = direction === 'first' ? 0 : direction === 'last' ? available.length - 1 : (current + direction + available.length) % available.length;
    const next = available[index];
    setFocusedId(next.id);
    const controller = controllers.current.get(next.id);
    controller?.trigger?.focus({preventScroll: true});
    if (open) controller?.state.open('first');
  }
  return <div ref={bar} role="menubar" aria-label={label} data-density={density} data-variant={variant} className={cx('ui-menubar', className)}>
    {items.map(item => <ActionMenuRoot key={item.id} isOpen={active === item.id} onOpenChange={value => change(item.id, value)}>
      <MenubarItem item={item} active={active !== null} focusable={focusId === item.id} density={density} register={controller => { if (controller) controllers.current.set(item.id, controller); else controllers.current.delete(item.id); }} onFocus={()=>setFocusedId(item.id)} onHover={()=>{if(active !== null && active !== item.id) change(item.id,true);}} onMove={(direction, open)=>move(item.id,direction,open)} direction={()=>bar.current ? getComputedStyle(bar.current).direction : 'ltr'}/>
    </ActionMenuRoot>)}
  </div>;
}

function MenubarItem({item, active, focusable, density, register, onFocus, onHover, onMove, direction}: {item: MenubarEntry; active: boolean; focusable: boolean; density: MenubarProps['density']; register: (controller: Controller | null) => void; onFocus: () => void; onHover: () => void; onMove: (direction: number | 'first' | 'last', open: boolean) => void; direction: () => string}) {
  const state = useContext(RootMenuTriggerStateContext)!;
  const trigger = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => { register({state, trigger: trigger.current}); return ()=>register(null); }, [state, register]);
  function horizontal(key: string) { return key === 'ArrowRight' ? direction() === 'rtl' ? -1 : 1 : direction() === 'rtl' ? 1 : -1; }
  return <>
    <ActionMenuTrigger ref={trigger} role="menuitem" variant="ghost" className="ui-menubar-trigger" isDisabled={item.isDisabled} excludeFromTabOrder={!focusable} onFocus={onFocus} onHoverStart={onHover} onKeyDown={event=>{
      if (event.defaultPrevented) return;
      if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
        event.preventDefault();
        onMove(event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : horizontal(event.key), active);
      }
    }}>{item.label}</ActionMenuTrigger>
    <ActionMenuPopover density={density}>
      <div className="ui-menubar-content" onKeyDownCapture={event=>{
        if (event.key === 'Escape' && state.expandedKeysStack.length === 0) {
          event.preventDefault(); event.stopPropagation(); state.close(); trigger.current?.focus({preventScroll: true}); return;
        }
        if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        const forward = event.key === (direction() === 'rtl'?'ArrowLeft':'ArrowRight');
        const target = (event.target as Element).closest('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
        if (!target || (forward && target.hasAttribute('data-has-submenu')) || (!forward && state.expandedKeysStack.length > 0)) return;
        event.preventDefault();event.stopPropagation();onMove(horizontal(event.key),true);
      }}>{item.children}</div>
    </ActionMenuPopover>
  </>;
}

export { ActionMenu, ActionMenuItem, ActionMenuSection, ActionMenuSeparator, ActionSubmenu } from '@/components/base/action-menu/action-menu';
