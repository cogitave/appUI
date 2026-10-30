'use client';

import { Dialog } from '@/components/base/dialog/dialog';
import { CommandMenu, CommandNavigationHint, type CommandMenuProps } from '@/components/base/command-menu/command-menu';
import { cx } from '@/utils/cx';

export type CommandPaletteProps = Omit<CommandMenuProps, 'height' | 'autoFocus'> & {
  title?: string;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnAction?: boolean;
  /** Keep an accessible title while starting the visible surface with search. */
  hideHeader?:boolean;
};

/** The shared command menu in the library's focus-trapped, dismissable Dialog. */
export function CommandPalette({ title = 'Command palette', isOpen, defaultOpen, onOpenChange, closeOnAction = true, hideHeader=false, className, onAction, footer, ...props }: CommandPaletteProps) {
  return <Dialog title={title} isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} showCloseButton={!hideHeader} className={cx('ui-command-palette',hideHeader&&'ui-command-palette--hide-header', className)}>
    {({ close }) => <CommandMenu {...props} autoFocus height="100%" footer={footer ?? <CommandNavigationHint dismiss/>} onAction={item => { onAction?.(item); if (closeOnAction) close(); }}/>}
  </Dialog>;
}
