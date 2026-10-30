'use client';

import { publicPath } from '@/config/deployment';
import type { ThemeChangeEvent } from '@/utils/theme-transition';

import { RiCheckLine, RiFileCopyLine, RiMoonLine, RiSunLine } from '@remixicon/react';
import { accents, semanticColors, typeSpecimens } from '@/components/foundations/foundation-data';
import type { Accent, Theme } from '@/hooks/use-appearance';
import { cx } from '@/utils/cx';

type ColorProps = {
  theme: Theme;
  accent: Accent;
  setTheme: (theme: Theme, event?: ThemeChangeEvent) => void;
  setAccent: (accent: Accent) => void;
  onNotify: (message: string) => void;
};

const colorGroups = ['Surfaces', 'Text', 'Borders', 'Actions', 'Feedback'] as const;
const accentSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
const weights = ['regular', 'medium', 'semibold', 'bold'] as const;

function getThemeCss(theme: Theme) {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;pointer-events:none';
  document.body.appendChild(probe);
  const colorTokens = [...new Set([
    ...semanticColors.map(item => item.token),
    '--surface-overlay', '--accent-label', '--accent-quiet', '--danger-soft', '--focus-ring',
    ...accentSteps.map(step => `--color-accent-${step}`),
  ])];
  const colorLines = colorTokens.map(token => {
    probe.style.backgroundColor = `var(${token})`;
    return `  ${token}: ${getComputedStyle(probe).backgroundColor};`;
  });
  const shadowLines = ['--shadow-control', '--shadow-panel', '--shadow-sidebar', '--shadow-menu'].map(token => {
    probe.style.boxShadow = `var(${token})`;
    return `  ${token}: ${getComputedStyle(probe).boxShadow};`;
  });
  probe.remove();
  return [`/* appUI · ${theme} appearance */`, `${theme === 'dark' ? ':root.dark' : ':root'} {`, ...colorLines, ...shadowLines, '}'].join('\n');
}

export function ColorFoundation({ theme, accent, setTheme, setAccent, onNotify }: ColorProps) {
  async function copyTheme() {
    try {
      await navigator.clipboard.writeText(getThemeCss(theme));
      onNotify(`${theme === 'dark' ? 'Dark' : 'Light'} theme CSS copied.`);
    } catch {
      onNotify('Could not copy theme CSS.');
    }
  }

  return <div className="foundation-docs">
    <section className="foundation-section foundation-story" id="how-color-works">
      <div className="foundation-section__heading"><span>01 / FOUNDATION</span><h2>How color works</h2></div>
      <p>Start with a carefully tuned palette, then assign each color a purpose. Components read the semantic role, so a surface, label, or action stays consistent across appearances.</p>
    </section>

    <section className="foundation-section" id="appearances">
      <div className="foundation-theme-card">
        <div className="foundation-theme-card__head">
          <div><span className="foundation-eyebrow">A SINGLE VISUAL LANGUAGE</span><h2>One system. Two appearances.</h2><p>Colors and shadows respond together when the appearance changes.</p></div>
          <div className="foundation-theme-switch" role="group" aria-label="Appearance"><button type="button" aria-label="Light appearance" aria-pressed={theme === 'light'} onClick={event => setTheme('light', event)}><RiSunLine size={17} aria-hidden /></button><button type="button" aria-label="Dark appearance" aria-pressed={theme === 'dark'} onClick={event => setTheme('dark', event)}><RiMoonLine size={17} aria-hidden /></button></div>
        </div>
        <div className="foundation-theme-card__steps">
          <div><span>01</span><strong>Choose a role</strong><p>Name the job of each color, from a canvas to an interactive edge.</p></div>
          <div><span>02</span><strong>Set each appearance</strong><p>Keep the same token name while its value adapts to the surroundings.</p></div>
          <div><span>03</span><strong>Compose freely</strong><p>Build components from the shared roles and elevation levels.</p></div>
        </div>
        <div className="foundation-theme-card__foot"><span><RiCheckLine size={15} aria-hidden /> Your choice is saved automatically.</span><button type="button" onClick={copyTheme}><RiFileCopyLine size={15} aria-hidden /> Copy current theme CSS</button></div>
      </div>
    </section>

    <section className="foundation-section" id="semantic-roles">
      <div className="foundation-section__heading"><span>02 / TOKENS</span><h2>Semantic roles</h2></div>
      <p>A role describes intent. Its swatch updates as you change the appearance or accent.</p>
      <div className="foundation-token-groups">
        {colorGroups.map(group => <div className="foundation-token-group" key={group}><h3>{group}</h3><div className="foundation-token-table">{semanticColors.filter(item => item.group === group).map(item => <div className="foundation-token-row" key={item.token}><span className="foundation-token-row__swatch" style={{ background: `var(${item.token})` }} /><div><strong>{item.label}</strong><small>{item.note}</small></div><code>{item.token}</code></div>)}</div></div>)}
      </div>
    </section>

    <section className="foundation-section" id="accent-ramp">
      <div className="foundation-section__heading"><span>03 / EXPRESSION</span><h2>Accent ramp</h2></div>
      <p>Ten complete palettes carry through actions, selected navigation and subtle emphasis. Feedback keeps its own semantic colors so success, warning and error retain their meaning.</p>
      <div className="foundation-accent-choices" role="group" aria-label="Accent color">{accents.map(item => <button type="button" key={item.id} className={cx('foundation-accent-choice', accent === item.id && 'is-selected')} aria-pressed={accent === item.id} onClick={() => setAccent(item.id)}><span style={{ background: item.swatch }} />{item.label}{accent === item.id && <RiCheckLine size={15} aria-hidden />}</button>)}</div>
      <div className="foundation-accent-ramp">{accentSteps.map(step => <div key={step}><span style={{ background: `var(--color-accent-${step})` }} /><code>{step}</code></div>)}</div>
    </section>
  </div>;
}

export function TypographyFoundation() {
  return <div className="foundation-docs foundation-docs--type">
    <section className="foundation-section foundation-type-intro" id="the-scale"><span className="foundation-eyebrow">THE TYPE SYSTEM</span><h2>Clarity at every size.</h2><p>Thirteen roles keep the hierarchy deliberate, from large editorial moments to compact interface labels. Inter’s optical sizing brings balance to each step.</p><div><strong>13</strong><span>TYPE ROLES</span><strong>4</strong><span>WEIGHTS PER ROLE</span></div></section>
    <section className="foundation-section" id="type-roles"><div className="foundation-section__heading"><span>01 / HIERARCHY</span><h2>Type roles</h2></div><p>Each role pairs a font size, line height, and tracking value. Choose by the content’s place in the hierarchy.</p><div className="foundation-type-list">{typeSpecimens.map(item => <div className="foundation-type-row" key={item.name}><div><strong>{item.name}</strong><code>{item.metric}</code></div><span className={item.className}>{item.sample}</span></div>)}</div></section>
    <section className="foundation-section" id="weights"><div className="foundation-section__heading"><span>02 / EMPHASIS</span><h2>Weights</h2></div><p>Regular carries reading. Medium and semibold guide attention. Bold is reserved for moments that need a firm anchor.</p><div className="foundation-weight-grid">{weights.map(weight => <div key={weight}><span>{weight}</span><strong className={`text-title-1-${weight}`}>Design with purpose</strong><code>{weight === 'regular' ? 400 : weight === 'medium' ? 500 : weight === 'semibold' ? 600 : 700}</code></div>)}</div></section>
    <section className="foundation-section" id="usage"><div className="foundation-section__heading"><span>03 / COMPOSITION</span><h2>Usage</h2></div><div className="foundation-type-usage"><span className="text-caption-1-semibold">PRODUCT UPDATE / 09.2026</span><h3 className="text-display-4-semibold">A calmer way to work.</h3><p className="text-body-regular">Clear type helps people scan, understand, and act without effort. Keep the number of levels small and let space carry the rest.</p><a href={publicPath("/components/announcement")}>Explore components <span aria-hidden="true">→</span></a></div></section>
  </div>;
}
