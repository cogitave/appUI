'use client';

import { RiInformationLine, RiArrowUpLine, RiArrowDownLine } from '@remixicon/react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type StatCardItem = { id: string; label: string; value: string; change?: number; comparison?: string; icon?: IconComponent; color?: 'blue' | 'orange' | 'violet' | 'pink'; description?: string };
export type StatCardsProps = { items: StatCardItem[]; variant?: 'compact' | 'expanded'; className?: string };
export function StatCards({ items, variant = 'expanded', className }: StatCardsProps) { return <div className={cx('ui-stat-cards', className)} data-variant={variant}>{items.map(item => { const Icon = item.icon; return <article className="ui-stat-card" key={item.id} data-color={item.color ?? 'blue'}>{Icon && <div className="ui-stat-card__icon"><Icon size={19} aria-hidden /></div>}{item.description && <span className="ui-stat-card__info" title={item.description}><RiInformationLine size={16} aria-hidden /><span className="sr-only">{item.description}</span></span>}<span className="ui-stat-card__label">{item.label}</span><strong>{item.value}</strong>{item.change !== undefined && <div className="ui-stat-card__foot"><span>{item.comparison ?? 'From last month'}</span><em data-negative={item.change < 0 || undefined}>{item.change < 0 ? <RiArrowDownLine size={13} aria-hidden /> : <RiArrowUpLine size={13} aria-hidden />}{Math.abs(item.change)}%</em></div>}</article>; })}</div>; }
