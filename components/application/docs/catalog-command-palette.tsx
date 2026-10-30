'use client';

import { useRouter } from 'next/navigation';
import { RiBookOpenLine, RiLayoutGridLine, RiLayoutLine, RiPaletteLine, RiPieChartLine, RiStackLine } from '@remixicon/react';
import { CommandPalette } from '@/components/blocks/command-palette/command-palette';
import type { CommandItem } from '@/components/base/command-menu/command-menu';
import { Badge } from '@/components/base/badges/badge';
import type { IconComponent } from '@/components/foundations/icon-types';
import { catalog, readySlugs, type DocSlug } from './docs-data';
import { familyForSlug, memberForSlug } from './catalog-families';
import { getDocHref } from './getting-started-pages';

const groupIcons: Record<string, IconComponent> = { 'Getting Started': RiBookOpenLine, Foundations: RiPaletteLine, Base: RiLayoutGridLine, Blocks: RiStackLine, Charts: RiPieChartLine, Templates: RiLayoutLine };
const commands: CommandItem[] = catalog.filter(item => readySlugs.includes(item.slug as DocSlug)).map(item => {
  const Icon = groupIcons[item.group];
  const family = familyForSlug(item.slug);
  const member = memberForSlug(item.slug);
  return { id: item.slug, label: family && member ? `${family.label} · ${member.label}` : item.label, group: item.group, keywords: [item.label, item.slug, item.group, item.category ?? '', family?.label ?? '', family?.api ?? '', member?.value ?? ''], leading: <Icon/>, trailing: item.tier === 'pro' ? <Badge variant="label">PRO</Badge> : undefined };
});

export function CatalogCommandPalette({ isOpen, onOpenChange, onNavigate }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onNavigate?: () => void }) {
  const router = useRouter();
  return <CommandPalette title="Search the catalog" label="Catalog pages" placeholder="Search components, blocks and guides…" className="docs-catalog-palette" isOpen={isOpen} onOpenChange={onOpenChange} items={commands} onAction={item => { onNavigate?.(); router.push(getDocHref(item.id)); }}/>;
}
