'use client';

import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badge';
import { BrandMark } from '@/components/foundations/brand-mark';
import { TemplatePackDialog } from './template-pack-dialog';

export function PaywallTemplate({ onAction }: { onAction?: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  return <section className="ui-paywall-template">
    <header><BrandMark size={30}/><strong>appUI</strong><Badge variant="pill">PRO TEMPLATE</Badge></header>
    <div className="ui-paywall-template__hero"><span>PAY WHAT YOU WANT</span><h1>A head start for your next idea.</h1><p>Explore the complete template collection. Create an account, choose your contribution (including $0), then use your license to install templates with the CLI.</p><Button onClick={() => setOpen(true)}>Get your template license</Button><small>$1 suggested · $0 welcome · Same complete source</small></div>
    <div className="ui-paywall-template__features">{[['Build faster','Complete dashboards, commerce, tools and product pages.'],['Make it yours','Editable React source with shared components and themes.'],['Give what you can','An optional contribution supports the free library.']].map(([title,description]) => <article key={title}><h2>{title}</h2><p>{description}</p></article>)}</div>
    <TemplatePackDialog isOpen={open} onOpenChange={value => { setOpen(value); if (!value) onAction?.('Pricing closed.'); }}/>
  </section>;
}
