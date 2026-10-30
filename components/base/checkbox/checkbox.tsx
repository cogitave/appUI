'use client';

import type { ReactNode } from 'react';
import { Checkbox as AriaCheckbox } from 'react-aria-components';
import type { CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { CheckboxGlyph, type CheckboxSize } from './checkbox-glyph';

export type CheckboxProps = Omit<AriaCheckboxProps, 'children'> & {
  children?: ReactNode;
  size?: CheckboxSize;
};

export function Checkbox({ children, size = 'md', className, ...props }: CheckboxProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  return <AriaCheckbox {...props} isDisabled={isDisabled} data-size={size} className={state => cx('ui-checkbox', typeof className === 'function' ? className(state) : className)}>
    {state => <><CheckboxGlyph state={state} size={size} />{children != null && <span className="ui-checkbox__label">{children}</span>}</>}
  </AriaCheckbox>;
}
