'use client';

import { useId, useState, type ReactNode } from 'react';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { RiCheckLine, RiCodeSLine, RiHeartLine } from '@remixicon/react';
import { Badge } from '@/components/base/badges/badge';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { LinkButton } from '@/components/base/buttons/link-button';
import { Input } from '@/components/base/input/input';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { cx } from '@/utils/cx';

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  price: ReactNode;
  priceNote: string;
  features: string[];
  action: ReactNode;
  highlighted?: boolean;
};

/** Presentational plan cards. Actions and entitlements belong to the caller. */
export function PricingTable({ plans }: { plans: PricingPlan[] }) {
  const [selected, setSelected] = useState(plans.find(plan => plan.highlighted)?.id ?? plans[0]?.id ?? '');
  return <div className="ui-pricing-table-wrap"><SegmentedControl className="ui-pricing-table__tabs" aria-label="Compare plans" value={selected} onValueChange={setSelected} options={plans.map(plan => ({value:plan.id,label:plan.name}))}/><div className="ui-pricing-table" style={{ '--plan-count': plans.length } as React.CSSProperties}>
    {plans.map(plan => <article key={plan.id} className="ui-pricing-plan" data-active={selected === plan.id} data-highlighted={plan.highlighted || undefined}>
      <header><div className="ui-pricing-plan__icon">{plan.icon}{plan.badge && <Badge variant="label">{plan.badge}</Badge>}</div><h3>{plan.name}</h3><p>{plan.description}</p></header>
      <div className="ui-pricing-plan__purchase"><div className="ui-pricing-plan__price"><strong>{plan.price}</strong><span>{plan.priceNote}</span></div>{plan.action}</div>
      <ul>{plan.features.map(feature => <li key={feature}><RiCheckLine size={20} aria-hidden/><span>{feature}</span></li>)}</ul>
    </article>)}
  </div></div>;
}

/** Converts decimal dollars to integer cents without rounding invalid input. */
export function parseContribution(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return cents <= 9999900 ? cents : null;
}

export type ContributionPickerProps = {
  defaultAmount?: number;
  presets?: readonly number[];
  onContinueFree: () => void;
  /** Called with integer USD cents. A server must create and validate checkout. */
  onContribute?: (amountInCents: number) => void | Promise<void>;
};

export function ContributionPicker({ defaultAmount = 1, presets = [0, 1, 5, 10, 15], onContinueFree, onContribute }: ContributionPickerProps) {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState('');
  const cents = parseContribution(amount);
  const invalid = cents === null;
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents !== null && cents % 100 === 0 ? 0 : 2 }).format((cents ?? 0) / 100);
  async function contribute() {
    if (!onContribute || cents === null || cents === 0 || pending) return;
    setFailure(''); setPending(true);
    try { await onContribute(cents); }
    catch { setFailure('Checkout could not open. Try again or continue for free.'); }
    finally { setPending(false); }
  }
  return <div className="ui-contribution-picker">
    <SegmentedControl aria-label="Suggested contribution" options={presets.map(value => ({ value: String(value), label: `$${value}`, isDisabled: pending }))} value={presets.some(value => value * 100 === cents) ? String((cents ?? 0) / 100) : ''} onValueChange={value => { setAmount(value); setFailure(''); }}/>
    <Input label="Your price (USD)" value={amount} onChange={value => { setAmount(value); setFailure(''); }} inputMode="decimal" leading="$" isDisabled={pending} maxLength={8} isInvalid={invalid} error={invalid ? 'Enter an amount from $0 to $99,999, with up to two decimal places.' : undefined}/>
    <div className="ui-paywall-action">
      {cents === 0 ? <Button leadingIcon={RiCodeSLine} onClick={onContinueFree}>Get a free license</Button> : <Button leadingIcon={RiHeartLine} disabled={invalid || !onContribute || pending} onClick={contribute}>{pending ? 'Opening checkout…' : invalid ? 'Choose an amount' : `Contribute ${formatted}`}</Button>}
    </div>
    <p className="ui-contribution-picker__notice" role="status">{failure || (!onContribute && cents !== 0 ? 'Contributions are coming soon. Choose $0 to create your account and get a free license.' : 'One license. Every current template. No subscription.')}</p>
  </div>;
}

export type PricingDialogProps = { isOpen: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; mark?: ReactNode; children: ReactNode; className?: string };
export function PricingDialog({ isOpen, onOpenChange, title, description, mark, children, className }: PricingDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  return <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="ui-pricing-overlay">
    <Modal className={cx('ui-pricing-modal', className)}><Dialog aria-labelledby={titleId} aria-describedby={descriptionId} className="ui-pricing-dialog">
      <CloseButton className="ui-pricing-dialog__close" size="md" aria-label="Close pricing" onClick={() => onOpenChange(false)}/>
      <header className="ui-pricing-dialog__intro">{mark}<h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></header>
      {children}
    </Dialog></Modal>
  </ModalOverlay>;
}
