'use client';

import { useState, type ReactNode } from 'react';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Badge } from '@/components/base/badges/badge';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { Tabs, Tab, TabList, TabPanel } from '@/components/base/tabs/tabs';
import { product } from '@/config/product';
import { sectionId } from './docs-data';

export const cliSpec = `${product.cli.packageName}@${product.cli.tag}`;
export const cliCommand = product.cli.published ? `npx ${cliSpec}` : 'node /path/to/appUI/packages/cli/bin/appui.mjs';
export const installedRoot = `@/components/${product.cli.sourceDirectory}`;

export function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="docs-guide__section" id={sectionId(title)}><h2>{title}</h2>{children}</section>;
}

export function GuideReleaseNote({ feature = 'CLI' }: { feature?: 'CLI' | 'MCP' | 'Skills' }) {
  const published = feature === 'CLI' ? product.cli.published : feature === 'MCP' ? product.integrations.mcpPublished : product.integrations.skillsPublished;
  const localAvailable = feature === 'CLI' ? product.cli.localAvailable : feature === 'MCP' ? product.integrations.mcpLocalAvailable : product.integrations.skillsLocalAvailable;
  if (localAvailable && !published) return <div className="docs-guide__release-note"><Badge variant="label">LOCAL RELEASE</Badge><p>{feature === 'CLI' ? 'The source installer is' : feature === 'MCP' ? 'The MCP server is' : 'The agent skill is'} available from this checkout or a local package. Public npm publication is pending.</p></div>;
  return !published && <div className="docs-guide__release-note"><Badge variant="label">IN DEVELOPMENT</Badge><p>{feature === 'Skills' ? 'The agent skill is' : `The ${feature} is`} in development. Installation commands are not published yet.</p></div>;
}

export function GuideCode({ label = 'terminal', code, onNotify }: { label?: string; code: string; onNotify: (message: string) => void }) {
  return <CodeBlock label={label} examples={[{ value: label, label, code }]} onCopy={onNotify} />;
}

export function GuideSteps({ steps }: { steps: { title: string; description?: ReactNode; content: ReactNode }[] }) {
  return <ol className="docs-guide__steps">{steps.map((step, index) => <li key={step.title}><span className="docs-guide__step-index" aria-hidden>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3>{step.description && <p>{step.description}</p>}{step.content}</div></li>)}</ol>;
}

export function GuideTabs({ label, options }: { label: string; options: { id: string; label: string; icon?: ReactNode; content: ReactNode }[] }) {
  const [selected, setSelected] = useState(options[0].id);
  return <Tabs className="docs-guide__tabs" selectedKey={selected} onSelectionChange={key => setSelected(String(key))}>
    <TabList aria-label={label}>{options.map(option => <Tab id={option.id} key={option.id}>{option.icon}{option.label}</Tab>)}</TabList>
    <AnimatedHeight>{options.map(option => <TabPanel id={option.id} key={option.id}><div className="docs-guide__tab-content">{option.content}</div></TabPanel>)}</AnimatedHeight>
  </Tabs>;
}
