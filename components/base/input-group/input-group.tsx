'use client';

import { Input, type InputProps } from '@/components/base/input/input';
import { Textarea, type TextareaProps } from '@/components/base/textarea/textarea';
import { cx } from '@/utils/cx';

export type InputGroupProps =
  | (InputProps & { kind?: 'input' })
  | (TextareaProps & { kind: 'textarea' });

/** Additions belong to the shared input surface; labels and validation stay shared. */
export function InputGroup(props: InputGroupProps) {
  if (props.kind === 'textarea') {
    const {kind: _, className, ...fieldProps} = props;
    return <Textarea {...fieldProps} className={cx('ui-input-group', className)}/>;
  }
  const {kind: _, className, ...fieldProps} = props;
  return <Input {...fieldProps} className={cx('ui-input-group', className)}/>;
}
