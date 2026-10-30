'use client';

import Link from 'next/link';
import { RiArrowRightLine, RiBarChartBoxLine, RiCodeSLine, RiFileTextLine, RiKeyboardLine, RiMoonLine, RiRobot2Line, RiStackLine, RiText } from '@remixicon/react';
import { AmbientRays } from '@/components/base/ambient-rays/ambient-rays';
import { Badge } from '@/components/base/badges/badge';
import { Button } from '@/components/base/buttons/button';
import { ButtonLink } from '@/components/base/buttons/button-link';
import { LinkButton } from '@/components/base/buttons/link-button';
import { ProfileCard } from '@/components/blocks/profile-card/profile-card';
import { ActivityRingsCard, MostActiveDaysCard, OrdersChartCard, SleepScoreCard, StepsCard } from '@/components/charts/chart-cards';
import { BrandMark } from '@/components/foundations/brand-mark';
import { InstallCommand } from '@/components/installation/install-command';
import { product } from '@/config/product';
import { catalog, readySlugs, type DocSlug } from './docs-data';

const available = catalog.filter(item => readySlugs.includes(item.slug as DocSlug));
const componentCount = available.filter(item => ['Base', 'Blocks', 'Charts'].includes(item.group)).length;
const chartCount = available.filter(item => item.group === 'Charts').length;
const templateCount = available.filter(item => item.group === 'Templates').length;
const features = [
  { icon: RiCodeSLine, title: 'Source you can edit', text: 'Install React and Tailwind source into your project. Adapt the components as your product grows, with your changes under your control.' },
  { icon: RiStackLine, title: 'Composed from one system', text: 'Start with base controls, combine them into blocks and use the same components in complete templates. Shared foundations keep them consistent.' },
  { icon: RiKeyboardLine, title: 'Keyboard friendly', text: 'Shared controls include keyboard navigation, focus states and accessible labels. Those behaviors carry through to the larger interfaces you compose.' },
  { icon: RiText, title: 'Consistent typography', text: 'Use complete type roles for size, weight, spacing and line height. The same roles give every screen a familiar visual rhythm.' },
  { icon: RiMoonLine, title: 'Two appearances', text: 'Semantic colors adapt the whole interface to light and dark themes. Controls, cards, charts and menus share the same appearance preference.' },
  { icon: RiBarChartBoxLine, title: 'Charts with detail', text: 'Show activity, progress and trends with responsive chart cards. Shared labels and small interactions help people explore the data.' },
];
const typeRoles = ['text-title-1-medium', 'text-title-2-medium', 'text-headline-medium', 'text-body-medium', 'text-caption-1-semibold'];

function CardGallery() {
  const cards = [
    <ProfileCard key="profile" profile={{ name: 'Maya Chen', birthDate: 'June 28, 1987', gender: 'Female', bloodType: 'A+', doctor: 'Dr. Avery' }} headingLevel="h3" />,
    <StepsCard key="steps" value="31,600" />,
    <SleepScoreCard key="sleep" />,
    <MostActiveDaysCard key="days" />,
    <ActivityRingsCard key="rings" />,
    <OrdersChartCard key="orders" />,
  ];
  return <div className="docs-overview__gallery" aria-hidden="true" inert data-docs-copy-ignore>
    <div className="docs-overview__gallery-scale"><div className="docs-overview__gallery-track">{[0, 1].map(copy => <div className="docs-overview__gallery-group" key={copy}>{cards.map((card, index) => <div className="docs-overview__gallery-card" key={index}>{card}</div>)}</div>)}</div></div>
  </div>;
}

export function GettingStartedOverview({ onNotify, onOpenTemplates }: { onNotify: (message: string) => void; onOpenTemplates: () => void }) {
  return <div className="docs-overview">
    <section className="docs-overview__hero" aria-label="Introducing appUI">
      <AmbientRays />
      <div className="docs-overview__hero-copy"><h2><span>React design system</span>{' '}<span>for everything you build.</span></h2><p>{product.name} brings together {componentCount} editable React components, including {chartCount} charts, and {templateCount} complete templates. Build dashboards, commerce, tools and more with shared color, type and motion.</p></div>
      <CardGallery />
    </section>

    <section className="docs-guide__section" id="why-appui"><h2>Why {product.name}</h2>
      <div className="docs-overview__features">{features.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={18} aria-hidden /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="docs-guide__section" id="installation"><h2>Installation</h2>
      <p>Start with a React 19 and Tailwind CSS 4 project. Keep your import alias and source location consistent if you use a shared workspace package.</p>
      <p className="docs-overview__lead">Initialize the foundations once to set up shared styles, tokens and component dependencies.</p>
      <InstallCommand action="init" onNotify={onNotify} />
      <p className="docs-overview__lead">Add the components you need. The CLI brings their shared dependencies into the same project.</p>
      <InstallCommand slug="button select date-picker" onNotify={onNotify} />
      {!product.cli.published && <p className="docs-overview__notice"><Badge variant="label">LOCAL RELEASE</Badge>The source CLI and local package work now. Public package publication is pending.</p>}
      <ButtonLink as={Link} href="/installation" trailingIcon={RiArrowRightLine}>Project setup and installation</ButtonLink>
    </section>

    <section className="docs-guide__section" id="mcp-server"><h2>MCP server <Badge variant="label">LOCAL RELEASE</Badge></h2>
      <p className="docs-overview__lead">Connect the local MCP server to find components, read their source and usage examples, inspect themes and plan installations. Its eight tools are read only; run the CLI to install a reviewed plan.</p>
      <div className="docs-overview__agent-tags"><Badge variant="pill"><RiCodeSLine size={14} aria-hidden />Code editors</Badge><Badge variant="pill"><RiRobot2Line size={14} aria-hidden />Coding assistants</Badge><Badge variant="pill"><RiFileTextLine size={14} aria-hidden />Editable source</Badge></div>
      <ButtonLink as={Link} href="/mcp" trailingIcon={RiArrowRightLine}>Explore MCP setup</ButtonLink>
      <LinkButton as={Link} href="/skill">Explore Agent Skills</LinkButton>
    </section>

    <section className="docs-guide__section" id="free-and-pro"><h2>Free and {product.name} Pro</h2>
      <div className="docs-overview__access-grid">
        <article><BrandMark size={48} /><h3>Free</h3><p>All base components, blocks and charts are free. Use their editable source and shared foundations without an account or a license key.</p><ButtonLink as={Link} href="/components" trailingIcon={RiArrowRightLine}>Browse components</ButtonLink></article>
        <article><BrandMark size={48} appearance="metal" /><h3>{product.templatePack.name}<Badge variant="label">PRO</Badge></h3><p>Complete templates use a license after registration. ${product.templatePack.suggestedUsd} is suggested; choose $0 or contribute any amount to support the library.</p><Button variant="secondary" trailingIcon={RiArrowRightLine} onClick={onOpenTemplates}>Choose your contribution</Button></article>
      </div>
    </section>

    <section className="docs-guide__section" id="color"><h2>Color</h2>
      <p className="docs-overview__lead">Semantic tokens connect text, surfaces, borders and chart colors. Switch appearance without changing component styles, and use the accent ramp to keep actions and selections consistent.</p>
      <div className="docs-overview__color-sample"><div aria-label="Accent color ramp">{[100, 200, 300, 400, 500, 600, 700].map(step => <span key={step} style={{ background: `var(--color-accent-${step})` }} />)}</div><code>accent-100 … accent-700 · surface-base · text-main · border-subtle</code></div>
      <ButtonLink as={Link} href="/components/color" trailingIcon={RiArrowRightLine}>Explore color tokens</ButtonLink>
    </section>

    <section className="docs-guide__section" id="typography"><h2>Typography</h2>
      <p className="docs-overview__lead">Each type role combines size, weight, line height and spacing. Use the whole role to give headings, body text and captions a consistent hierarchy.</p>
      <div className="docs-overview__type-sample">{typeRoles.map(role => <div key={role}><span className={role}>Design with clarity.</span><code>{role}</code></div>)}</div>
      <ButtonLink as={Link} href="/components/typography" trailingIcon={RiArrowRightLine}>Explore the type scale</ButtonLink>
    </section>
  </div>;
}
