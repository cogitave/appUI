'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type AriaRole, type ReactNode, type Ref, type RefObject } from 'react';
import { Button as AriaButton, Collection, Header, Menu as AriaMenu, MenuContext, MenuItem as AriaMenuItem, MenuSection as AriaMenuSection, MenuTrigger, Popover, PopoverContext, RootMenuTriggerStateContext, Separator, SubmenuTrigger, Text, useSlottedContext } from 'react-aria-components';
import type { ButtonProps as AriaButtonProps, MenuProps, MenuItemProps, MenuSectionProps, MenuTriggerProps, PopoverProps, SubmenuTriggerProps } from 'react-aria-components';
import { RiArrowRightSLine, RiCheckLine } from '@remixicon/react';
import { buttonClassNames, type ButtonSize, type ButtonVariant } from '@/components/base/buttons/button';
import { Kbd } from '@/components/base/kbd/kbd';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

const MenuExitContext = createContext(false);
const MenuCloseGuardContext = createContext<RefObject<(() => boolean) | null> | null>(null);
const MenuRestoreFocusContext = createContext<RefObject<(() => void) | null> | null>(null);
const MenuSurfacesContext = createContext<Set<HTMLElement> | null>(null);
export type ActionMenuDensity = 'comfortable' | 'compact';
export type ActionMenuRootProps = MenuTriggerProps & { density?: ActionMenuDensity };
const MenuDensityContext = createContext<ActionMenuDensity>('comfortable');

/** A keyboard accessible action menu. ContextMenu and Menubar share this collection. */
export function ActionMenuRoot({isOpen, defaultOpen = false, onOpenChange, density = 'comfortable', ...props}: ActionMenuRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const guard = useRef<(() => boolean) | null>(null);
  const restore = useRef<(() => void) | null>(null);
  const closing = useRef(false);
  const surfaces = useRef(new Set<HTMLElement>());
  return <MenuDensityContext.Provider value={density}><MenuSurfacesContext.Provider value={surfaces.current}><MenuCloseGuardContext.Provider value={guard}><MenuRestoreFocusContext.Provider value={restore}><MenuTrigger {...props} isOpen={isOpen ?? internalOpen} onOpenChange={next => {
    if (!next && guard.current?.()) return;
    if (!next && closing.current) return;
    closing.current = !next;
    try {
      if (!next) restore.current?.();
      if (isOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    } finally { closing.current = false; }
  }}/></MenuRestoreFocusContext.Provider></MenuCloseGuardContext.Provider></MenuSurfacesContext.Provider></MenuDensityContext.Provider>;
}

export type ActionMenuTriggerProps = Omit<AriaButtonProps, 'className' | 'children'> & {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ref?: Ref<HTMLButtonElement>;
  role?: AriaRole;
};

export function ActionMenuTrigger({children, className, variant = 'secondary', size = 'medium', onPressStart, role, render, ...props}: ActionMenuTriggerProps) {
  const state = useContext(RootMenuTriggerStateContext);
  const closeOnPointer = useRef(false);
  return <AriaButton {...props} onPressStart={event => {
    onPressStart?.(event);
    // MenuTrigger opens on pointer down. A repeated pointer activation should
    // close it; touch and keyboard already toggle through its public handlers.
    if (closeOnPointer.current && (event.pointerType === 'mouse' || event.pointerType === 'pen')) state?.close();
  }} render={(domProps, renderProps) => {
    const triggerProps = {...domProps, role, onPointerDownCapture: (event: React.PointerEvent<HTMLButtonElement>) => {
      domProps.onPointerDownCapture?.(event);
      closeOnPointer.current = event.currentTarget.getAttribute('aria-expanded') === 'true';
    }};
    return render ? render(triggerProps, renderProps) : <button {...triggerProps}/>;
  }} data-variant={variant} data-size={size} className={buttonClassNames(size, false, cx('ui-action-menu-trigger', className))}>{children}</AriaButton>;
}

export type ActionMenuPopoverProps = Omit<PopoverProps, 'children' | 'className'> & {
  children: ReactNode;
  className?: string;
  density?: ActionMenuDensity;
  width?: 'normal' | 'wide';
};

export function ActionMenuPopover({children, className, density: densityOverride, width = 'normal', offset = 6, isNonModal = true, ...props}: ActionMenuPopoverProps) {
  const inheritedDensity = useContext(MenuDensityContext);
  const density = densityOverride ?? inheritedDensity;
  const guard = useContext(MenuCloseGuardContext);
  const restore = useContext(MenuRestoreFocusContext);
  const state = useContext(RootMenuTriggerStateContext);
  const surfaces = useContext(MenuSurfacesContext);
  const anchor = useSlottedContext(PopoverContext);
  const constrainedSubmenu = useMediaQuery(`(max-width: ${2 * (width === 'wide' ? 320 : 256) + 36}px)`);
  const placement = props.placement ?? (anchor?.trigger === 'SubmenuTrigger' && constrainedSubmenu ? 'bottom start' : undefined);
  const popover = useRef<HTMLElement>(null);
  const setPopover = useCallback((element: HTMLElement | null) => {
    if (popover.current) surfaces?.delete(popover.current);
    popover.current = element;
    if (element) surfaces?.add(element);
  }, [surfaces]);
  useLayoutEffect(() => {
    const trigger = anchor?.triggerRef?.current;
    if (!restore || !trigger || !state?.isOpen || anchor?.trigger === 'SubmenuTrigger') return;
    const restoreFromMenu = () => {
      if ([...(surfaces ?? [])].some(surface => surface.contains(document.activeElement)) && trigger instanceof HTMLElement) trigger.focus({preventScroll: true});
    };
    restore.current = restoreFromMenu;
    return () => { if (restore.current === restoreFromMenu) restore.current = null; };
  }, [anchor?.trigger, anchor?.triggerRef, restore, state?.isOpen, surfaces]);
  useLayoutEffect(() => {
    const trigger = anchor?.triggerRef?.current;
    if (!state?.isOpen || !isNonModal || !trigger || anchor?.trigger === 'SubmenuTrigger') return;
    function dismissOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || trigger!.contains(target) || [...(surfaces ?? [])].some(surface => surface.contains(target))) return;
      if (target instanceof Element && props.shouldCloseOnInteractOutside?.(target) === false) return;
      state!.close();
    }
    document.addEventListener('pointerdown', dismissOutside, true);
    return () => document.removeEventListener('pointerdown', dismissOutside, true);
  }, [anchor?.trigger, anchor?.triggerRef, isNonModal, props.shouldCloseOnInteractOutside, state, surfaces]);
  useLayoutEffect(() => {
    const trigger = anchor?.triggerRef?.current;
    if (!guard || !trigger || !state?.isOpen || !isNonModal || anchor?.trigger === 'SubmenuTrigger') return;
    const openedAt = trigger.getBoundingClientRect();
    let unchangedScroll = false;
    let scrollEvent: Event | null = null;
    const ignoreClose = () => unchangedScroll && scrollEvent !== null && scrollEvent.eventPhase !== Event.NONE;
    guard.current = ignoreClose;
    function onScroll(event: Event) {
      if (event.target instanceof Node && !event.target.contains(trigger ?? null)) return;
      const now = trigger!.getBoundingClientRect();
      // A scroll queued before the opening may arrive after it. Only suppress
      // that event's close when the anchor has not actually moved. Real scrolling
      // and every other dismissal remain immediate, with no timer or key delay.
      unchangedScroll = Math.abs(now.x - openedAt.x) < .5 && Math.abs(now.y - openedAt.y) < .5;
      scrollEvent = event;
    }
    window.addEventListener('scroll', onScroll, true);
    return () => { window.removeEventListener('scroll', onScroll, true); if (guard.current === ignoreClose) guard.current = null; };
  }, [anchor?.trigger, anchor?.triggerRef, guard, isNonModal, state?.isOpen]);
  return <Popover {...props} placement={placement} ref={setPopover} isNonModal={isNonModal} offset={offset} data-density={density} data-width={width} className={cx('ui-action-menu-popover', className)}>{({isExiting}) => <MenuDensityContext.Provider value={density}><MenuExitContext.Provider value={isExiting}><div inert={isExiting} className="ui-action-menu-popover__content">{children}</div></MenuExitContext.Provider></MenuDensityContext.Provider>}</Popover>;
}

export type ActionMenuProps<T extends object = object> = Omit<MenuProps<T>, 'className'> & { className?: string; scrollLabel?: string };

export function ActionMenu<T extends object>({className, children, scrollLabel = 'Menu', ...props}: ActionMenuProps<T>) {
  const isExiting = useContext(MenuExitContext);
  const state = useContext(RootMenuTriggerStateContext);
  const contextualProps = useSlottedContext(MenuContext, props.slot);
  const autoFocus = props.autoFocus ?? contextualProps?.autoFocus;
  const viewport = useRef<HTMLDivElement>(null);
  const [mountedMenu, setMountedMenu] = useState<HTMLDivElement | null>(null);
  const scrollViewport = useRef<Ref<HTMLDivElement>>(null);
  const setViewport = useCallback((element: HTMLDivElement | null) => {
    viewport.current = element;
    const ref = scrollViewport.current;
    if (typeof ref === 'function') ref(element); else if (ref) ref.current = element;
    setMountedMenu(element);
  }, []);
  useEffect(() => {
    if (isExiting || !state?.isOpen || !autoFocus) return;
    function focusOnOpening() {
      const menu = viewport.current;
      if (!menu || (menu.contains(document.activeElement) && (document.activeElement !== menu || autoFocus === true))) return;
      const items = [...menu.querySelectorAll<HTMLElement>('.ui-action-menu-item:not([data-disabled])')];
      const target = autoFocus === 'last' ? items.at(-1) : autoFocus === 'first' ? items[0] : menu;
      (target ?? menu).focus({preventScroll: true});
    }
    // Let the overlay initialize its focus scope before moving focus. An
    // outgoing sibling scope can finish in this frame; restore only lost focus
    // and never overwrite navigation already performed inside the new menu.
    focusOnOpening();
    const frame = requestAnimationFrame(focusOnOpening);
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, isExiting, state?.isOpen, mountedMenu]);
  return <ScrollArea label={scrollLabel} className="ui-action-menu-scroll" renderViewport={({ref, className: viewportClassName, children: content}) => {
    scrollViewport.current = ref;
    return <AriaMenu {...props} ref={setViewport} inert={isExiting} className={cx('ui-action-menu', viewportClassName, className)}>{content as MenuProps<T>['children']}</AriaMenu>;
  }}>{children as ReactNode}</ScrollArea>;
}

export type ActionMenuItemProps<T extends object = object> = Omit<MenuItemProps<T>, 'className' | 'children'> & {
  children: ReactNode;
  className?: string;
  icon?: IconComponent;
  shortcut?: ReactNode;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function ActionMenuItem<T extends object>({children, className, icon: Icon, shortcut, description, variant = 'default', ...props}: ActionMenuItemProps<T>) {
  return <AriaMenuItem {...props} textValue={props.textValue ?? (typeof children === 'string' ? children : undefined)} data-variant={variant} className={cx('ui-action-menu-item', className)}>{({isSelected, hasSubmenu, selectionMode}) => <>
    {selectionMode !== 'none' && <span className="ui-action-menu-item__selection" data-selected={isSelected || undefined} aria-hidden><RiCheckLine/></span>}
    {Icon && <Icon className="ui-action-menu-item__icon" aria-hidden/>}
    <span className="ui-action-menu-item__text"><Text slot="label" className="ui-action-menu-item__label">{children}</Text>{description && <Text slot="description" className="ui-action-menu-item__description">{description}</Text>}</span>
    {shortcut && <Kbd className="ui-action-menu-item__shortcut" aria-hidden>{shortcut}</Kbd>}
    {hasSubmenu && <RiArrowRightSLine className="ui-action-menu-item__chevron" aria-hidden/>}
  </>}</AriaMenuItem>;
}

export type ActionMenuSectionProps<T extends object = object> = MenuSectionProps<T> & { label?: string };
export function ActionMenuSection<T extends object>({label, children, className, items, ...props}: ActionMenuSectionProps<T>) {
  return <AriaMenuSection {...props} className={cx('ui-action-menu-section', className)}>{label && <Header className="ui-action-menu-section__label">{label}</Header>}<Collection items={items}>{children}</Collection></AriaMenuSection>;
}

export function ActionMenuSeparator() { return <Separator className="ui-action-menu-separator"/>; }
export function ActionSubmenu(props: SubmenuTriggerProps) { return <SubmenuTrigger {...props}/>; }
