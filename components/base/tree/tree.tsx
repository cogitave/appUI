'use client';

import { createContext, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { RiArrowRightSLine, RiCheckLine } from '@remixicon/react';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Button } from '@/components/base/buttons/button';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import { cx } from '@/utils/cx';

export {FolderIcon} from './folder-icon';

export type TreeNode = { id: string; label: string; description?: string; leading?: ReactNode | ((state:{isExpanded:boolean})=>ReactNode); trailing?: ReactNode; children?: TreeNode[]; isDisabled?: boolean; isSelectable?: boolean };
export type TreeProps = {
  items: TreeNode[];
  'aria-label': string;
  selectedKeys?: Iterable<string>;
  defaultSelectedKeys?: Iterable<string>;
  onSelectionChange?: (keys: string[]) => void;
  expandedKeys?: Iterable<string>;
  defaultExpandedKeys?: Iterable<string>;
  onExpandedChange?: (keys: string[]) => void;
  onAction?: (key: string) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  disallowEmptySelection?: boolean;
  density?: 'normal' | 'compact';
  variant?: 'soft' | 'neutral' | 'outline';
  showGuides?: boolean;
  renderEmptyState?: ReactNode;
  className?: string;
};
type Entry = { node: TreeNode; ancestors: string[]; position: number; total: number };
function indexTree(items: TreeNode[], ancestors: string[] = [], result: Entry[] = []): Entry[] {
  items.forEach((node, i) => { result.push({ node, ancestors, position: i + 1, total: items.length }); if (node.children?.length) indexTree(node.children, [...ancestors, node.id], result); });
  return result;
}
type TreeContextValue = { expanded: Set<string>; selected: Set<string>; entries: Map<string, Entry>; tabStop?: string; mode: TreeProps['selectionMode']; hierarchical: boolean; reduced: boolean; tokens:ReturnType<typeof useMotionTokens>; register: (key: string, element: HTMLDivElement | null) => void; focus: (key: string) => void; choose: (key: string, toggle?: boolean) => void; expand: (key: string) => void; action?: (key: string) => void; };
const TreeContext = createContext<TreeContextValue | null>(null);

function Branch({ node }: { node: TreeNode }) {
  const tree = useContext(TreeContext)!;
  const present = useIsPresent(), id = useId(), entry = tree.entries.get(node.id);
  const branch = node.children!==undefined, open = tree.expanded.has(node.id), selected = tree.selected.has(node.id);
  const selectable = tree.mode !== 'none' && node.isSelectable !== false;
  return <div ref={element => tree.register(node.id, element)} className="ui-tree__item" role="treeitem" data-node-key={node.id} data-disabled={node.isDisabled || undefined} data-selected={selected || undefined} data-expanded={branch && open || undefined} aria-labelledby={`${id}-label`} aria-describedby={[node.description ? `${id}-description` : '', node.trailing ? `${id}-trailing` : ''].filter(Boolean).join(' ') || undefined} aria-level={(entry?.ancestors.length ?? 0) + 1} aria-posinset={entry?.position} aria-setsize={entry?.total} aria-expanded={branch ? open : undefined} aria-selected={selectable ? selected : undefined} aria-disabled={node.isDisabled || undefined} aria-hidden={!present || undefined} inert={!present} tabIndex={present && !node.isDisabled && tree.tabStop === node.id ? 0 : -1} onFocus={event => { if (event.target === event.currentTarget) tree.focus(node.id); }}>
    <div className="ui-tree__row" onClick={event => { event.stopPropagation(); if (node.isDisabled) return; tree.focus(node.id); tree.choose(node.id, tree.mode === 'multiple'); if (tree.mode === 'none') tree.action?.(node.id); }} onDoubleClick={event => { event.stopPropagation(); if (node.isDisabled) return; if (branch) tree.expand(node.id); else tree.action?.(node.id); }}>
      {branch ? <Button variant="ghost" size="xs" iconOnly leadingIcon={RiArrowRightSLine} className="ui-tree__toggle" aria-label={`${open ? 'Collapse' : 'Expand'} ${node.label}`} aria-expanded={open} aria-controls={`${id}-group`} disabled={node.isDisabled} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={event => { event.stopPropagation(); tree.focus(node.id); tree.expand(node.id); }}/> : tree.hierarchical && <span className="ui-tree__spacer" aria-hidden/>}
      {tree.mode === 'multiple' && selectable && <span className="ui-tree__selection" aria-hidden><RiCheckLine size={12}/></span>}
      {node.leading && <span className="ui-tree__leading" aria-hidden>{typeof node.leading==='function'?node.leading({isExpanded:open}):node.leading}</span>}
      <span className="ui-tree__copy"><span id={`${id}-label`} className="ui-tree__label">{node.label}</span>{node.description && <span id={`${id}-description`} className="ui-tree__description">{node.description}</span>}</span>
      {node.trailing && <span id={`${id}-trailing`} className="ui-tree__trailing">{node.trailing}</span>}
    </div>
    {branch && <Collapsible isOpen={open} className="ui-tree__fold"><div id={`${id}-group`} role="group" className="ui-tree__children"><Branches items={node.children!}/></div></Collapsible>}
  </div>;
}
function Branches({ items }: { items: TreeNode[] }) {
  const tree = useContext(TreeContext)!;
  return <div className="ui-tree__items"><AnimatePresence initial={false} mode="popLayout">{items.map(node => <motion.div key={node.id} className="ui-tree__item-shell" layout="position" initial={tree.reduced ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: tree.reduced ? 0 : tree.tokens.fast, ease: tree.tokens.ease }}><Branch node={node}/></motion.div>)}</AnimatePresence></div>;
}

/** Native tree semantics with persistent, animated groups and independent focus/selection. */
export function Tree({ items, 'aria-label': label, selectedKeys, defaultSelectedKeys = [], onSelectionChange, expandedKeys, defaultExpandedKeys = [], onExpandedChange, onAction, selectionMode = 'single', disallowEmptySelection = false, density = 'normal', variant = 'soft', showGuides = true, renderEmptyState, className }: TreeProps) {
  const [internalSelected, setInternalSelected] = useState(() => [...defaultSelectedKeys]);
  const [internalExpanded, setInternalExpanded] = useState(() => [...defaultExpandedKeys]);
  const [focused, setFocused] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null), elements = useRef(new Map<string, HTMLDivElement>()), within = useRef(false), anchor = useRef<string | null>(null);
  const typeahead = useRef({ text: '', time: 0 });
  const all = useMemo(() => indexTree(items), [items]);
  const entries = useMemo(() => new Map(all.map(entry => [entry.node.id, entry])), [all]);
  const previousEntries = useRef(entries);
  const expanded = new Set(expandedKeys ?? internalExpanded);
  const requestedSelection = [...(selectedKeys ?? internalSelected)];
  const selected = new Set(selectionMode === 'none' ? [] : selectionMode === 'single' ? requestedSelection.slice(0,1) : requestedSelection);
  const visible = all.filter(entry => entry.ancestors.every(key => expanded.has(key)));
  const enabled = visible.filter(entry => !entry.node.isDisabled), selectable = enabled.filter(entry => entry.node.isSelectable !== false);
  const tabStop = enabled.find(entry => entry.node.id === focused)?.node.id ?? enabled.find(entry => selected.has(entry.node.id))?.node.id ?? enabled[0]?.node.id;
  const reduced = Boolean(useReducedMotion()),tokens=useMotionTokens(root);
  function focus(key: string) {
    const element = elements.current.get(key);
    if (!element || element.closest('[inert]') || entries.get(key)?.node.isDisabled) return;
    setFocused(key);
    if (document.activeElement !== element) element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
  const visibleSignature = enabled.map(entry => entry.node.id).join('\u0000');
  useLayoutEffect(() => {
    if (focused && !enabled.some(entry => entry.node.id === focused)) {
      const ancestors = (entries.get(focused) ?? previousEntries.current.get(focused))?.ancestors ?? [];
      const next = [...ancestors].reverse().find(key => enabled.some(entry => entry.node.id === key)) ?? enabled[0]?.node.id;
      if (within.current) { if (next) focus(next); else root.current?.focus({ preventScroll: true }); }
      else setFocused(next ?? null);
    }
    previousEntries.current = entries;
  }, [visibleSignature, entries]); // Focus follows the remaining hierarchy when data/expansion removes its row.
  function select(next: string[]) { if (selectedKeys === undefined) setInternalSelected(next); onSelectionChange?.(next); }
  function choose(key: string, toggle = false) {
    const node = entries.get(key)?.node;
    if (!node || node.isDisabled || node.isSelectable === false || selectionMode === 'none') return;
    anchor.current = key;
    const next = selectionMode === 'multiple' ? toggle && selected.has(key) ? [...selected].filter(id => id !== key) : [...new Set([...selected, key])] : toggle && selected.has(key) && !disallowEmptySelection ? [] : [key];
    if (!disallowEmptySelection || next.length) select(next);
  }
  function expand(key: string) {
    const entry = entries.get(key);
    if (!entry || entry.node.children===undefined || entry.node.isDisabled) return;
    const next = new Set(expanded);
    if (next.has(key)) {
      if (focused && entries.get(focused)?.ancestors.includes(key)) focus(key);
      next.delete(key);
    } else next.add(key);
    const keys = [...next];
    if (expandedKeys === undefined) setInternalExpanded(keys);
    onExpandedChange?.(keys);
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'treeitem' || event.altKey) return;
    const key = target.dataset.nodeKey!, entry = entries.get(key), current = enabled.findIndex(item => item.node.id === key);
    if (!entry || current < 0) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode === 'multiple') { event.preventDefault(); select(selectable.map(item => item.node.id)); return; }
    if (event.ctrlKey || event.metaKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const outward = rtl ? 'ArrowLeft' : 'ArrowRight', inward = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (['ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : Math.max(0, Math.min(enabled.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)));
      const next = enabled[index].node.id;
      if (event.shiftKey && selectionMode === 'multiple') {
        const start = enabled.findIndex(item => item.node.id === (anchor.current ?? key));
        const range = enabled.slice(Math.min(start < 0 ? current : start, index), Math.max(start < 0 ? current : start, index) + 1).filter(item => item.node.isSelectable !== false).map(item => item.node.id);
        select([...new Set([...selected, ...range])]);
      }
      focus(next); return;
    }
    if (event.key === outward) { event.preventDefault(); if (entry.node.children!==undefined) { if (!expanded.has(key)) expand(key); else { const child = enabled.find(item => item.ancestors.at(-1) === key); if (child) focus(child.node.id); } } return; }
    if (event.key === inward) { event.preventDefault(); if (entry.node.children!==undefined && expanded.has(key)) expand(key); else { const parent = [...entry.ancestors].reverse().find(id => enabled.some(item => item.node.id === id)); if (parent) focus(parent); } return; }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(key, event.key === ' '); if (event.key === 'Enter') { if (entry.node.children!==undefined) expand(key); else onAction?.(key); } return; }
    if (event.key === 'Escape') { if (!disallowEmptySelection && selected.size) { event.preventDefault(); select([]); } return; }
    if (event.key.length === 1) {
      const character = event.key.toLocaleLowerCase();
      const now = performance.now(), typed = now - typeahead.current.time < 650 ? typeahead.current.text + character : character;
      typeahead.current = { text: typed, time: now };
      const query = [...typed].every(char => char === typed[0]) ? typed[0] : typed;
      const collator = new Intl.Collator(undefined, { usage: 'search', sensitivity: 'base' });
      const order = query.length === 1 ? [...enabled.slice(current + 1), ...enabled.slice(0,current + 1)] : [...enabled.slice(current), ...enabled.slice(0,current)];
      const match = order.find(item => collator.compare(item.node.label.slice(0,query.length), query) === 0);
      if (match) { event.preventDefault(); focus(match.node.id); }
    }
  }
  const context: TreeContextValue = { expanded, selected, entries, tabStop, mode: selectionMode, hierarchical: all.some(entry => entry.node.children!==undefined), reduced,tokens, register: (key, element) => { if (element) elements.current.set(key, element); else elements.current.delete(key); }, focus, choose, expand, action: onAction };
  return <TreeContext.Provider value={context}><div ref={root} className={cx('ui-tree', className)} role="tree" aria-label={label} aria-multiselectable={selectionMode === 'multiple' || undefined} data-density={density} data-variant={variant} data-guides={showGuides || undefined} tabIndex={!enabled.length ? 0 : undefined} onKeyDown={keyboard} onFocusCapture={() => { within.current = true; }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) within.current = false; }}><AnimatedHeight>{items.length ? <Branches items={items}/> : renderEmptyState ?? <EmptyState size="small" title="No items"/>}</AnimatedHeight></div></TreeContext.Provider>;
}
