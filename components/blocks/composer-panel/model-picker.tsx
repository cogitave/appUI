'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { RiArrowDownSLine, RiArrowRightSLine, RiClaudeFill, RiDeepseekFill, RiGeminiFill, RiMetaFill, RiOpenaiFill, RiPerplexityFill, RiSearchLine } from '@remixicon/react';
import { BrandMark } from '@/components/foundations/brand-mark';
import { Dropdown, DropdownPopover, DropdownTrigger } from '@/components/base/dropdown/dropdown';
import { Radio, RadioGroup } from '@/components/base/radio/radio';
import { Tabs, Tab, TabList, TabPanel } from '@/components/base/tabs/tabs';
import { SearchField } from '@/components/base/search-field/search-field';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { Slider } from '@/components/base/slider/slider';
import { Button } from '@/components/base/buttons/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ComposerModel } from '@/components/blocks/composer/composer-model-picker';

export type ComposerModelProvider = { id: string; name: string; icon?: ReactNode; logo?: string; models: ComposerModel[] };
export const EFFORT_LEVELS = ['Low', 'Medium', 'High', 'Extra high', 'Ultra', 'Max'] as const;
// Demo data, not a live availability catalogue. Applications supply their own providers.
export const MODEL_PROVIDERS: ComposerModelProvider[] = [
  { id: 'openai', name: 'OpenAI', icon: <RiOpenaiFill size={20} />, models: [{ id: 'mini', label: 'GPT-5.6 Mini' }, { id: 'terra', label: 'GPT-5.6 Terra' }, { id: 'sol', label: 'GPT-5.6 Sol' }, { id: 'gpt-4.1', label: 'GPT-4.1' }, { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' }, { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' }, { id: 'o3', label: 'o3' }, { id: 'o4-mini', label: 'o4 Mini' }] },
  { id: 'anthropic', name: 'Anthropic', icon: <RiClaudeFill size={20} />, models: [{ id: 'fable', label: 'Fable 5' }, { id: 'sonnet', label: 'Sonnet 5' }] },
  { id: 'google', name: 'Google', icon: <RiGeminiFill size={20} />, models: [{ id: 'gemini-pro', label: 'Gemini Pro' }, { id: 'gemini-flash', label: 'Gemini Flash' }] },
  { id: 'deepseek', name: 'DeepSeek', icon: <RiDeepseekFill size={20} />, models: [{ id: 'deepseek-v3', label: 'DeepSeek V3' }, { id: 'deepseek-r1', label: 'DeepSeek R1' }] },
  { id: 'meta', name: 'Meta', icon: <RiMetaFill size={20} />, models: [{ id: 'llama-scout', label: 'Llama Scout' }, { id: 'llama-maverick', label: 'Llama Maverick' }] },
  { id: 'perplexity', name: 'Perplexity', icon: <RiPerplexityFill size={20} />, models: [{ id: 'sonar', label: 'Sonar' }, { id: 'sonar-pro', label: 'Sonar Pro' }] },
  { id: 'mistral', name: 'Mistral', models: [{ id: 'mistral-large', label: 'Mistral Large' }, { id: 'mistral-small', label: 'Mistral Small' }] },
  { id: 'studio', name: 'Studio', icon: <BrandMark size={20} />, models: [{ id: 'composer', label: 'Composer 2.5' }] },
];

function ProviderMark({ provider }: { provider: ComposerModelProvider }) {
  return <span className="ui-composer-provider-mark" aria-hidden>{provider.icon ?? (provider.logo ? <img src={provider.logo} alt="" /> : provider.name.slice(0, 1))}</span>;
}

function EffortMenu({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const narrow = useMediaQuery('(max-width: 600px)');
  return <Dropdown><DropdownTrigger className="ui-composer-provider__effort-trigger" aria-label={`Effort: ${EFFORT_LEVELS[value]}`}><span>{EFFORT_LEVELS[value]}</span><RiArrowRightSLine size={14} aria-hidden /></DropdownTrigger><DropdownPopover aria-label="Reasoning effort" placement={narrow ? 'bottom end' : 'right top'} offset={8} className="ui-composer-effort__popover"><div className="ui-composer-effort"><Slider label="Effort" min={0} max={5} step={1} value={value} onChange={onChange} formatValue={level => EFFORT_LEVELS[level]} /><div className="ui-composer-effort__scale"><span>Faster</span><span>Smarter</span></div></div></DropdownPopover></Dropdown>;
}

export type ModelPickerProps = {
  providers?: ComposerModelProvider[];
  value?: string;
  defaultValue?: string;
  onChange?: (model: string) => void;
  effort?: number;
  defaultEffort?: number;
  onEffortChange?: (effort: number) => void;
  disabled?: boolean;
};

export function ModelPicker({ providers = MODEL_PROVIDERS, value, defaultValue, onChange, effort, defaultEffort = 1, onEffortChange, disabled }: ModelPickerProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [internalEffort, setInternalEffort] = useState(defaultEffort);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const all = providers.flatMap(provider => provider.models.map(model => ({ ...model, provider })));
  const current = all.find(model => model.id === (value ?? internal)) ?? all[0];
  const [providerId, setProviderId] = useState<string | undefined>(current?.provider.id);
  const activeProvider = providers.find(provider => provider.id === providerId) ?? current?.provider ?? providers[0];
  const rawEffort = effort ?? internalEffort;
  const level = Number.isFinite(rawEffort) ? Math.max(0, Math.min(5, Math.round(rawEffort))) : 1;
  const filtered = searching ? all.filter(model => `${model.label} ${model.provider.name}`.toLowerCase().includes(query.trim().toLowerCase())) : all.filter(model => model.provider.id === activeProvider?.id);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => { if (searching) searchRef.current?.focus({ preventScroll: true }); }, [searching]);
  function openChange(next: boolean) { setOpen(next); if (next) { setProviderId(current?.provider.id); setQuery(''); setSearching(false); } }
  function choose(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setProviderId(all.find(model => model.id === next)?.provider.id);
    setQuery(''); setSearching(false);
  }
  function changeEffort(next: number) { if (effort === undefined) setInternalEffort(next); onEffortChange?.(next); }
  function lineup() {
    return <div className="ui-composer-provider__lineup">
      <header className="ui-composer-picker__heading" data-searching={searching || undefined}>
        <div className="ui-composer-picker__summary" aria-hidden={searching} inert={searching}><span>Models</span><Button variant="ghost" size="small" trailingIcon={RiSearchLine} onClick={() => setSearching(true)}>Quick Search</Button></div>
        <div className="ui-composer-picker__search" aria-hidden={!searching} inert={!searching}><SearchField label="Search models" hideLabel placeholder="Search all models…" value={query} onChange={setQuery} inputRef={searchRef} variant="soft" size="small" /></div>
      </header>
      <ScrollArea label={searching ? 'Search results' : `${activeProvider?.name ?? ''} models`} viewportClassName="ui-composer-provider__list"><RadioGroup aria-label={searching ? 'Search results' : `${activeProvider?.name ?? ''} models`} value={current?.id ?? ''} onChange={choose}>
        {filtered.map(model => <div className="ui-composer-provider__row" data-selected={model.id === current?.id || undefined} key={model.id}>
          <Radio value={model.id} aria-label={`${model.provider.name} ${model.label}`}><ProviderMark provider={model.provider} /><span className="ui-composer-provider__model-name" title={model.label}>{model.label}</span></Radio>
          {model.id === current?.id && <EffortMenu value={level} onChange={changeEffort} />}
        </div>)}
      </RadioGroup>{!filtered.length && <p className="ui-composer-provider__empty" role="status">{all.length ? 'No matching models.' : 'No models available.'}</p>}</ScrollArea>
    </div>;
  }
  return <Dropdown isOpen={open} onOpenChange={openChange}>
    <DropdownTrigger className="ui-composer-model__trigger ui-composer-provider__trigger" aria-label={`Model: ${current?.label ?? 'Choose model'}`} isDisabled={disabled}><span>{current?.label ?? 'Choose model'}</span><RiArrowDownSLine size={16} aria-hidden /></DropdownTrigger>
    <DropdownPopover aria-label="Model picker" placement="top start" offset={8} className="ui-composer-provider__popover">
      <div onKeyDown={event => {
        const typing = event.target instanceof HTMLInputElement && !['radio', 'range'].includes(event.target.type);
        if (event.key === '/' && !typing) { event.preventDefault(); setSearching(true); }
      }}>
        {providers.length ? <Tabs orientation="vertical" selectedKey={activeProvider?.id} onSelectionChange={key => { setProviderId(String(key)); setQuery(''); setSearching(false); }} className="ui-composer-provider__tabs">
          <TabList aria-label="Model providers">{providers.map(provider => <Tab key={provider.id} id={provider.id} aria-label={provider.name} onPress={() => { setProviderId(provider.id); setQuery(''); setSearching(false); }}><ProviderMark provider={provider} /></Tab>)}</TabList>
          {providers.map(provider => <TabPanel key={provider.id} id={provider.id}>{lineup()}</TabPanel>)}
        </Tabs> : lineup()}
      </div>
    </DropdownPopover>
  </Dropdown>;
}
