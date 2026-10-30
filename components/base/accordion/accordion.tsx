'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { cx } from '@/utils/cx';

export type AccordionItem = { id: string; title: string; description?: string; leading?: ReactNode; content: ReactNode; isDisabled?: boolean };
export type AccordionProps = {
  items: AccordionItem[];
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  allowsMultipleExpanded?: boolean;
  variant?: 'bordered' | 'separated' | 'plain';
  size?: 'medium' | 'small';
  headingLevel?: 2 | 3 | 4;
  className?: string;
  'aria-label'?: string;
};

export function Accordion({ items, expandedKeys, defaultExpandedKeys = [], onExpandedChange, allowsMultipleExpanded = false, variant = 'bordered', size = 'medium', headingLevel = 3, className, 'aria-label': label }: AccordionProps) {
  const id = useId(), root = useRef<HTMLDivElement>(null);
  const [internalKeys, setInternalKeys] = useState(defaultExpandedKeys);
  const keys = expandedKeys ?? internalKeys;
  const Heading = headingLevel === 2 ? 'h2' : headingLevel === 4 ? 'h4' : 'h3';
  function toggle(itemId: string) {
    const next = keys.includes(itemId) ? keys.filter(key => key !== itemId) : allowsMultipleExpanded ? [...keys, itemId] : [itemId];
    if (expandedKeys === undefined) setInternalKeys(next);
    onExpandedChange?.(next);
  }
  return <div ref={root} className={cx('ui-accordion', className)} data-variant={variant} data-size={size} aria-label={label} role={label ? 'group' : undefined}>
    {items.map((item, index) => {
      const open = keys.includes(item.id), triggerId = `${id}-trigger-${index}`, panelId = `${id}-panel-${index}`;
      return <div className="ui-accordion__item" key={item.id} data-open={open || undefined}>
        <Heading className="ui-accordion__heading"><button type="button" id={triggerId} aria-expanded={open} aria-controls={panelId} disabled={item.isDisabled} className="ui-accordion__trigger" onClick={() => toggle(item.id)} onKeyDown={event => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const buttons = [...root.current!.querySelectorAll<HTMLButtonElement>('.ui-accordion__trigger:not(:disabled)')];
          const current = buttons.indexOf(event.currentTarget), target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
          buttons[target]?.focus();
        }}>
          {item.leading && <span className="ui-accordion__leading" aria-hidden>{item.leading}</span>}<span className="ui-accordion__label"><strong>{item.title}</strong>{item.description && <span>{item.description}</span>}</span><RiArrowDownSLine size={18} aria-hidden/>
        </button></Heading>
        <Collapsible isOpen={open} id={panelId} role="region" aria-labelledby={triggerId}><div className="ui-accordion__body">{item.content}</div></Collapsible>
      </div>;
    })}
  </div>;
}
