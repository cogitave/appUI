'use client';

import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Button as AriaButton, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { IconButton, type IconButtonProps } from '@/components/base/buttons/icon-button';

const DropdownContext = createContext<{ close: () => void; isOpen: boolean } | null>(null);

export interface DropdownProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children: ReactNode;
}

export function Dropdown({ isOpen, defaultOpen = false, onOpenChange, children }: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isOpen === undefined ? internalOpen : isOpen;
  function setOpen(next: boolean) {
    if (isOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }
  return <DropdownContext.Provider value={{ close: () => setOpen(false), isOpen: open }}><DialogTrigger isOpen={open} onOpenChange={setOpen}>{children}</DialogTrigger></DropdownContext.Provider>;
}

export type DropdownTriggerProps = Omit<ComponentProps<typeof AriaButton>, 'className'> & { className?: string };
export function DropdownTrigger({ className, ...props }: DropdownTriggerProps) {
  return <AriaButton {...props} className={cx('ui-dropdown-trigger', className)} />;
}

// Icon triggers use the same dimensions as every other icon button.
export function DropdownIconTrigger(props: IconButtonProps) {
  return <IconButton {...props} />;
}

export interface DropdownPopoverProps {
  'aria-label': string;
  placement?: ComponentProps<typeof Popover>['placement'];
  triggerRef?: ComponentProps<typeof Popover>['triggerRef'];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  offset?: number;
  className?: string;
  children: ReactNode;
}

export function DropdownPopover({ 'aria-label': ariaLabel, placement = 'bottom start', triggerRef, isOpen, onOpenChange, offset = 5, className, children }: DropdownPopoverProps) {
  const context = useContext(DropdownContext);
  const open = isOpen ?? context?.isOpen;
  const dialogRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    // An interrupted exit keeps the popover mounted, so its focus scope does
    // not mount again. Restore focus inside on every opening, including reopens.
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (dialog && (!dialog.contains(document.activeElement) || document.activeElement === dialog)) {
        (dialog.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled), input:not([disabled]), textarea:not([disabled])') ?? dialog).focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return <Popover placement={placement} data-align={placement.split(' ')[1] ?? 'center'} triggerRef={triggerRef} isOpen={isOpen} onOpenChange={onOpenChange} offset={offset} className={cx('ui-dropdown-popover', className)}>{({isExiting})=><div className="ui-dropdown-content" onKeyDown={event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    // Native text/range controls keep their own navigation keys.
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.ui-dropdown-item:not(:disabled), [role="menuitem"]:not(:disabled)'));
    if (!items.length) return;
    event.preventDefault();
    const active = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowDown' ? (active + 1) % items.length : (active - 1 + items.length) % items.length;
    items[next].focus();
  }}><Dialog inert={isExiting} ref={dialogRef} aria-label={ariaLabel} className="ui-dropdown-dialog"><div>{children}</div></Dialog></div>}</Popover>;
}

export function DropdownGroup({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return <div className={cx('ui-dropdown-group', className)}>{label && <span className="ui-dropdown-group__label">{label}</span>}<div className="ui-dropdown-group__items">{children}</div></div>;
}

export interface DropdownItemProps {
  selected?: boolean;
  isDisabled?: boolean;
  closeOnSelect?: boolean;
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}

export function DropdownItem({ selected, isDisabled, closeOnSelect = true, onSelect, className, children }: DropdownItemProps) {
  const context = useContext(DropdownContext);
  return <button type="button" disabled={isDisabled} aria-pressed={selected || undefined} className={cx('ui-dropdown-item', className)} onClick={() => { onSelect?.(); if (closeOnSelect) context?.close(); }}>{children}</button>;
}

export function DropdownDivider({ className }: { className?: string }) {
  return <div role="separator" aria-orientation="horizontal" className={cx('ui-dropdown-divider', className)} />;
}
