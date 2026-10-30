'use client';

import { ComboBox as AriaComboBox, ComboBoxStateContext, Group, Label, Input, Button, Popover, ListBox, ListBoxItem, Text, type ComboBoxProps as AriaComboBoxProps } from 'react-aria-components';
import {useContext,useEffect,useRef,type ReactNode,type RefObject} from 'react';
import { RiArrowDownSLine, RiCheckLine, RiSearchLine } from '@remixicon/react';
import type { SelectOption } from '@/components/base/select/select';
import { Spinner } from '@/components/base/spinner/spinner';
import { cx } from '@/utils/cx';
import { FieldFeedback } from '@/components/base/input/field-feedback';
import { useFieldDisabled } from '@/components/base/field/field-context';
import { useAnchorScrollGuard } from '@/hooks/use-anchor-scroll-guard';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';

function DisabledComboBoxCloser({isDisabled}:{isDisabled?:boolean}) {
  const state=useContext(ComboBoxStateContext);
  useEffect(()=>{if(isDisabled&&state?.isOpen)state.close();},[isDisabled,state]);
  return null;
}

function ComboBoxSurface({anchor,density,children}:{anchor:RefObject<Element|null>;density:ComboBoxProps['density'];children:(isExiting:boolean)=>ReactNode}) {
  const state=useContext(ComboBoxStateContext);
  const ignoreScrollClose=useAnchorScrollGuard(Boolean(state?.isOpen),anchor);
  return <Popover isOpen={Boolean(state?.isOpen)} onOpenChange={open=>{if(!open&&!ignoreScrollClose())state?.close();}} data-density={density} className="ui-combobox__popover" placement="bottom start" offset={6} maxHeight={312}>{({isExiting})=>children(isExiting)}</Popover>;
}

export type ComboBoxProps = Omit<AriaComboBoxProps<SelectOption>, 'children' | 'className' | 'items' | 'defaultItems'> & {
  options: SelectOption[];
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  isLoading?: boolean;
  emptyLabel?: string;
  size?: 'medium' | 'small';
  density?: 'comfortable' | 'compact' | 'touch';
  className?: string;
};

export function ComboBox({ options, label, hideLabel = false, placeholder = 'Search options', hint, error, isInvalid, isLoading = false, emptyLabel = 'No matching options', size = 'medium', density = 'comfortable', className, ...props }: ComboBoxProps) {
  const isDisabled = useFieldDisabled(props.isDisabled);
  const anchor=useRef<HTMLDivElement>(null);
  const input=useRef<HTMLInputElement>(null);
  return <AriaComboBox {...props} isDisabled={isDisabled} defaultItems={options} isInvalid={error ? true : isInvalid} allowsEmptyCollection aria-busy={isLoading || undefined} className={cx('ui-combobox', className)} data-size={size}>
    <DisabledComboBoxCloser isDisabled={isDisabled}/>
    <Label className={cx('ui-input-field__label', hideLabel && 'sr-only')}>{label}{props.isRequired && <span aria-hidden>*</span>}</Label>
    <Group ref={anchor} className="ui-combobox__control"><RiSearchLine size={16} className="ui-combobox__search" aria-hidden/><Input ref={input} placeholder={placeholder} className="ui-combobox__input"/><Button className="ui-combobox__toggle" aria-label={`Show ${label.toLowerCase()} options`}>{isLoading ? <Spinner size="sm"/> : <RiArrowDownSLine size={16} aria-hidden/>}</Button></Group>
    <ComboBoxSurface anchor={anchor} density={density}>{isExiting=><div className="ui-combobox__surface" inert={isExiting || Boolean(isDisabled)}><ScrollArea indicatorPlacement="gutter" label={`${label} options`} className="ui-combobox__scroll" preservePointerFocus focusRef={input} renderViewport={({ref,className:viewportClassName})=><ListBox<SelectOption> ref={ref} className={cx('ui-combobox__list',viewportClassName)} renderEmptyState={() => <div className="ui-combobox__empty" role="status">{isLoading ? 'Loading options' : emptyLabel}</div>}>
      {item => <ListBoxItem<SelectOption> id={item.id} textValue={item.label} isDisabled={item.isDisabled} className="ui-combobox__option"><span className="ui-combobox__option-leading" aria-hidden>{item.leading}</span><span><Text slot="label" className="ui-combobox__option-label">{item.label}</Text>{item.detail && <Text slot="description" className="ui-combobox__option-description">{item.detail}</Text>}</span><RiCheckLine size={16} className="ui-combobox__check" aria-hidden/></ListBoxItem>}
    </ListBox>}/></div>}</ComboBoxSurface>
    <FieldFeedback hint={hint} error={error}/>
  </AriaComboBox>;
}
