'use client';

import { isValidElement, type ComponentProps, type ReactNode } from 'react';
import { Button as AriaButton, Link as AriaLink, Focusable, TooltipTrigger, Tooltip as AriaTooltip, OverlayArrow, type TooltipProps as AriaTooltipProps } from 'react-aria-components';
import { IconButton } from '@/components/base/buttons/icon-button';
import { cx } from '@/utils/cx';

export type TooltipProps = { children: ComponentProps<typeof Focusable>['children']; content: ReactNode; placement?: AriaTooltipProps['placement']; delay?: number; closeDelay?: number; showArrow?: boolean; isDisabled?: boolean; className?: string; /** Aria triggers already consume TooltipTrigger's public focus context. */ triggerType?:'auto'|'native'|'aria' };
export function Tooltip({ children, content, placement = 'top', delay = 350, closeDelay = 100, showArrow = true, isDisabled, className, triggerType='auto' }: TooltipProps) {
  const childDisabled = isValidElement<{disabled?: boolean;isDisabled?: boolean}>(children) && (children.props.disabled || children.props.isDisabled);
  const disabled = isDisabled ?? Boolean(childDisabled);
  const triggerComponent:unknown=isValidElement(children)?children.type:null;
  const ariaTrigger=triggerType==='aria'||triggerType==='auto'&&isValidElement(children)&&[IconButton,AriaButton,AriaLink].some(type=>triggerComponent===type);
  return <TooltipTrigger delay={delay} closeDelay={closeDelay} isDisabled={disabled}>{ariaTrigger?children:<Focusable isDisabled={disabled}>{children}</Focusable>}<AriaTooltip placement={placement} offset={7} className={cx('ui-tooltip', className)}>{showArrow && <OverlayArrow className="ui-tooltip__arrow"><svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M0 0 5 5 10 0" /></svg></OverlayArrow>}{content}</AriaTooltip></TooltipTrigger>;
}
