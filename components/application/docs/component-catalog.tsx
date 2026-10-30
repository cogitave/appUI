'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/base/badges/badge';
import { docsPages, readySlugs, sectionId, type DocSlug } from './docs-data';
import { DocsPreview } from './docs-previews';
import { catalogRoots, familyForSlug } from './catalog-families';
import { getDocHref } from './getting-started-pages';

const groups = [
  { name: 'Foundations', description: 'The shared color and typography system.' },
  { name: 'Base', description: 'Controls for everyday interactions.' },
  { name: 'Blocks', description: 'Composed interfaces, ready to connect to your data.' },
  { name: 'Charts', description: 'Responsive data displays with shared styling and motion.' },
  { name: 'Templates', description: 'Complete screens composed from the same components.' },
];
const noop = () => {};

/** Read-only thumbnails render real components at their natural proportions. */
function CatalogPreview({ slug, group }: { slug: DocSlug; group: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const width = group === 'Templates' ? 1100 : group === 'Blocks' ? 660 : 420;
  const height = group === 'Templates' ? 760 : group === 'Blocks' ? 650 : 330;
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const size = new ResizeObserver(() => {
      const scale = Math.min((element.clientWidth - 20) / width, (element.clientHeight - 20) / height);
      element.style.setProperty('--catalog-scale', String(Math.max(0, scale)));
    });
    size.observe(element);
    const viewport = new IntersectionObserver(entries => {
      setVisible(entries.some(entry => entry.isIntersecting));
    }, { rootMargin: '300px' });
    viewport.observe(element);
    return () => { size.disconnect(); viewport.disconnect(); };
  }, [width, height]);
  return <div ref={host} className="docs-catalog__preview" data-group={group} aria-hidden inert data-docs-copy-ignore>
    {visible && <div className="docs-catalog__preview-source" style={{width,height}}><DocsPreview slug={slug} onNotify={noop}/></div>}
  </div>;
}

export function ComponentCatalog() {
  return <div className="docs-catalog">{groups.map(group => {
    const items = catalogRoots.filter(item => item.group === group.name && readySlugs.includes(item.slug as DocSlug)).sort((a,b) => a.label.localeCompare(b.label,'en',{sensitivity:'base',numeric:true}));
    return <section id={sectionId(group.name)} className="docs-guide__section" key={group.name}>
      <div className="docs-catalog__section-heading"><h2>{group.name}</h2><Badge>{items.length}</Badge><p>{group.description}</p></div>
      <div className="docs-catalog__grid" data-group={group.name}>{items.map(item => <article className="docs-catalog__card" key={item.slug}>
        <CatalogPreview slug={item.slug as DocSlug} group={group.name}/>
        <div className="docs-catalog__card-copy"><h3>{item.label}<span>{item.isNew && <Badge variant="label" color="new">NEW</Badge>}{item.tier === 'pro' && <Badge variant="label">PRO</Badge>}</span></h3><p>{familyForSlug(item.slug)?.description ?? docsPages[item.slug as DocSlug].description}</p>{familyForSlug(item.slug) && <span className="docs-catalog__family-count">{familyForSlug(item.slug)!.members.length} {familyForSlug(item.slug)!.kind === 'preset' ? 'presets' : familyForSlug(item.slug)!.kind === 'composition' ? 'compositions' : 'components'}</span>}</div>
        <Link className="docs-catalog__card-link" href={getDocHref(item.slug)} aria-label={`View ${item.label}`}/>
      </article>)}</div>
    </section>;
  })}</div>;
}
