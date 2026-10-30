'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/base/buttons/button';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { BrandMark } from '@/components/foundations/brand-mark';
import { Installation } from '@/components/blocks/installation/installation';
import { InstallCommand } from '@/components/installation/install-command';
import { TemplatePackDialog } from '@/components/templates/paywall/template-pack-dialog';
import { product } from '@/config/product';

export function InstallationSection({ title, slug, isTemplate, snippet, onNotify }: { title: string; slug: string; isTemplate: boolean; snippet: string; onNotify: (message: string) => void }) {
  const [packOpen, setPackOpen] = useState(false);
  return <>
    <Installation id="installation" description={isTemplate ? `${title} is part of the appUI Template Pack.` : `${title} is free to use.`} themeNote={<>Dark mode ready — this component uses shared appUI semantic tokens. <Link href="/theme-setup">Set up theme switching.</Link></>} title={isTemplate ? `${title} is a Pro template.` : `${title} is a free component.`} summary={isTemplate ? 'Template activation and distribution are pending. Use the owner source checkout for local template development.' : 'Add this component and its shared dependencies directly to your project with the local CLI. No account or license key is required.'} mark={<BrandMark size={56} appearance="metal"/>} badge={isTemplate ? 'PRO TEMPLATE' : 'FREE'} steps={[
      {title:isTemplate ? 'Local template access' : 'Install the component',description:isTemplate ? <>The local registry includes free components, blocks and charts. Template distribution is pending.</> : <>The CLI adds the source, styles and dependencies to your React 19 / Tailwind CSS 4 project.</>,content:<InstallCommand slug={isTemplate ? `template-${slug}` : slug} onNotify={onNotify}/>},
      {title:'Use it in your project',description:'Import the installed component and adapt the source to your needs.',content:<CodeBlock label="Usage" examples={[{value:'tsx',label:'tsx',code:snippet.replaceAll('\\n','\n')}]} onCopy={onNotify}/>},
    ]} footer={isTemplate ? <><strong>All current templates. Pay what you want.</strong><p>${product.templatePack.suggestedUsd} suggested · $0 welcome · Contributions are optional.</p></> : <><strong>Components, blocks and charts stay free.</strong><p>Shared source, styles and motion. No activation required.</p></>} action={isTemplate ? <Button variant="secondary" onClick={() => setPackOpen(true)}>Template access details</Button> : undefined} note={<>Source installs under <code>src/components/{product.cli.sourceDirectory}</code> when the project uses a src directory. Configure paths and aliases in <code>appui.json</code>. Template pages use Next.js App Router.{!product.cli.published && <> Public CLI publication is pending.</>}</>}/>
    <TemplatePackDialog linkComponent={Link} isOpen={packOpen} onOpenChange={setPackOpen} slug={slug}/>
  </>;
}
