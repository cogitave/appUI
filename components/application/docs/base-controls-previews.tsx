'use client';

import { publicPath } from '@/config/deployment';
import { useState, type ReactNode } from 'react';
import {SegmentedControlExamples} from './segmented-control-examples';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Select } from '@/components/base/select/select';
import { Slider, RangeSlider } from '@/components/base/slider/slider';
import { SocialButton, socialProviderNames } from '@/components/base/social-button/social-button';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { BaseFinalExamples, BaseFinalPreview } from './base-final-previews';
import { CollectionFieldDensity, SelectSizeExamples, SelectValidationExample } from './collection-field-examples';

type Props = { slug: DocSlug; onNotify: (message: string) => void };
const periods = [{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }];
const priceOptions = [{ id: 'all', label: 'All prices' }, { id: 'low', label: 'Under $100' }, { id: 'middle', label: '$100 – $500' }, { id: 'high', label: 'Over $500' }];
const regionOptions = [{ id: 'all', label: 'All regions' }, { id: 'north', label: 'North America' }, { id: 'europe', label: 'Europe' }, { id: 'apac', label: 'Asia Pacific' }];
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p>{children}</section>;
}

export function BaseControlsPreview({ slug, onNotify }: Props) {
  const [volume, setVolume] = useState(42);
  const [budget, setBudget] = useState<[number, number]>([25,75]);
  switch (slug) {
    case 'segmented-control': return <SegmentedControl aria-label="Period" options={periods} defaultValue="weekly" />;
    case 'select': return <div className="docs-preview__row"><Select options={priceOptions} defaultSelectedKey="all" aria-label="Price" /><Select options={regionOptions} defaultSelectedKey="all" aria-label="Region" /></div>;
    case 'slider': return <div className="docs-preview__slider"><Slider label="Volume" value={volume} onChange={setVolume} /><RangeSlider label="Monthly budget" value={budget} onChange={setBudget} formatValue={value => `$${value}`} /></div>;
    case 'social-button': return <div className="docs-preview__social"><SocialButton provider="google" appearance="brand" onPress={() => onNotify('Google sign-in selected.')} /><SocialButton provider="github" appearance="neutral" onPress={() => onNotify('GitHub sign-in selected.')} /><SocialButton provider="slack" onPress={() => onNotify('Slack sign-in selected.')} /></div>;
    default: return <BaseFinalPreview slug={slug} onNotify={onNotify} />;
  }
}

export function BaseControlsExamples({ slug, onNotify }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>('all');
  const [sliderValue, setSliderValue] = useState(34);
  const [budget, setBudget] = useState<[number, number]>([20,80]);
  switch (slug) {
    case 'segmented-control': return <SegmentedControlExamples/>;
    case 'select': return <>
      <Section title="With details" description="Supporting text clarifies an option inside the popover."><div className="docs-example__surface"><Select label="Workspace" options={[{ id: 'studio', label: 'Studio', detail: 'Design and product work' }, { id: 'research', label: 'Research', detail: 'Ideas and experiments' }, { id: 'archive', label: 'Archive', detail: 'Read-only', isDisabled: true }]} defaultSelectedKey="studio" /></div></Section>
      <Section title="Disabled" description="The trigger remains visible while unavailable."><div className="docs-example__surface docs-example__button-row"><Select options={regionOptions} selectedKey={selectedRegion} onSelectionChange={setSelectedRegion} aria-label="Region" /><Select options={regionOptions} defaultSelectedKey="all" isDisabled aria-label="Disabled region" /></div></Section>
      <Section title="Sizes" description="The trigger uses the shared small, medium and large control heights."><div className="docs-example__surface"><SelectSizeExamples/></div></Section>
      <Section title="Menu density and long lists" description="Normal, compact and touch rows share native scrolling and directional controls. Visual scrollbars stay hidden."><div className="docs-example__surface"><CollectionFieldDensity kind="select"/></div></Section>
      <Section title="Form validation" description="A required selection exposes the native validation error beside its associated control."><div className="docs-example__surface"><SelectValidationExample/></div></Section>
    </>;
    case 'slider': return <>
      <Section title="Controlled value" description="The parent can own the value for live previews and settings."><div className="docs-example__surface"><Slider label="Opacity" value={sliderValue} onChange={setSliderValue} formatValue={value => `${value}%`} /></div></Section>
      <Section title="Range and formatting" description="Two native slider inputs expose each endpoint to keyboard and assistive technology."><div className="docs-example__surface"><RangeSlider label="Budget" value={budget} onChange={setBudget} formatValue={value => `$${value}`} /></div></Section>
      <Section title="Disabled" description="A disabled range stays legible without accepting changes."><div className="docs-example__surface"><Slider label="Locked volume" defaultValue={60} isDisabled /></div></Section>
    </>;
    case 'social-button': return <>
      <Section title="Providers" description="Provider identity is data-driven, so the same component covers common sign-in choices."><div className="docs-example__social-grid">{socialProviderNames.map(provider => <SocialButton key={provider} provider={provider} size="small" onPress={() => onNotify(`${provider} selected.`)} />)}</div></Section>
      <Section title="Appearances and sizes" description="Brand, neutral, and outlined treatments keep the same structure."><div className="docs-example__surface docs-example__button-row"><SocialButton provider="google" appearance="brand" /><SocialButton provider="github" appearance="neutral" /><SocialButton provider="slack" size="small" /><SocialButton provider="figma" size="small" iconOnly /></div></Section>
      <Section title="Buttons and links" description="Use a button for a local action and a link for an OAuth route."><div className="docs-example__surface docs-example__button-row"><SocialButton provider="github" onPress={() => onNotify('GitHub sign-in selected.')} /><SocialButton provider="google" href={publicPath("/components/social-button")} /></div></Section>
    </>;
    default: return <BaseFinalExamples slug={slug} onNotify={onNotify} />;
  }
}
