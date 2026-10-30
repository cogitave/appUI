'use client';

import { useEffect, useState } from 'react';
import { RiArrowDownSLine, RiGitBranchLine, RiRouteLine, RiShieldCheckLine, RiSpeedUpLine } from '@remixicon/react';
import { Dropdown, DropdownPopover, DropdownTrigger } from '@/components/base/dropdown/dropdown';
import { Radio, RadioGroup } from '@/components/base/radio/radio';
import { LinkButton } from '@/components/base/buttons/link-button';
import { Button } from '@/components/base/buttons/button';

export type ComposerPermission = 'auto' | 'manual' | 'plan' | 'bypass';
export const COMPOSER_PERMISSIONS = [
  { id: 'auto', label: 'Auto', description: 'Let the agent choose when to ask.', icon: RiSpeedUpLine },
  { id: 'manual', label: 'Manual', description: 'Review changes before they are applied.', icon: RiGitBranchLine },
  { id: 'plan', label: 'Plan mode', description: 'Review a plan before work begins.', icon: RiRouteLine },
  { id: 'bypass', label: 'Bypass all', description: 'Proceed without approval prompts.', icon: RiShieldCheckLine },
] as const;

export type PermissionMenuProps = {
  value?: ComposerPermission;
  defaultValue?: ComposerPermission;
  onChange?: (permission: ComposerPermission) => void;
  learnMoreHref?: string;
  onLearnMore?: () => void;
  disabled?: boolean;
};

export function PermissionMenu({ value, defaultValue = 'auto', onChange, learnMoreHref, onLearnMore, disabled }: PermissionMenuProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = value ?? internal;
  const current = COMPOSER_PERMISSIONS.find(item => item.id === selected) ?? COMPOSER_PERMISSIONS[0];
  const Icon = current.icon;
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  return <Dropdown isOpen={open} onOpenChange={setOpen}>
    <DropdownTrigger className="ui-composer-permission__trigger" aria-label={`Permission: ${current.label}`} isDisabled={disabled}><Icon size={16} aria-hidden /><span>{current.label}</span><RiArrowDownSLine size={16} aria-hidden /></DropdownTrigger>
    <DropdownPopover aria-label="Permissions" placement="top start" offset={8} className="ui-composer-permission__popover">
      <header className="ui-composer-picker__heading"><span>Permissions</span>{learnMoreHref ? <LinkButton href={learnMoreHref} trailingIcon={false} onClick={() => setOpen(false)}>Learn more</LinkButton> : onLearnMore ? <Button variant="ghost" size="xs" onClick={() => { setOpen(false); onLearnMore(); }}>Learn more</Button> : null}</header>
      <RadioGroup aria-label="Permission mode" value={selected} onChange={next => { const permission = next as ComposerPermission; if (value === undefined) setInternal(permission); onChange?.(permission); setOpen(false); }} className="ui-composer-permission__options">
        {COMPOSER_PERMISSIONS.map(({ id, label, description, icon: OptionIcon }) => <Radio key={id} value={id}><OptionIcon size={20} aria-hidden /><span><strong>{label}</strong><small>{description}</small></span></Radio>)}
      </RadioGroup>
    </DropdownPopover>
  </Dropdown>;
}
