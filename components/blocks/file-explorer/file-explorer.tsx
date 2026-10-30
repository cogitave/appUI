'use client';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { RiCollapseDiagonalLine, RiExpandDiagonalLine, RiFileCodeLine, RiFileImageLine, RiFileTextLine, RiFolder3Line } from '@remixicon/react';
import { Card } from '@/components/base/card/card';
import { IconButton } from '@/components/base/buttons/icon-button';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { SearchField } from '@/components/base/search-field/search-field';
import { Skeleton } from '@/components/base/skeleton/skeleton';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Tree, type TreeNode, type TreeProps } from '@/components/base/tree/tree';
import { cx } from '@/utils/cx';
import { FolderIcon } from '@/components/base/tree/folder-icon';

export type FileExplorerItem = Omit<TreeNode, 'children'> & { kind?: 'file' | 'folder'; path?: string; children?: FileExplorerItem[] };
export type FileExplorerProps = Pick<TreeProps, 'selectedKeys' | 'defaultSelectedKeys' | 'onSelectionChange' | 'expandedKeys' | 'defaultExpandedKeys' | 'onExpandedChange' | 'selectionMode' | 'disallowEmptySelection' | 'density' | 'showGuides'> & {
  items: FileExplorerItem[];
  title?: string;
  description?: string;
  searchable?: boolean;
  query?: string;
  onQueryChange?: (query: string) => void;
  onOpen?: (item: FileExplorerItem) => void;
  toolbar?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  height?: CSSProperties['height'];
  variant?: 'bordered' | 'soft';
  className?: string;
};
function flatten(items: FileExplorerItem[]): FileExplorerItem[] { return items.flatMap(item => [item, ...flatten(item.children ?? [])]); }
function filter(items: FileExplorerItem[], query: string): FileExplorerItem[] {
  return items.flatMap(item => {
    if (`${item.label} ${item.path ?? ''}`.toLocaleLowerCase().includes(query)) return [item];
    const children = filter(item.children ?? [], query);
    return children.length ? [{ ...item, children }] : [];
  });
}
function decorate(items: FileExplorerItem[]): TreeNode[] {
  return items.map(item => {
    const folder = item.kind === 'folder' || item.children!==undefined;
    const Icon = folder ? RiFolder3Line : /\.(png|jpg|jpeg|webp|svg)$/i.test(item.label) ? RiFileImageLine : /\.(tsx?|jsx?|css|json|html|py|sh)$/i.test(item.label) ? RiFileCodeLine : RiFileTextLine;
    return { ...item, leading: item.leading ?? (folder ? ({isExpanded}:{isExpanded:boolean})=><FolderIcon isOpen={isExpanded}/> : <Icon size={16}/>), children:folder?decorate(item.children??[]):undefined };
  });
}

export function FileExplorer({ items, title = 'Files', description, searchable = true, query, onQueryChange, selectedKeys, defaultSelectedKeys = [], onSelectionChange, expandedKeys, defaultExpandedKeys = [], onExpandedChange, selectionMode = 'single', disallowEmptySelection = false, density = 'normal', showGuides = true, onOpen, toolbar, footer, isLoading = false, height, variant = 'bordered', className }: FileExplorerProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalExpanded, setInternalExpanded] = useState(() => [...defaultExpandedKeys]);
  const [internalSelected, setInternalSelected] = useState(() => [...defaultSelectedKeys]);
  const [searchExpansion, setSearchExpansion] = useState<{ query: string; keys: string[] } | null>(null);
  const text = query ?? internalQuery, search = text.trim().toLocaleLowerCase();
  const filtered = useMemo(() => search ? filter(items, search) : items, [items, search]);
  const all = useMemo(() => flatten(items), [items]), filteredAll = useMemo(() => flatten(filtered), [filtered]);
  const autoExpanded = filteredAll.filter(item => item.kind==='folder'||item.children!==undefined).map(item => item.id);
  const activeExpanded = search ? searchExpansion?.query === search ? searchExpansion.keys : autoExpanded : [...(expandedKeys ?? internalExpanded)];
  const selected = [...(selectedKeys ?? internalSelected)], nodes = useMemo(() => decorate(filtered), [filtered]);
  function changeExpanded(keys: string[]) {
    if (search) setSearchExpansion({ query: search, keys });
    else { if (expandedKeys === undefined) setInternalExpanded(keys); onExpandedChange?.(keys); }
  }
  function changeSelected(keys: string[]) { if (selectedKeys === undefined) setInternalSelected(keys); onSelectionChange?.(keys); }
  function changeQuery(value: string) { if (query === undefined) setInternalQuery(value); onQueryChange?.(value); }
  const files = all.filter(item => item.kind !== 'folder' && !item.children).length;
  const selectedLabel = selected.length === 1 ? all.find(item => item.id === selected[0])?.label : selected.length ? `${selected.length} selected` : '';
  const style = height == null ? undefined : { '--file-explorer-height': typeof height === 'number' ? `${height}px` : height } as CSSProperties;
  return <Card className={cx('ui-file-explorer', className)} padding="none" variant={variant} data-density={density} data-constrained={height != null || undefined} aria-label={title} role="region" aria-busy={isLoading} style={style}>
    <header className="ui-file-explorer__header"><div><h3>{title}</h3>{description && <p>{description}</p>}</div><div className="ui-file-explorer__actions">{toolbar}<Tooltip content="Expand all folders"><IconButton icon={RiExpandDiagonalLine} size="xs" variant="ghost" aria-label="Expand all folders" disabled={isLoading || !autoExpanded.length} onClick={() => changeExpanded(autoExpanded)}/></Tooltip><Tooltip content="Collapse all folders"><IconButton icon={RiCollapseDiagonalLine} size="xs" variant="ghost" aria-label="Collapse all folders" disabled={isLoading || !autoExpanded.length} onClick={() => changeExpanded([])}/></Tooltip></div></header>
    {searchable && <div className="ui-file-explorer__search"><SearchField label={`Search ${title.toLowerCase()}`} hideLabel placeholder="Find a file…" value={text} onChange={changeQuery} size="small" variant="soft" isDisabled={isLoading}/></div>}
    <ScrollArea label={title} className="ui-file-explorer__scroll" renderViewport={({ ref, className: viewportClass, children }) => <div ref={ref} className={cx(viewportClass, 'ui-file-explorer__viewport')} tabIndex={-1}>{children}</div>}>
      <div className="ui-file-explorer__body"><Skeleton isLoading={isLoading} shape="rectangle" className="ui-file-explorer__loading"><Tree items={nodes} aria-label={title} density={density} showGuides={showGuides} selectionMode={selectionMode} disallowEmptySelection={disallowEmptySelection} selectedKeys={selected} onSelectionChange={changeSelected} expandedKeys={activeExpanded} onExpandedChange={changeExpanded} onAction={key => { const item = all.find(item => item.id === key); if (item && item.kind !== 'folder' && !item.children) onOpen?.(item); }} renderEmptyState={<EmptyState size="small" icon={<RiFolder3Line size={22}/>} title={search ? 'No matching files' : 'No files yet'} description={search ? 'Try another file name or clear the search.' : 'Add files to start organizing your project.'}/>}/></Skeleton></div>
    </ScrollArea>
    <footer className="ui-file-explorer__footer">{footer ?? <><span>{isLoading ? 'Loading files…' : search ? `${filteredAll.filter(item => item.kind !== 'folder' && !item.children).length} of ${files} files` : `${files} ${files === 1 ? 'file' : 'files'}`}</span><span>{selectedLabel}</span></>}</footer>
    <span role="status" className="sr-only">{isLoading ? 'Loading files' : `${filteredAll.filter(item => item.kind !== 'folder' && !item.children).length} files available`}</span>
  </Card>;
}
