'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Dialog, DialogTrigger, Heading, OverlayArrow, Popover as AriaPopover, Pressable, type PopoverProps as AriaPopoverProps } from 'react-aria-components';
import { CloseButton } from '@/components/base/buttons/close-button';
import { cx } from '@/utils/cx';

export type PopoverProps = {
  trigger: ComponentProps<typeof Pressable>['children'];
  title?: string;
  children: ReactNode | ((options: { close: () => void }) => ReactNode);
  placement?: AriaPopoverProps['placement'];
  showArrow?: boolean;
  showCloseButton?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  'aria-label'?: string;
};

export function Popover({ trigger, title, children, placement = 'bottom start', showArrow = false, showCloseButton = false, isOpen, defaultOpen, onOpenChange, className, 'aria-label': label }: PopoverProps) {
  return <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <Pressable>{trigger}</Pressable>
    <AriaPopover className={cx('ui-popover', className)} placement={placement} offset={showArrow ? 10 : 6}>
      {({isExiting})=><>
      {showArrow && <OverlayArrow className="ui-popover__arrow"><svg width="12" height="8" viewBox="0 0 12 8" aria-hidden><path d="M0 0 6 6 12 0"/></svg></OverlayArrow>}
      <Dialog inert={isExiting} className="ui-popover__dialog" aria-label={title ? undefined : label ?? 'Additional information'}>{({ close }) => <>
        {(title || showCloseButton) && <header className="ui-popover__header">{title && <Heading slot="title">{title}</Heading>}{showCloseButton && <CloseButton aria-label="Close popover" size="xs" onClick={close}/>}</header>}
        <div className="ui-popover__body">{typeof children === 'function' ? children({ close }) : children}</div>
      </>}</Dialog>
      </>}
    </AriaPopover>
  </DialogTrigger>;
}
