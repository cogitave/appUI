'use client';

import { useRef, useState } from 'react';
import { RiCheckLine, RiFileLine, RiUploadCloud2Line } from '@remixicon/react';
import { cx } from '@/utils/cx';

export type FileUploadProps = {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  isDisabled?: boolean;
  progress?: number;
  onFilesAccepted?: (files: File[]) => void;
  onReject?: (message: string) => void;
  className?: string;
  label?: string;
  hint?: string;
};

function matchesAccept(file: File, accept: string) {
  if (!accept) return true;
  return accept.split(',').some(part => {
    const rule = part.trim().toLowerCase();
    if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}

export function FileUpload({ accept = '.pdf,.jpg,.jpeg,.png,.xlsx', maxSize = 8 * 1024 * 1024, multiple = false, isDisabled = false, progress, onFilesAccepted, onReject, className, label = 'Drag and drop to upload or select', hint = 'PDF, JPG, PNG, XLSX (max 8 MB)' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<File[]>([]);

  function receive(files: FileList | null) {
    if (!files || isDisabled) return;
    const next = Array.from(files);
    const invalid = next.find(file => !matchesAccept(file, accept) || file.size > maxSize);
    if (invalid) {
      const message = invalid.size > maxSize ? `${invalid.name} exceeds the ${Math.round(maxSize / 1024 / 1024)} MB limit.` : `${invalid.name} is not a supported file type.`;
      setError(message);
      onReject?.(message);
      return;
    }
    const accepted = multiple ? next : next.slice(0, 1);
    setError('');
    setSelected(accepted);
    onFilesAccepted?.(accepted);
  }

  const completed = progress === 100;
  return <div className={cx('ui-file-upload', className)} data-dragging={isDragging || undefined} data-disabled={isDisabled || undefined} data-error={Boolean(error) || undefined}>
    <input ref={inputRef} className="ui-file-upload__input" type="file" accept={accept} multiple={multiple} disabled={isDisabled} aria-label={label} onChange={event => { receive(event.currentTarget.files); event.currentTarget.value = ''; }} />
    <div className="ui-file-upload__dropzone" role="button" tabIndex={isDisabled ? -1 : 0} aria-disabled={isDisabled} onClick={() => inputRef.current?.click()} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click(); } }} onDragEnter={event => { event.preventDefault(); if (!isDisabled) setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); receive(event.dataTransfer.files); }}>
      <span className="ui-file-upload__icon">{completed ? <RiCheckLine size={22} aria-hidden /> : selected.length ? <RiFileLine size={22} aria-hidden /> : <RiUploadCloud2Line size={22} aria-hidden />}</span>
      <strong>{selected.length ? selected.map(file => file.name).join(', ') : label}</strong>
      <small>{error || (selected.length ? `${selected.length} ${selected.length === 1 ? 'file' : 'files'} ready` : hint)}</small>
      {progress !== undefined && selected.length > 0 && <span className="ui-file-upload__progress" aria-label="Upload progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></span>}
    </div>
    <span className="ui-file-upload__status" role="status">{error || (selected.length ? `${selected.length} file selected.` : '')}</span>
  </div>;
}
