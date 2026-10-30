'use client';

import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';
import { cx } from '@/utils/cx';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  'aria-label'?: string;
};

function visiblePages(page: number, total: number, siblings: number) {
  const numbers = new Set([1, total]);
  for (let value = Math.max(1, page - siblings); value <= Math.min(total, page + siblings); value++) numbers.add(value);
  const sorted = [...numbers].sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  sorted.forEach((value, index) => {
    if (index > 0) {
      const gap = value - sorted[index - 1];
      if (gap === 2) result.push(value - 1);
      if (gap > 2) result.push('ellipsis');
    }
    result.push(value);
  });
  return result;
}

export function Pagination({ page, totalPages, onPageChange, siblingCount = 1, className, 'aria-label': ariaLabel = 'Pagination' }: PaginationProps) {
  const total = Number.isFinite(totalPages) ? Math.max(1, Math.floor(totalPages)) : 1;
  const current = Number.isFinite(page) ? Math.min(total, Math.max(1, Math.floor(page))) : 1;
  const siblings = Number.isFinite(siblingCount) ? Math.max(0, Math.floor(siblingCount)) : 1;
  return <nav className={cx('ui-pagination', className)} aria-label={ariaLabel}>
    <button type="button" className="ui-pagination__edge" disabled={current === 1} onClick={() => onPageChange(current - 1)}><RiArrowLeftLine size={16} aria-hidden /> Previous</button>
    <AnimatedHeight className="ui-pagination__range"><div className="ui-pagination__pages">{visiblePages(current, total, siblings).map((item, index) => item === 'ellipsis' ? <span className="ui-pagination__ellipsis" aria-hidden="true" key={`gap-${index}`}>···</span> : <button key={item} type="button" aria-label={`Page ${item}`} aria-current={item === current ? 'page' : undefined} onClick={() => onPageChange(item)}>{item}</button>)}</div></AnimatedHeight>
    <button type="button" className="ui-pagination__edge" disabled={current === total} onClick={() => onPageChange(current + 1)}>Next <RiArrowRightLine size={16} aria-hidden /></button>
  </nav>;
}
