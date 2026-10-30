'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type RowData, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import { RiArrowDownSLine } from '@remixicon/react';
import { Pagination } from '@/components/base/pagination/pagination';
import { SearchField } from '@/components/base/search-field/search-field';
import { Select } from '@/components/base/select/select';
import { cx } from '@/utils/cx';
import {AnimatePresence} from 'motion/react';
import {AnimatedHeight} from '@/components/base/animated-height/animated-height';
import {ScrollArea} from '@/components/base/scroll-area/scroll-area';
import {DataTableRow} from './data-table-row';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: number;
  }
}

export type DataTableFilter<T> = { id: string; label: string; ariaLabel?: string; options: { value: string; label: string }[]; getValue: (row: T) => string };
export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  getRowId: (row: T) => string;
  filters?: DataTableFilter<T>[];
  pageSize?: number;
  size?: 'md' | 'sm';
  searchPlaceholder?: string;
  resultLabel?: string;
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (rows: T[]) => void;
  enableRowSelection?:boolean;
  showPagination?:boolean;
  toolbarActions?:ReactNode;
  emptyState?: ReactNode;
  className?: string;
};

export function DataTable<T>({ data, columns, getRowId, filters = [], pageSize = 8, size = 'md', searchPlaceholder = 'Search', resultLabel = 'results', defaultSelectedRowIds = [], onSelectionChange, enableRowSelection=true, showPagination=true, toolbarActions, emptyState = 'No results found.', className }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState<RowSelectionState>(() => Object.fromEntries(defaultSelectedRowIds.map(id => [id, true])));
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const lastReportedSelection = useRef(selection);
  const hydrated=useRef(false);useEffect(()=>{hydrated.current=true;},[]);
  const selectionProps = useRef({ data, getRowId, onSelectionChange });
  const effectivePageSize=showPagination?(Number.isFinite(pageSize)?Math.max(1,Math.floor(pageSize)):8):Math.max(1,data.length);
  selectionProps.current = { data, getRowId, onSelectionChange };

  const filteredData = useMemo(() => data.filter(row => filters.every(filter => !filterValues[filter.id] || filterValues[filter.id] === 'all' || filter.getValue(row) === filterValues[filter.id])), [data, filters, filterValues]);

  useEffect(() => {
    const validIds = new Set(data.map(getRowId));
    setSelection(current => Object.keys(current).some(id => !validIds.has(id)) ? Object.fromEntries(Object.entries(current).filter(([id]) => validIds.has(id))) : current);
  }, [data, getRowId]);

  useEffect(() => {
    if (selection === lastReportedSelection.current) return;
    lastReportedSelection.current = selection;
    const { data: rows, getRowId: rowId, onSelectionChange: notify } = selectionProps.current;
    notify?.(rows.filter(row => selection[rowId(row)]));
  }, [selection]);

  const table = useReactTable({
    data: filteredData, columns, getRowId,
    state: { sorting, rowSelection: selection, globalFilter: search, pagination: { pageIndex, pageSize:effectivePageSize } },
    onSortingChange: setSorting,
    onRowSelectionChange: setSelection,
    onPaginationChange: updater => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize:effectivePageSize }) : updater;
      setPageIndex(next.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
  });
  const visibleRows = table.getRowModel().rows;
  const totalPages = Math.max(1, table.getPageCount());
  const selectedCount = Object.values(selection).filter(Boolean).length;

  useEffect(() => { if (pageIndex >= totalPages) setPageIndex(totalPages - 1); }, [pageIndex, totalPages]);

  return <div className={cx('ui-data-table', className)} data-size={size}>
    <div className="ui-data-table__toolbar">
      <div className="ui-data-table__count"><span>Total Results</span><strong>{table.getFilteredRowModel().rows.length} {resultLabel}</strong></div>
      {filters.length > 0 && <div className="ui-data-table__filters">{filters.map(filter => <Select key={filter.id} aria-label={filter.ariaLabel ?? filter.label} selectedKey={filterValues[filter.id] ?? 'all'} options={[{id:'all',label:filter.label},...filter.options.map(option=>({id:option.value,label:option.label}))]} onSelectionChange={value=>{setFilterValues(current=>({...current,[filter.id]:value??'all'}));setPageIndex(0);}}/>)}</div>}
      <SearchField label={searchPlaceholder} hideLabel className="ui-data-table__search" value={search} onChange={value=>{setSearch(value);setPageIndex(0);}} placeholder={searchPlaceholder}/>
      {toolbarActions&&<div className="ui-data-table__toolbar-actions">{toolbarActions}</div>}
    </div>
    <AnimatedHeight><ScrollArea className="ui-data-table__scroll" orientation="horizontal" label="Table columns" renderViewport={({ref,className,children})=><div ref={ref} className={cx(className,'ui-data-table__viewport')} role="region" aria-label="Table columns" tabIndex={0}>{children}</div>}>
      <table className="ui-table" aria-label={`${resultLabel} table`}>
        <thead>{table.getHeaderGroups().map(group => <tr key={group.id}>
          {enableRowSelection&&<th className="ui-data-table__select" scope="col"><input type="checkbox" aria-label="Select all visible rows" disabled={visibleRows.length === 0} checked={visibleRows.length > 0 && table.getIsAllPageRowsSelected()} ref={element => { if (element) element.indeterminate = table.getIsSomePageRowsSelected(); }} onChange={table.getToggleAllPageRowsSelectedHandler()} /></th>}
          {group.headers.map(header => <th scope="col" key={header.id} style={{ width: header.column.columnDef.meta?.width }} aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined}>
            {header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}<RiArrowDownSLine className="ui-data-table__sort-indicator" data-sort={header.column.getIsSorted()||'none'} size={16} aria-hidden/></button> : header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </th>)}
        </tr>)}</thead>
        <tbody><AnimatePresence initial={false}>{visibleRows.length ? visibleRows.map(row => <DataTableRow key={`row:${row.id}`} id={row.id} isSelected={enableRowSelection&&row.getIsSelected()} animateOnMount={hydrated.current}>
          {enableRowSelection&&<td className="ui-data-table__select"><div className="ui-data-table__cell"><input type="checkbox" aria-label={`Select row ${row.id}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} /></div></td>}
          {row.getVisibleCells().map(cell => <td key={cell.id} data-column={cell.column.id} style={{ width: cell.column.columnDef.meta?.width }}><div className="ui-data-table__cell">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div></td>)}
        </DataTableRow>) : <DataTableRow key="empty" id="empty" animateOnMount={hydrated.current}><td className="ui-data-table__empty" colSpan={columns.length + (enableRowSelection?1:0)}><div className="ui-data-table__cell">{emptyState}</div></td></DataTableRow>}</AnimatePresence></tbody>
      </table>
    </ScrollArea></AnimatedHeight>
    <div className="ui-data-table__foot"><span>{enableRowSelection?`${selectedCount} selected`:`${table.getFilteredRowModel().rows.length} of ${data.length} ${resultLabel}`}</span>{showPagination&&<Pagination page={Math.min(pageIndex + 1, totalPages)} totalPages={totalPages} onPageChange={page => setPageIndex(page - 1)} />}</div>
  </div>;
}
