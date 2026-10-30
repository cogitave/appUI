'use client';

import {useId, type FieldsetHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref} from 'react';
import {AnimatedHeight} from '@/components/base/animated-height/animated-height';
import {FieldSetDisabledContext, useFieldDisabled} from './field-context';
import {cx} from '@/utils/cx';

export type FieldOrientation = 'vertical' | 'horizontal' | 'responsive';
export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: FieldOrientation;
  ref?: Ref<HTMLDivElement>;
};

/** Layout for one shared labeled control. Its label and validation stay mounted. */
export function Field({orientation='vertical',children,className,...props}:FieldProps) {
  return <div {...props} className={cx('ui-field',className)}>
    <AnimatedHeight><div className="ui-field__layout" data-orientation={orientation}>{children}</div></AnimatedHeight>
  </div>;
}

export type FieldGroupProps = HTMLAttributes<HTMLDivElement> & {
  columns?: 1 | 2 | 3;
  density?: 'comfortable' | 'compact';
  ref?: Ref<HTMLDivElement>;
};

/** Container queries use this group's width, including inside a narrow dialog. */
export function FieldGroup({columns=1,density='comfortable',children,className,...props}:FieldGroupProps) {
  return <div {...props} className={cx('ui-field-group',className)} data-columns={columns} data-density={density}>
    <AnimatedHeight><div className="ui-field-group__content">{children}</div></AnimatedHeight>
  </div>;
}

export type FieldSetProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  legend: ReactNode;
  description?: string;
  variant?: 'plain' | 'outline' | 'soft';
  ref?: Ref<HTMLFieldSetElement>;
};

/** Native fieldset semantics plus shared disabled state for portaled controls. */
export function FieldSet({legend,description,variant='plain',disabled,children,className,'aria-describedby':describedBy,...props}:FieldSetProps) {
  const id=useId(),isDisabled=useFieldDisabled(disabled);
  return <FieldSetDisabledContext value={Boolean(isDisabled)}><fieldset {...props} disabled={isDisabled} className={cx('ui-field-set',className)} data-variant={variant} aria-describedby={[describedBy,description?id:undefined].filter(Boolean).join(' ')||undefined}>
    <legend className="ui-field-set__legend">{legend}</legend>
    <div className="ui-field-set__body">{description&&<p id={id} className="ui-field-set__description">{description}</p>}{children}</div>
  </fieldset></FieldSetDisabledContext>;
}
