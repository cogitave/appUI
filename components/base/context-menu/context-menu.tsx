'use client';

import { useContext, type ReactNode, type Ref } from 'react';
import { Button as AriaButton, RootMenuTriggerStateContext, type ButtonProps } from 'react-aria-components';
import { ActionMenuRoot, type ActionMenuRootProps } from '@/components/base/action-menu/action-menu';
import { cx } from '@/utils/cx';

export type ContextMenuProps = Omit<ActionMenuRootProps, 'trigger'>;
/** Right click, touch long press and the platform's keyboard context-menu shortcut. */
export function ContextMenu(props: ContextMenuProps) { return <ActionMenuRoot {...props} trigger="contextMenu"/>; }

export type ContextMenuTriggerProps = Omit<ButtonProps, 'className' | 'children'> & { children: ReactNode; className?: string; ref?: Ref<HTMLButtonElement> };
export function ContextMenuTrigger({className, children, onKeyDown, render, ...props}: ContextMenuTriggerProps) {
  const state = useContext(RootMenuTriggerStateContext);
  return <AriaButton {...props} className={cx('ui-context-menu-trigger', className)} onKeyDown={event => {
    onKeyDown?.(event);
    if (event.defaultPrevented || props.isDisabled || !(event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) return;
    // Some browsers do not emit the platform contextmenu event for these keys.
    // Feed the standard DOM event to MenuTrigger so its public positioning and
    // pointer behavior remain identical, then focus the first available action.
    event.preventDefault();
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2}));
    state?.open('first');
  }} render={(domProps, renderProps) => {
    const triggerProps = {...domProps, onContextMenuCapture: (event: React.MouseEvent<HTMLButtonElement>) => {
      domProps.onContextMenuCapture?.(event);
      if (props.isDisabled) { event.stopPropagation(); return; }
      event.currentTarget.focus({preventScroll: true});
    }};
    return render ? render(triggerProps, renderProps) : <button {...triggerProps}/>;
  }}>{children}</AriaButton>;
}

export { ActionMenu, ActionMenuItem, ActionMenuPopover, ActionMenuSection, ActionMenuSeparator, ActionSubmenu } from '@/components/base/action-menu/action-menu';
