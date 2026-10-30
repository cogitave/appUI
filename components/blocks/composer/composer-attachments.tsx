'use client';

import { forwardRef, useRef } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { RiAddLine, RiCloseLine, RiFileLine } from '@remixicon/react';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cx } from '@/utils/cx';

export type ComposerAttachment = { id: string; name: string; thumbnail?: string; progress?: number; status?: 'uploading' | 'ready' | 'error' };
export type ComposerAttachmentsProps = { attachments: ComposerAttachment[]; onAddFiles?: (files: File[]) => void; onRemove?: (id: string) => void; accept?: string; className?: string };

const AttachmentTile = forwardRef<HTMLDivElement, { item: ComposerAttachment; onRemove?: (id: string) => void; reducedMotion: boolean }>(function AttachmentTile({ item, onRemove, reducedMotion }, ref) {
  const present = useIsPresent();
  const progress = typeof item.progress === 'number' ? Math.min(100, Math.max(0, item.progress)) : undefined;
  const uploading = item.status === 'uploading';
  return <motion.div ref={ref} inert={!present} layout={reducedMotion ? false : 'position'} initial={{ opacity: 0, scale: reducedMotion ? 1 : .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reducedMotion ? 1 : .94 }} transition={{ duration: reducedMotion ? 0 : .18, ease: [.2, .8, .2, 1] }} className="ui-composer-attachments__tile" data-status={item.status ?? 'ready'}>
    {item.thumbnail ? <img src={item.thumbnail} alt="" /> : <RiFileLine size={21} aria-hidden />}
    <span title={item.name}>{item.name}</span>
    {progress !== undefined && <svg className="ui-composer-attachments__ring" viewBox="0 0 56 56" aria-hidden="true"><rect x="1.5" y="1.5" width="53" height="53" rx="10" pathLength="100" style={{ strokeDashoffset: 100 - progress }} /></svg>}
    {progress !== undefined && <small data-visible={uploading || undefined}>{Math.round(progress)}%</small>}
    {onRemove && <button type="button" aria-label={`Remove ${item.name}`} disabled={uploading} onClick={() => onRemove(item.id)}><RiCloseLine size={13} aria-hidden /></button>}
  </motion.div>;
});

export function ComposerAttachments({ attachments, onAddFiles, onRemove, accept, className }: ComposerAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return <AnimatedHeight className={cx('ui-composer-attachments', className)}>
    <div className="ui-composer-attachments__tiles" data-empty={!attachments.length && !onAddFiles || undefined}>
      <AnimatePresence initial={false} mode="popLayout">{attachments.map(item => <AttachmentTile key={item.id} item={item} onRemove={onRemove} reducedMotion={reducedMotion} />)}</AnimatePresence>
      {onAddFiles && <><input ref={inputRef} className="ui-composer-attachments__input" type="file" multiple accept={accept} aria-label="Add attachments" onChange={event => { onAddFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} /><motion.button layout={reducedMotion ? false : 'position'} transition={{ duration: reducedMotion ? 0 : .18, ease: [.2, .8, .2, 1] }} type="button" className="ui-composer-attachments__add" aria-label="Add attachments" onClick={() => inputRef.current?.click()}><RiAddLine size={19} aria-hidden /></motion.button></>}
    </div>
  </AnimatedHeight>;
}
