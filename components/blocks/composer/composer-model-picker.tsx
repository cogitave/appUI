'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';
import { RiArrowUpSLine } from '@remixicon/react';
import { Dropdown, DropdownGroup, DropdownItem, DropdownPopover, DropdownTrigger } from '@/components/base/dropdown/dropdown';

export type ComposerModel = { id: string; label: string };
export const composerModels: ComposerModel[] = [
  { id: 'composer', label: 'Composer 2.5' },
  { id: 'sol', label: 'GPT-5.6 Sol' },
  { id: 'fable', label: 'Fable 5' },
  { id: 'sonnet', label: 'Sonnet 5' },
];
const effortNames = ['Minimal', 'Low', 'Medium', 'High', 'Maximum'];

export function ComposerModelPicker({ models, selectedModel, onModelChange, effort, onEffortChange, disabled }: { models: ComposerModel[]; selectedModel?: string; onModelChange: (id: string) => void; effort: number; onEffortChange: (value: number) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const effortId = useId();
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  const current = models.find(model => model.id === selectedModel) ?? models[0];
  return <Dropdown isOpen={open} onOpenChange={setOpen}>
    <DropdownTrigger className="ui-composer-model__trigger" aria-label="Model" isDisabled={disabled}><span>{current?.label ?? 'Choose model'}</span><RiArrowUpSLine size={16} aria-hidden /></DropdownTrigger>
    <DropdownPopover aria-label="Model and effort" placement="top start" offset={9} className="ui-composer-model__popover">
      <DropdownGroup label="Models" className="ui-composer-model__models">{models.map(model => <DropdownItem key={model.id} selected={model.id === selectedModel} onSelect={() => onModelChange(model.id)} className="ui-composer-model__option"><span>{model.label}</span><span className="ui-composer-model__radio" aria-hidden /></DropdownItem>)}</DropdownGroup>
      <div className="ui-composer-model__effort"><label htmlFor={effortId}>Effort <strong>{effortNames[effort] ?? 'Medium'}</strong></label><div><span>Faster</span><span>Smarter</span></div><div className="ui-composer-model__range" style={{ '--effort-progress': `${effort * 25}%` } as CSSProperties}><div className="ui-composer-model__ticks" aria-hidden>{effortNames.map(name => <i key={name} />)}</div><input id={effortId} type="range" min="0" max="4" step="1" value={effort} onChange={event => onEffortChange(Number(event.target.value))} aria-valuetext={effortNames[effort]} /></div></div>
    </DropdownPopover>
  </Dropdown>;
}
