'use client';

import type { ReactNode } from 'react';
import { Checkbox as AriaCheckbox } from 'react-aria-components';
import type { CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { CheckboxGlyph } from './checkbox-glyph';

export type CheckboxCardProps = Omit<AriaCheckboxProps, 'children' | 'title'> & {
  title: ReactNode;
  description?: ReactNode;
};

export function CheckboxCard({ title, description, className, ...props }: CheckboxCardProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaCheckbox {...props} isDisabled={isDisabled} className={state => cx('ui-checkbox-card', typeof className === 'function' ? className(state) : className)}>
    {state => <><span className="ui-checkbox-card__copy"><strong>{title}</strong>{description != null && <span>{description}</span>}</span><CheckboxGlyph state={state} /></>}
  </AriaCheckbox>;
}
