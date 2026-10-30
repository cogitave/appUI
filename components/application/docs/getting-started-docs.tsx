'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/base/badges/badge';
import { Button } from '@/components/base/buttons/button';
import { LinkButton } from '@/components/base/buttons/link-button';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { ThemeSwitch } from '@/components/base/theme-switch/theme-switch';
import { GettingStartedOverview } from './getting-started-overview';
import { InstallCommand } from '@/components/installation/install-command';
import { TemplatePackDialog } from '@/components/templates/paywall/template-pack-dialog';
import { product } from '@/config/product';
import { GuideSection, GuideReleaseNote as ReleaseNote, installedRoot } from './guide-parts';
import { InstallationGuide } from './installation-guide';
import { McpGuide } from './mcp-guide';
import { AgentSkillsGuide } from './agent-skills-guide';
import { ComponentCatalog } from './component-catalog';
import type { GuideSlug } from './getting-started-pages';

export function GettingStartedDocs({ slug, onNotify }: { slug: GuideSlug; onNotify: (message: string) => void }) {
  const [packOpen, setPackOpen] = useState(false);
  return <div className="docs-guide">
    {slug === 'getting-started' && <GettingStartedOverview onNotify={onNotify} onOpenTemplates={() => setPackOpen(true)} />}

    {slug === 'installation' && <InstallationGuide onNotify={onNotify}/>}
    {slug === 'mcp' && <McpGuide onNotify={onNotify}/>}
    {slug === 'skill' && <AgentSkillsGuide onNotify={onNotify}/>}
    {slug === 'components' && <ComponentCatalog/>}

    {slug === 'theme-setup' && <>
      <GuideSection title="Shared styles">
        <p>Load the generated global stylesheet once at your application entry point. Render AppearanceInitializer once to restore saved theme preferences. All components share these semantic tokens.</p>
        <CodeBlock label="Global styles" onCopy={onNotify} examples={[
          { value: 'next', label: 'Next.js', code: `// app/layout.tsx\nimport type { ReactNode } from 'react';\nimport { Inter, JetBrains_Mono } from 'next/font/google';\nimport { AppearanceInitializer } from '${installedRoot}/foundations/appearance-initializer';\nimport '@/styles/globals.css';\n\nconst inter = Inter({ subsets: ['latin'], variable: '--font-inter' });\nconst mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-source' });\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en" className={\`\${inter.variable} \${mono.variable}\`} suppressHydrationWarning>\n      <body><AppearanceInitializer />{children}</body>\n    </html>\n  );\n}` },
          { value: 'vite', label: 'Vite', code: `// src/main.tsx\nimport '@/styles/globals.css';\nimport { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { AppearanceInitializer } from '${installedRoot}/foundations/appearance-initializer';\nimport { App } from './App';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode><AppearanceInitializer /><App /></StrictMode>\n);` },
        ]} />
        <p>Use Inter for interface text and JetBrains Mono for code. The Next.js example loads both fonts. In Vite, load them with your font setup and set <code>--font-inter</code> and <code>--font-mono-source</code> on the root.</p>
        <div className="docs-guide__actions"><LinkButton as={Link} href="/components/color">Color foundations</LinkButton><LinkButton as={Link} href="/components/typography" variant="neutral">Typography foundations</LinkButton></div>
      </GuideSection>
      <GuideSection title="Switch appearance">
        <p>Add the shared Theme Switch. It keeps the root appearance and saved preference in sync, with a reveal that starts from the pressed control.</p>
        <InstallCommand slug="theme-switch" onNotify={onNotify} />
        <CodeBlock label="Theme switch usage" onCopy={onNotify} examples={[{ value: 'tsx', label: 'tsx', code: `import { ThemeSwitch } from '${installedRoot}/base/theme-switch/theme-switch';\n\nexport function Appearance() {\n  return <ThemeSwitch />;\n}` }]} />
      </GuideSection>
      <GuideSection title="Try the theme">
        <div className="docs-guide__theme-demo"><header><div><Badge variant="label">LIVE PREVIEW</Badge><p>One set of controls. Both appearances.</p></div><ThemeSwitch /></header><div className="docs-guide__actions"><Button onClick={() => onNotify('Primary button pressed.')}>Get started</Button><Button variant="secondary" onClick={() => onNotify('Secondary button pressed.')}>Secondary action</Button><Badge color="primary">Ready</Badge></div></div>
      </GuideSection>
      <GuideSection title="Motion preferences">
        <p>The shared controls respect reduced motion. Apply the same preference to your own transitions, and use semantic colors instead of fixed light or dark values.</p>
        <CodeBlock label="Semantic surface" onCopy={onNotify} examples={[{ value: 'css', label: 'css', code: `.my-surface {\n  background: var(--surface-raised);\n  color: var(--text-main);\n  border: 1px solid var(--border-subtle);\n  transition: background-color 150ms ease;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .my-surface { transition: none; }\n}` }]} />
      </GuideSection>
    </>}

    {slug === 'template-access' && <>
      <GuideSection title="Choose your contribution">
        <div className="docs-guide__callout"><div><Badge variant="label">$0 WELCOME</Badge><h3>Complete templates, your choice of price.</h3><p>${product.templatePack.suggestedUsd} is suggested. Choose {product.templatePack.presetsUsd.map(amount => `$${amount}`).join(', ')} or enter your own amount. Every choice includes the same editable template source.</p><p>Account registration and contributions are opening soon.</p></div><Button onClick={() => setPackOpen(true)}>View template plans</Button></div>
        <p>Base components, blocks and charts remain free without an account or key. The PRO label marks templates that use the template license, including at $0.</p>
      </GuideSection>
      <GuideSection title="Activate your license">
        <p>Once registration opens, create an account and choose your contribution to receive a license. Replace the placeholder below with your own key; activation is needed once per machine.</p>
        <InstallCommand action="login" onNotify={onNotify} />
        <ReleaseNote />
      </GuideSection>
      <GuideSection title="Add a template">
        <p>Add the template directly to your project, then adapt its source. Templates compose the same components you use throughout the library.</p>
        <InstallCommand slug="template-ai-chat" onNotify={onNotify} />
        <div className="docs-guide__actions"><LinkButton as={Link} href="/components/ai-chat">Explore AI Chat</LinkButton><LinkButton as={Link} href="/components/paywall" variant="neutral">Explore Paywall</LinkButton></div>
      </GuideSection>
    </>}
    <TemplatePackDialog linkComponent={Link} isOpen={packOpen} onOpenChange={setPackOpen} slug="ai-chat" />
  </div>;
}
