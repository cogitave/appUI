'use client';

import type { ReactNode, RefObject } from 'react';
import { DropdownPopover } from '@/components/base/dropdown/dropdown';

export type ComposerMenuItem = { id: string; label: string; description?: string; icon?: ReactNode; disabled?: boolean };
export type ComposerMenuGroup = { label: string; items: ComposerMenuItem[] };

type ComposerAddMenuProps = {
  id: string;
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  groups: ComposerMenuGroup[];
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function ComposerAddMenu({ id, open, anchorRef, groups, onSelect, onClose }: ComposerAddMenuProps) {
  const firstEnabledItem = groups.flatMap(group => group.items).find(item => !item.disabled);
  return <DropdownPopover aria-label="Add to message" isOpen={open} onOpenChange={next => { if (!next) onClose(); }} triggerRef={anchorRef} placement="top start" offset={8} className="ui-composer-add-menu">
    <div id={id} role="menu" aria-label="Add to message" className="ui-composer-add-menu__groups">
      {groups.map(group => <section key={group.label} className="ui-composer-add-menu__group">
        <span className="ui-composer-add-menu__heading">{group.label}</span>
        {group.items.map(item => <button key={item.id} data-id={item.id} type="button" role="menuitem" autoFocus={item === firstEnabledItem} disabled={item.disabled} onClick={() => { onSelect(item.id); onClose(); }}>
          <span className="ui-composer-add-menu__icon" aria-hidden="true">{item.icon}</span>
          <span className="ui-composer-add-menu__text"><strong>{item.label}</strong>{item.description && <small>{item.description}</small>}</span>
        </button>)}
      </section>)}
    </div>
  </DropdownPopover>;
}
