'use client';

import { useId, useState } from 'react';
import { RiArrowDownSLine, RiArrowRightUpLine, RiFileTextLine, RiGlobalLine } from '@remixicon/react';
import { Badge } from '@/components/base/badges/badge';
import { ButtonLink } from '@/components/base/buttons/button-link';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { HoverCard } from '@/components/base/hover-card/hover-card';
import { cx } from '@/utils/cx';
import { safeUrl, urlHostname } from '@/utils/safe-url';

export type Source = { id: string; title: string; url?: string; description?: string; publisher?: string; type?: 'web' | 'document'; date?: string; };
export type SourcesProps = { sources: Source[]; title?: string; defaultExpanded?: boolean; variant?: 'list' | 'grid'; className?: string; };

export function SourceCard({ source, index, compact = false }: { source: Source; index?: number; compact?: boolean }) {
  const url = safeUrl(source.url), publisher = source.publisher ?? urlHostname(url) ?? (source.type === 'document' ? 'Document' : 'Source');
  const Icon = source.type === 'document' ? RiFileTextLine : RiGlobalLine;
  return <article className="ui-source-card" data-compact={compact || undefined}>
    <div className="ui-source-card__meta"><span className="ui-source-card__publisher"><Icon size={14} aria-hidden/>{publisher}</span>{index != null && <Badge>{index}</Badge>}</div>
    <h4>{source.title}</h4>{source.description && <p>{source.description}</p>}
    {(source.date || url) && <div className="ui-source-card__footer">{source.date && <span>{source.date}</span>}{url && <ButtonLink href={url} target={/^https?:/.test(url) ? '_blank' : undefined} rel={/^https?:/.test(url) ? 'noopener noreferrer' : undefined} size="xs" variant="ghost" trailingIcon={RiArrowRightUpLine}>Open source</ButtonLink>}</div>}
  </article>;
}

export function InlineCitation({ source, index }: { source: Source; index: number }) {
  return <HoverCard trigger={<button type="button" className="ui-inline-citation" aria-label={`Source ${index}: ${source.title}`}><Badge variant="index">{index}</Badge></button>} label={`Source ${index}: ${source.title}`} placement="top">
    <SourceCard source={source} compact/>
  </HoverCard>;
}

export function Sources({ sources, title = 'Sources', defaultExpanded = true, variant = 'list', className }: SourcesProps) {
  const [open, setOpen] = useState(defaultExpanded), id = useId();
  return <section className={cx('ui-sources', className)} aria-label={title}>
    <button type="button" className="ui-sources__trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}><RiGlobalLine size={16} aria-hidden/><span>{title}</span><Badge>{sources.length}</Badge><RiArrowDownSLine size={16} aria-hidden/></button>
    <Collapsible id={id} isOpen={open}><div className="ui-sources__items" data-variant={variant}>{sources.length ? sources.map((source,index)=><SourceCard source={source} key={source.id} index={index+1}/>) : <p className="ui-sources__empty">No sources are attached to this response.</p>}</div></Collapsible>
  </section>;
}
