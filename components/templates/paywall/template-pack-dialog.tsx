'use client';

import { useState, type ElementType } from 'react';
import { InstallCommand } from '@/components/installation/install-command';
import { Button } from '@/components/base/buttons/button';
import { RiGiftLine, RiLayoutGridLine } from '@remixicon/react';
import { LinkButton } from '@/components/base/buttons/link-button';
import { BrandMark } from '@/components/foundations/brand-mark';
import { ContributionPicker, PricingDialog, PricingTable, type PricingPlan } from '@/components/templates/paywall/paywall';
import { product } from '@/config/product';

export function TemplatePackDialog({ isOpen, onOpenChange, onContribute, slug = 'templates', linkComponent }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onContribute?: (cents: number) => void | Promise<void>; slug?: string; linkComponent?: ElementType }) {
  const [showInstall, setShowInstall] = useState(false);
  const plans: PricingPlan[] = [
    { id: 'library', name: 'Component library', description: 'The building blocks for your next interface. Always free.', icon: <RiGiftLine size={22} aria-hidden/>, price: 'Free', priceNote: 'No account or key required', action: <div className="ui-paywall-action"><LinkButton as={linkComponent} href="/components" variant="neutral" onClick={() => onOpenChange(false)}>Browse components</LinkButton></div>, features: ['All components, blocks and charts', 'Editable React source', 'Light and dark themes'] },
    { id: 'templates', name: product.templatePack.name, description: 'Complete pages, ready to make your own. Support the library if you can.', icon: <RiLayoutGridLine size={22} aria-hidden/>, badge: 'PRO', price: '$0+', priceNote: `$${product.templatePack.suggestedUsd} suggested · Pay what you want`, highlighted: true, action: <ContributionPicker defaultAmount={product.templatePack.suggestedUsd} presets={product.templatePack.presetsUsd} onContinueFree={() => setShowInstall(true)} onContribute={onContribute}/>, features: ['Every current template', 'Editable source at any price', 'License after free registration'] },
  ];
  return <PricingDialog isOpen={isOpen} onOpenChange={onOpenChange} title="Build freely. Support if you can." description="Free components. Pay what you want for templates, including $0. Register to receive your template license." mark={<BrandMark size={56} appearance="metal"/>}>{!showInstall && <PricingTable plans={plans}/>} {showInstall && <section className="ui-pricing-install" aria-label="Template license" tabIndex={-1} ref={element => { if (element) { element.focus(); element.scrollIntoView({block: 'nearest', behavior: 'instant'}); } }}><Button size="small" variant="secondary" onClick={() => setShowInstall(false)}>Back to plans</Button><h3>Your template license</h3><p>Create an account to receive a license, including at $0. Registration is opening soon.</p><Button variant="secondary" disabled>Create an account</Button><InstallCommand action="login"/><InstallCommand slug={slug === 'templates' ? slug : `template-${slug}`}/></section>}</PricingDialog>;
}
