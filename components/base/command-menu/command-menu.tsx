'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Autocomplete, Collection, FieldInputContext, Header, Menu, MenuItem, MenuSection, Text, useFilter, useSlottedContext, type Key } from 'react-aria-components';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import { Kbd } from '@/components/base/kbd/kbd';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { SearchField, type SearchFieldProps } from '@/components/base/search-field/search-field';
import { cx } from '@/utils/cx';

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  group?: string;
  keywords?: string[];
  leading?: ReactNode;
  trailing?: ReactNode;
  /** A visual hint; register shortcuts in the consuming application. */
  shortcut?: string[];
  isDisabled?: boolean;
  onAction?: () => void;
};

export type CommandMenuProps = {
  items: CommandItem[];
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onAction?: (item: CommandItem) => void;
  density?: 'normal' | 'compact';
  height?: number | string;
  autoFocus?: boolean;
  isLoading?: boolean;
  footer?: ReactNode;
  emptyTitle?: string;
  className?: string;
};

export function CommandNavigationHint({ dismiss = false }: { dismiss?: boolean }) {
  return <div className="ui-command-menu__hint"><span><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span><span><Kbd>↵</Kbd> Run</span>{dismiss && <span><Kbd>Esc</Kbd> Close</span>}</div>;
}

function CommandSearch(props: SearchFieldProps) {
  const context = useSlottedContext(FieldInputContext);
  const navigation = useRef<(() => void)[]>([]);
  const frame = useRef<number | null>(null);
  function cancelNavigation() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    navigation.current = [];
  }
  function flushNavigation() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const pending = navigation.current;
    navigation.current = [];
    if (pending.length) flushSync(() => { for (const navigate of pending) navigate(); });
  }
  useEffect(() => cancelNavigation, []);
  return <FieldInputContext.Provider value={{ ...context, onBlur(event) {
    cancelNavigation();
    context?.onBlur?.(event);
  }, onChange(value) {
    flushNavigation();
    context?.onChange?.(value);
  }, onKeyDown(event) {
    // Apply every navigation key, committing virtual focus once per frame.
    // Flush before Enter so actions use the last requested item, even when a
    // key burst finishes before the next frame. Never retain a key after blur.
    const navigationKey = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key);
    const selectingText = event.shiftKey && (event.key === 'Home' || event.key === 'End') && !context?.['aria-activedescendant'];
    if (navigationKey && !selectingText && !event.nativeEvent.isComposing) {
      event.preventDefault();
      navigation.current.push(() => context?.onKeyDown?.(event));
      if (frame.current === null) frame.current = requestAnimationFrame(flushNavigation);
    } else {
      flushNavigation();
      context?.onKeyDown?.(event);
    }
  } }}><SearchField {...props} onClear={() => {
    cancelNavigation();
    context?.onChange?.('');
    props.onClear?.();
  }}/></FieldInputContext.Provider>;
}

/** Searchable actions with virtual focus: the input keeps focus during arrow navigation. */
export function CommandMenu({ items, label = 'Commands', placeholder = 'Search commands…', value, defaultValue = '', onValueChange, onAction, density = 'normal', height = 360, autoFocus = false, isLoading = false, footer, emptyTitle = 'No commands match', className }: CommandMenuProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const query = value ?? internalValue;
  const { contains } = useFilter({ sensitivity: 'base' });
  const groups = useMemo(() => {
    const grouped = new Map<string, CommandItem[]>();
    for (const item of items) {
      const group = item.group ?? '';
      grouped.set(group, [...(grouped.get(group) ?? []), item]);
    }
    return Array.from(grouped, ([label, items]) => ({ id: `group:${label}`, label, items }));
  }, [items]);

  function change(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }
  function run(id: Key) {
    const item = items.find(item => item.id === id);
    if (!item || item.isDisabled || isLoading) return;
    item.onAction?.();
    onAction?.(item);
  }

  return <div className={cx('ui-command-menu', className)} aria-busy={isLoading || undefined} data-density={density} style={{ '--command-height': typeof height === 'number' ? `${height}px` : height } as CSSProperties}>
    <Autocomplete inputValue={query} onInputChange={change} filter={(text, search) => contains(text, search.trim())}>
      <div className="ui-command-menu__search"><CommandSearch label={`Search ${label.toLowerCase()}`} hideLabel placeholder={placeholder} value={query} autoFocus={autoFocus} isLoading={isLoading} variant="soft"/></div>
      <ScrollArea label={label} className="ui-command-menu__scroll" renderViewport={({ ref, className, children }) => <Menu ref={ref} className={cx('ui-command-menu__list', className)} aria-label={label} aria-busy={isLoading || undefined} onAction={run} disabledKeys={isLoading ? items.map(item => item.id) : undefined} renderEmptyState={() => <div className="ui-command-menu__empty" role="status"><EmptyState size="small" title={isLoading ? 'Finding commands…' : emptyTitle} description={isLoading ? 'Results will appear here.' : query ? 'Try another search or clear the field.' : 'Commands will appear when available.'}/></div>}>{children}</Menu>}>
        <Collection items={groups}>{group => <MenuSection id={group.id} className="ui-command-menu__group" aria-label={group.label || label}>
          {group.label && <Header className="ui-command-menu__group-title">{group.label}</Header>}
          <Collection items={group.items}>{item => <MenuItem id={item.id} textValue={[item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).join(' ')} aria-label={item.label} isDisabled={item.isDisabled} className="ui-command-menu__item">
            {item.leading && <span className="ui-command-menu__leading" aria-hidden>{item.leading}</span>}
            <span className="ui-command-menu__text"><Text slot="label" className="ui-command-menu__label">{item.label}</Text>{item.description && <Text slot="description" className="ui-command-menu__description">{item.description}</Text>}</span>
            {(item.trailing || item.shortcut?.length) && <span className="ui-command-menu__trailing" aria-hidden>{item.trailing}{item.shortcut?.map((key, index) => <Kbd key={`${index}:${key}`}>{key}</Kbd>)}</span>}
          </MenuItem>}</Collection>
        </MenuSection>}</Collection>
      </ScrollArea>
    </Autocomplete>
    <footer className="ui-command-menu__footer">{footer ?? <CommandNavigationHint/>}</footer>
  </div>;
}
