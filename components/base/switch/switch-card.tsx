'use client';

import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type SwitchCardProps = AriaSwitchProps & { title: string; description: string; className?: string };
export function SwitchCard({ title, description, className, ...props }: SwitchCardProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaSwitch {...props} isDisabled={isDisabled} className={cx('ui-switch-card', className)}><span className="ui-switch-card__copy"><strong>{title}</strong><small>{description}</small></span><span className="ui-switch__track" aria-hidden="true"><span className="ui-switch__thumb" /></span></AriaSwitch>;
}
