'use client';

import Link from 'next/link';
import { RiArrowRightSLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badge';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { cx } from '@/utils/cx';
import { catalog, type DocSlug } from './docs-data';
import type { ComponentFamily } from './catalog-families';
import { getDocHref } from './getting-started-pages';

export function CatalogFamilyItem({ family, slug, query, isOpen, isLastBranch, isNew, isPro, onToggle, onNavigate }: {
  family: ComponentFamily; slug: DocSlug; query: string; isOpen: boolean; isLastBranch: boolean; isNew?: boolean; isPro?: boolean; onToggle: () => void; onNavigate: () => void;
}) {
  const active = family.members.some(member => member.slug === slug);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const members = family.members.filter(member => {
    const entry = catalog.find(item => item.slug === member.slug);
    return terms.every(term => `${family.label} ${member.label} ${member.slug} ${member.value} ${entry?.label} ${entry?.group} ${entry?.category ?? ''}`.toLowerCase().includes(term));
  }).sort((a,b) => a.label.localeCompare(b.label,'en',{sensitivity:'base',numeric:true}));
  const regionId = `docs-family-${family.id}`;
  return <div className="docs-nav-family" data-open={isOpen || undefined} data-last-branch={isLastBranch || undefined}>
    <span className="docs-nav-group__branch" aria-hidden/>
    <div className="docs-nav-family__heading">
      <Button className={cx('docs-nav-family__toggle', active && 'is-active')} size="small" variant="ghost" trailingIcon={RiArrowRightSLine} aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${family.label} ${family.selectionLabel.toLowerCase()}s`} aria-expanded={isOpen} aria-controls={regionId} onClick={onToggle}>
        {family.label}
        <span className="docs-nav-badges">{isNew && <Badge variant="label" color="new">NEW</Badge>}{isPro && <Badge variant="label">PRO</Badge>}</span>
      </Button>
    </div>
    <Collapsible id={regionId} isOpen={isOpen}>
      <div className="docs-nav-family__members">{members.map(member => <Link key={member.slug} href={getDocHref(member.slug)} className={cx(member.slug === slug && 'is-active')} aria-current={member.slug === slug ? 'page' : undefined} onNavigate={onNavigate}><span className="docs-nav-group__branch" aria-hidden/>{member.label}</Link>)}</div>
    </Collapsible>
  </div>;
}
