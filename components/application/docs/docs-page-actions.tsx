'use client';

import { RiArrowDownSLine, RiFileCopyLine } from '@remixicon/react';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/buttons/button-group';
import { Dropdown, DropdownGroup, DropdownItem, DropdownPopover, DropdownTrigger } from '@/components/base/dropdown/dropdown';

export function DocsPageActions({ onCopy }: { onCopy: (format: 'markdown' | 'text') => void }) {
  return <ButtonGroup className="docs-copy-page" aria-label="Copy documentation" data-docs-copy-ignore>
    <ButtonGroupItem leadingIcon={RiFileCopyLine} onClick={() => onCopy('markdown')}>Copy page</ButtonGroupItem>
    <Dropdown><DropdownTrigger aria-label="Page copy options"><RiArrowDownSLine size={16} aria-hidden /></DropdownTrigger><DropdownPopover aria-label="Copy page" placement="bottom end"><DropdownGroup><DropdownItem onSelect={() => onCopy('markdown')}>Copy as Markdown</DropdownItem><DropdownItem onSelect={() => onCopy('text')}>Copy as text</DropdownItem></DropdownGroup></DropdownPopover></Dropdown>
  </ButtonGroup>;
}
