'use client';

import { Radio as AriaRadio, type RadioProps as AriaRadioProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';

export type RadioCardProps = Omit<AriaRadioProps, 'children'> & { title: string; description: string; className?: string };
export function RadioCard({ title, description, className, ...props }: RadioCardProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaRadio {...props} isDisabled={isDisabled} className={cx('ui-radio-card', className)}><span className="ui-radio__control" aria-hidden="true" /><span><strong>{title}</strong><small>{description}</small></span></AriaRadio>;
}
