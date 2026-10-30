'use client';

import { Table as AriaTable, TableHeader, Column, TableBody, Row, Cell, type TableProps as AriaTableProps } from 'react-aria-components';
import { cx } from '@/utils/cx';

export type TableProps = AriaTableProps & { className?: string; size?: 'md' | 'sm' };
export function Table({ className, size = 'md', ...props }: TableProps) {
  return <AriaTable {...props} data-size={size} className={cx('ui-table', className)} />;
}
export { TableHeader, Column, TableBody, Row, Cell };
