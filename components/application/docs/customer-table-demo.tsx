'use client';

import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { RiArchiveLine, RiDeleteBinLine, RiDownloadLine, RiEditLine, RiFileCopyLine, RiMore2Line, RiUser3Line } from '@remixicon/react';
import { Form } from 'react-aria-components';
import { Dialog } from '@/components/base/dialog/dialog';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Input } from '@/components/base/input/input';
import { NumberField } from '@/components/base/number-field/number-field';
import { Select } from '@/components/base/select/select';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar } from '@/components/base/avatar/avatar';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Dropdown, DropdownIconTrigger, DropdownItem, DropdownPopover } from '@/components/base/dropdown/dropdown';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { DataTable } from '@/components/blocks/data-table/data-table';

type Purchase = 'Waiting' | 'Processing' | 'Completed';
type Customer = { id: string; name: string; purchase: Purchase; status: 'Delivery failed' | 'Delivery waiting' | 'Shipped'; date: string; priceAmount: number; product: string; region: string };
const seed: Customer[] = [
  { id: '1', name: 'John Clarkson', purchase: 'Waiting', status: 'Delivery failed', date: '2026-09-05', priceAmount: 3412, product: 'Studio', region: 'Americas' },
  { id: '2', name: 'Aspen Lubin', purchase: 'Waiting', status: 'Delivery failed', date: '2026-03-25', priceAmount: 1899, product: 'Teams', region: 'Europe' },
  { id: '3', name: 'Michael Ekstrom', purchase: 'Completed', status: 'Shipped', date: '2026-08-01', priceAmount: 2752, product: 'Studio', region: 'Asia' },
  { id: '4', name: 'Kianna Vaccaro', purchase: 'Completed', status: 'Shipped', date: '2026-04-02', priceAmount: 145, product: 'Starter', region: 'Europe' },
  { id: '5', name: 'Livia Saris', purchase: 'Processing', status: 'Delivery failed', date: '2026-11-14', priceAmount: 708, product: 'Teams', region: 'Europe' },
  { id: '6', name: 'Jaydon Aminoff', purchase: 'Processing', status: 'Delivery waiting', date: '2026-07-17', priceAmount: 224, product: 'Starter', region: 'Americas' },
  { id: '7', name: 'Maria Lubin', purchase: 'Completed', status: 'Shipped', date: '2026-11-15', priceAmount: 2959, product: 'Studio', region: 'Asia' },
  { id: '8', name: 'Ann Press', purchase: 'Processing', status: 'Delivery waiting', date: '2026-09-20', priceAmount: 2646, product: 'Teams', region: 'Americas' },
];
const firstNames = ['Avery', 'Elin', 'Noah', 'Priya', 'Daniel', 'Isabel', 'Theo', 'Camila'];
const lastNames = ['Stone', 'Park', 'Garcia', 'Shah', 'Kim'];
const purchases: Purchase[] = ['Waiting', 'Processing', 'Completed'];
const statuses: Customer['status'][] = ['Delivery failed', 'Delivery waiting', 'Shipped'];
const products = ['Studio', 'Teams', 'Starter'];
const regions = ['Americas', 'Europe', 'Asia'];
const initialRows: Customer[] = [...seed, ...Array.from({ length: 40 }, (_, index) => ({
  id: String(index + 9), name: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length)]}`,
  purchase: purchases[index % 3], status: statuses[index % 3], date: `2026-${String(index % 12 + 1).padStart(2, '0')}-${String(index % 27 + 1).padStart(2, '0')}`,
  priceAmount: 120 + (index * 173) % 3500, product: products[index % 3], region: regions[Math.floor(index / 3) % 3],
}))];
const filters = [
  { id: 'price', label: 'All prices', ariaLabel: 'Price', options: [{ value: 'low', label: 'Under $500' }, { value: 'medium', label: '$500–$2,000' }, { value: 'high', label: 'Over $2,000' }], getValue: (row: Customer) => row.priceAmount < 500 ? 'low' : row.priceAmount <= 2000 ? 'medium' : 'high' },
  { id: 'product', label: 'All products', ariaLabel: 'Product', options: products.map(value => ({ value, label: value })), getValue: (row: Customer) => row.product },
  { id: 'region', label: 'All regions', ariaLabel: 'Region', options: regions.map(value => ({ value, label: value })), getValue: (row: Customer) => row.region },
];

function CustomerActions({ customer, onDelete, onEdit, onView, onDuplicate, onDownload, onArchive }: { customer: Customer; onDelete: () => void; onEdit: () => void; onView: () => void; onDuplicate: () => void; onDownload: () => void; onArchive: () => void }) {
  return <div className="docs-table-actions">
    <IconButton size="small" icon={RiDeleteBinLine} aria-label={`Delete ${customer.name}`} onClick={onDelete} />
    <IconButton size="small" icon={RiEditLine} aria-label={`Edit ${customer.name}`} onClick={onEdit} />
    <Dropdown>
      <DropdownIconTrigger size="small" icon={RiMore2Line} aria-label={`More actions for ${customer.name}`} />
      <DropdownPopover aria-label={`Actions for ${customer.name}`} placement="bottom end" className="docs-table-actions__popover">
        <DropdownItem onSelect={onView}><RiUser3Line aria-hidden />View profile</DropdownItem>
        <DropdownItem onSelect={onDuplicate}><RiFileCopyLine aria-hidden />Duplicate row</DropdownItem>
        <DropdownItem onSelect={onDownload}><RiDownloadLine aria-hidden />Download invoice</DropdownItem>
        <DropdownItem onSelect={onArchive}><RiArchiveLine aria-hidden />Archive customer</DropdownItem>
      </DropdownPopover>
    </Dropdown>
  </div>;
}

export function CustomerTablePreview({ onAction }: { onAction?: (message: string) => void }) {
  const [size, setSize] = useState<'md' | 'sm'>('md');
  return <div className="docs-preview__table-demo"><CustomerTableDemo size={size} onAction={onAction}/><SegmentedControl className="docs-table-size" aria-label="Table density" value={size} onValueChange={value => setSize(value as 'md' | 'sm')} options={[{value:'md',label:'Normal'},{value:'sm',label:'Compact'}]}/></div>;
}

export function CustomerTableDemo({ size = 'md', onAction }: { size?: 'md' | 'sm'; onAction?: (message: string) => void }) {
  const [rows, setRows] = useState(initialRows);
  const [dialog, setDialog] = useState<{ mode: 'view' | 'edit'; customer: Customer } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const formId = useId();
  const [draft, setDraft] = useState<Customer | null>(null);
  const [removed, setRemoved] = useState<{ customer: Customer; index: number; action: 'Deleted' | 'Archived' } | null>(null);
  const nextId = useRef(49);

  function removeCustomer(customer: Customer, action: 'Deleted' | 'Archived') {
    const index = rows.findIndex(item => item.id === customer.id);
    setRows(current => current.filter(item => item.id !== customer.id));
    setRemoved({ customer, index, action });
    onAction?.(`${customer.name} ${action.toLowerCase()}.`);
  }

  function duplicateCustomer(customer: Customer) {
    const copy = { ...customer, id: String(nextId.current++), name: `${customer.name} copy` };
    setRows(current => { const index = current.findIndex(item => item.id === customer.id); return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]; });
    onAction?.(`${customer.name} duplicated.`);
  }

  function downloadInvoice(customer: Customer) {
    const content = `Invoice for ${customer.name}\nDate: ${customer.date}\nProduct: ${customer.product}\nAmount: $${customer.priceAmount.toLocaleString('en-US')}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${customer.id}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onAction?.(`Invoice for ${customer.name} downloaded.`);
  }

  function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setRows(current => current.map(item => item.id === draft.id ? draft : item));
    setDialogOpen(false);
    onAction?.(`${draft.name} updated.`);
  }

  const columns = useMemo<ColumnDef<Customer, any>[]>(() => [
    { accessorKey: 'name', header: 'Customer name', cell: ({ row }) => <span className="docs-customer"><Avatar size="xs" initials={row.original.name.split(' ').map(part => part[0]).join('')} color={(['blue', 'neutral', 'pink', 'lime'] as const)[row.index % 4]} /><strong>{row.original.name}</strong></span> },
    { accessorKey: 'purchase', header: 'Purchase', enableSorting: false, cell: ({ row }) => <div className="docs-purchase-control"><Select aria-label={`Purchase status for ${row.original.name}`} selectedKey={row.original.purchase} options={purchases.map(value=>({id:value,label:value,leading:<span className="docs-purchase-control__dot" data-purchase={value.toLowerCase()} aria-hidden/>}))} onSelectionChange={value=>{if(value)setRows(current=>current.map(item=>item.id===row.original.id?{...item,purchase:value as Purchase}:item));}}/></div> },
    { accessorKey: 'status', header: 'Status', enableSorting: false, cell: ({ row }) => <span className="docs-table-status" data-status={row.original.status.toLowerCase()}>{row.original.status}</span> },
    { accessorKey: 'date', header: 'Last updated', cell: ({ row }) => new Date(`${row.original.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) },
    { accessorKey: 'priceAmount', header: 'Price', cell: ({ row }) => `$${row.original.priceAmount.toLocaleString('en-US')}` },
    { id: 'actions', header: 'Actions', meta: { width: 140 }, enableSorting: false, cell: ({ row }) => <CustomerActions customer={row.original} onDelete={() => removeCustomer(row.original, 'Deleted')} onEdit={() => { setDraft({ ...row.original }); setDialog({ mode: 'edit', customer: row.original }); setDialogOpen(true); }} onView={() => {setDialog({ mode: 'view', customer: row.original });setDialogOpen(true);}} onDuplicate={() => duplicateCustomer(row.original)} onDownload={() => downloadInvoice(row.original)} onArchive={() => removeCustomer(row.original, 'Archived')} /> },
  ], [rows, onAction]);
  return <>
    <DataTable data={rows} columns={columns} getRowId={row => row.id} filters={filters} pageSize={8} size={size} resultLabel="customers" defaultSelectedRowIds={['2', '3']} onSelectionChange={selected => onAction?.(`${selected.length} selected.`)} />
    {removed && <div className="docs-table-undo" role="status"><span>{removed.customer.name} {removed.action.toLowerCase()}.</span><button type="button" onClick={() => { setRows(current => [...current.slice(0, removed.index), removed.customer, ...current.slice(removed.index)]); setRemoved(null); }}>Undo</button><CloseButton size="xs" aria-label="Dismiss notification" onClick={()=>setRemoved(null)}/></div>}
    <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen} size="small" className="docs-customer-dialog" title={dialog?.mode==='edit'?'Edit customer':'Customer profile'} description={dialog?.customer.name} footer={dialog?.mode==='view'?<Button onClick={()=>{setDraft({...dialog.customer});setDialog({mode:'edit',customer:dialog.customer});}}>Edit customer</Button>:<><Button variant="secondary" onClick={()=>setDialogOpen(false)}>Cancel</Button><Button type="submit" form={formId}>Save changes</Button></>}>
      {dialog?.mode==='view'?<dl className="docs-customer-profile"><div><dt>Purchase</dt><dd>{dialog.customer.purchase}</dd></div><div><dt>Status</dt><dd>{dialog.customer.status}</dd></div><div><dt>Product</dt><dd>{dialog.customer.product}</dd></div><div><dt>Region</dt><dd>{dialog.customer.region}</dd></div><div><dt>Price</dt><dd>${dialog.customer.priceAmount.toLocaleString('en-US')}</dd></div></dl>:draft && <Form id={formId} className="docs-customer-form" validationBehavior="native" onSubmit={saveCustomer}>
        <Input label="Name" name="name" autoFocus isRequired value={draft.name} onChange={name=>setDraft(current=>current&&{...current,name})}/>
        <Select label="Purchase" selectedKey={draft.purchase} options={purchases.map(value=>({id:value,label:value}))} onSelectionChange={purchase=>{if(purchase)setDraft(current=>current&&{...current,purchase:purchase as Purchase});}}/>
        <Select label="Status" selectedKey={draft.status} options={statuses.map(value=>({id:value,label:value}))} onSelectionChange={status=>{if(status)setDraft(current=>current&&{...current,status:status as Customer['status']});}}/>
        <NumberField label="Price" name="price" isRequired minValue={0} step={1} value={draft.priceAmount} onChange={priceAmount=>setDraft(current=>current&&{...current,priceAmount})}/>
      </Form>}
    </Dialog>
  </>;
}
