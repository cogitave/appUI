'use client';

import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { RiAddLine, RiArrowUpLine, RiAttachmentLine, RiFolder3Line, RiGitBranchLine, RiMicLine } from '@remixicon/react';
import { ComposerAttachments, type ComposerAttachment } from './composer-attachments';
import { ComposerModelPicker, composerModels } from './composer-model-picker';
import { AgentThinking } from '@/components/blocks/agent-thinking/agent-thinking';
import { cx } from '@/utils/cx';
import { ComposerAddMenu, type ComposerMenuGroup } from './composer-add-menu';

export type ComposerProps = { value?: string; defaultValue?: string; onChange?: (value: string) => void; onSend?: (message: string) => void; models?: { id: string; label: string }[]; selectedModel?: string; onModelChange?: (model: string) => void; effort?: number; defaultEffort?: number; onEffortChange?: (effort: number) => void; onVoice?: () => void; attachments?: ComposerAttachment[]; onAddFiles?: (files: File[]) => void; onRemoveAttachment?: (id: string) => void; menuGroups?: ComposerMenuGroup[]; onMenuAction?: (id: string) => void; branch?: string; project?: string; agentLabel?: string; contextPercent?: number; isWorking?: boolean; placeholder?: string; footerStart?: ReactNode; modelPicker?: ReactNode; status?: ReactNode; disabled?: boolean; inputRef?: Ref<HTMLTextAreaElement>; maxInputHeight?: number; statusPlacement?: 'bottom' | 'tab'; className?: string };
const defaultMenuGroups: ComposerMenuGroup[] = [{ label: 'Add', items: [{ id: 'files', label: 'Files and folders', icon: <RiAttachmentLine size={18} /> }] }];
export function Composer({ value, defaultValue = '', onChange, onSend, models = composerModels, selectedModel, onModelChange, effort, defaultEffort = 2, onEffortChange, onVoice, attachments = [], onAddFiles, onRemoveAttachment, menuGroups = defaultMenuGroups, onMenuAction, branch, project, agentLabel, contextPercent, isWorking = false, placeholder = 'Ask me anything', footerStart, modelPicker, status: statusSlot, disabled = false, inputRef: forwardedInputRef, maxInputHeight = 120, statusPlacement = 'bottom', className }: ComposerProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [internalModel, setInternalModel] = useState(() => models.find(model => model.id === 'fable')?.id ?? models[0]?.id);
  const [internalEffort, setInternalEffort] = useState(defaultEffort);
  const [internalAttachments, setInternalAttachments] = useState<ComposerAttachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputMeasured = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => { if (isWorking || disabled) setMenuOpen(false); }, [isWorking, disabled]);
  const text = value ?? internal;
  const busy = disabled || isWorking;
  useImperativeHandle(forwardedInputRef, () => inputRef.current!, []);
  const resizeInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const previousHeight = input.offsetHeight;
    // Measure natural content without animating through an intermediate auto size.
    // Restoring the current rendered height also makes rapid edits reverse smoothly.
    input.style.transition = 'none';
    input.style.height = 'auto';
    const naturalHeight = input.scrollHeight;
    const targetHeight = Math.min(naturalHeight, maxInputHeight);
    input.style.overflowY = naturalHeight > maxInputHeight ? 'auto' : 'hidden';
    input.style.height = `${inputMeasured.current ? previousHeight : targetHeight}px`;
    void input.offsetHeight;
    input.style.removeProperty('transition');
    input.style.height = `${targetHeight}px`;
    inputMeasured.current = true;
  }, [maxInputHeight]);
  useLayoutEffect(resizeInput, [text, resizeInput]);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    let width = input.clientWidth;
    const observer = new ResizeObserver(() => { if (input.clientWidth !== width) { width = input.clientWidth; resizeInput(); } });
    observer.observe(input);
    return () => observer.disconnect();
  }, [resizeInput]);
  const modelKey = models.some(model => model.id === (selectedModel ?? internalModel)) ? selectedModel ?? internalModel : models[0]?.id;
  const items = attachments.length ? attachments : internalAttachments;
  function update(next: string) { if (value === undefined) setInternal(next); onChange?.(next); }
  function send() { const trimmed = text.trim(); if (!trimmed || busy) return; onSend?.(trimmed); update(''); }
  function addFiles(files: File[]) { if (!files.length) return; if (onAddFiles) onAddFiles(files); else setInternalAttachments(current => [...current, ...files.map(file => ({ id: `${file.name}-${file.lastModified}`, name: file.name, status: 'ready' as const }))]); }
  function remove(id: string) { if (onRemoveAttachment) onRemoveAttachment(id); else setInternalAttachments(current => current.filter(item => item.id !== id)); }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }
  function chooseMenuItem(id: string) { if (id === 'files') fileRef.current?.click(); else onMenuAction?.(id); }
  const status = statusSlot !== undefined ? statusSlot : (branch || project || agentLabel || contextPercent !== undefined) && <div className="ui-composer__status">{branch && <span><RiGitBranchLine size={13} aria-hidden />{branch}</span>}{project && <span><RiFolder3Line size={13} aria-hidden />{project}</span>}<span className="ui-composer__status-spacer" />{agentLabel && <span>{agentLabel}</span>}{contextPercent !== undefined && <span className="ui-composer__context">◕ {Math.round(contextPercent)}%</span>}</div>;
  return <div className={cx('ui-composer', className)} data-working={isWorking || undefined} data-status-placement={statusPlacement}>
    {isWorking && <div className="ui-composer__thinking"><AgentThinking label="Working" /></div>}
    {statusPlacement === 'tab' && status}
    <input ref={fileRef} className="ui-composer-attachments__input" type="file" multiple disabled={busy} aria-label="Attach files" onChange={event => { addFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} />
    <div className="ui-composer__panel">
      <ComposerAttachments attachments={items} onRemove={remove} />
      <div className="ui-composer__entry">
        <button ref={addRef} type="button" className="ui-composer__add" aria-label={menuOpen ? 'Close add menu' : 'Add attachment'} aria-haspopup="menu" aria-controls={menuId} aria-expanded={menuOpen} disabled={busy} onClick={() => setMenuOpen(open => !open)}><RiAddLine size={18} aria-hidden /></button>
        <textarea ref={inputRef} rows={1} value={text} placeholder={placeholder} aria-label="Message" onChange={event => update(event.target.value)} style={{ maxHeight: maxInputHeight }} onKeyDown={onKeyDown} />
        <div className="ui-composer__footer">
          {footerStart}<span className="ui-composer__footer-spacer" />
          {modelPicker !== undefined ? modelPicker : <ComposerModelPicker models={models} selectedModel={modelKey} onModelChange={key => { if (selectedModel === undefined) setInternalModel(key); onModelChange?.(key); }} effort={effort ?? internalEffort} onEffortChange={next => { if (effort === undefined) setInternalEffort(next); onEffortChange?.(next); }} disabled={busy} />}
          <button type="button" className="ui-composer__voice" aria-label="Voice input" onClick={onVoice} disabled={!onVoice || busy}><RiMicLine size={18} aria-hidden /></button>
          <button type="button" className="ui-composer__send" aria-label="Send message" disabled={!text.trim() || busy} onClick={send}><RiArrowUpLine size={20} aria-hidden /></button>
        </div>
      </div>
    </div>
    {statusPlacement === 'bottom' && status}
    <ComposerAddMenu id={menuId} open={menuOpen && !busy} anchorRef={addRef} groups={menuGroups} onSelect={chooseMenuItem} onClose={closeMenu} />
  </div>;
}
