'use client';

import { useId, type ReactNode } from 'react';
import { Dialog as AriaDialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { CloseButton } from '@/components/base/buttons/close-button';
import { cx } from '@/utils/cx';

type DialogContent = ReactNode | ((options: { close: () => void }) => ReactNode);
export type DialogProps = {
  title: string;
  description?: string;
  children: DialogContent;
  footer?: DialogContent;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'small' | 'medium' | 'large' | 'wide';
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  showCloseButton?: boolean;
  headerActions?:ReactNode;
  role?: 'dialog' | 'alertdialog';
  className?: string;
};

export type OverlaySurfaceProps = DialogProps & { presentation?: 'dialog' | 'drawer'; side?: 'start' | 'end' | 'bottom' };

/** Shared modal behavior for dialogs and drawers: focus, dismissal and scroll. */
export function OverlaySurface({ title, description, children, footer, isOpen, defaultOpen, onOpenChange, size = 'medium', isDismissable = true, isKeyboardDismissDisabled = false, showCloseButton = true, headerActions, role = 'dialog', className, presentation = 'dialog', side = 'end' }: OverlaySurfaceProps) {
  const descriptionId = useId();
  return <ModalOverlay isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} isDismissable={isDismissable} isKeyboardDismissDisabled={isKeyboardDismissDisabled} className="ui-modal-overlay" data-presentation={presentation} data-side={side}>
    <Modal className={cx('ui-modal-surface', className)} data-size={size} data-presentation={presentation} data-side={side}>
      {({ isExiting }) => <AriaDialog inert={isExiting} role={role} aria-describedby={description ? descriptionId : undefined} className="ui-dialog">
        {({ close }) => <>
          <header className="ui-dialog__header"><div><Heading slot="title" className="ui-dialog__title">{title}</Heading>{description && <p id={descriptionId} className="ui-dialog__description">{description}</p>}</div>{headerActions&&<div className="ui-dialog__header-actions">{headerActions}</div>}{showCloseButton && <CloseButton size="xs" aria-label={`Close ${title}`} onClick={close}/>}</header>
          <div className="ui-dialog__body"><AnimatedHeight><div className="ui-dialog__body-content">{typeof children === 'function' ? children({ close }) : children}</div></AnimatedHeight></div>
          {footer && <footer className="ui-dialog__footer">{typeof footer === 'function' ? footer({ close }) : footer}</footer>}
        </>}
      </AriaDialog>}
    </Modal>
  </ModalOverlay>;
}

export function Dialog(props: DialogProps) { return <OverlaySurface {...props}/>; }
