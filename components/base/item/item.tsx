'use client';

import { createContext, createElement, useContext, useId, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-aria-components';
import { RiArrowRightSLine } from '@remixicon/react';
import { Card, CardFooter, type CardProps } from '@/components/base/card/card';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type ItemSize = 'small' | 'medium' | 'large';
export type ItemVariant = 'plain' | 'outline' | 'soft';
type Appearance = { size?: ItemSize; variant?: ItemVariant; align?: 'center' | 'start' };
const ItemGroupContext = createContext<{size:ItemSize}|null>(null);

function ItemSurface({size='medium',variant='outline',align='center',className,...props}:Omit<CardProps,'variant'|'padding'> & Appearance) {
  return <Card {...props} padding="none" variant={variant==='soft'?'soft':'bordered'} data-item-variant={variant} data-size={size} data-align={align} className={cx('ui-item',className)}/>;
}

function ItemRow({children}:{children:ReactNode}) {
  const group=useContext(ItemGroupContext);
  return group ? <li className="ui-item-group__row">{children}</li> : children;
}

export type ItemProps = Omit<CardProps,'variant'|'padding'> & Appearance;
/** A content row. Keep its actions as their own buttons, links or controls. */
export function Item({size,...props}:ItemProps) {
  const group=useContext(ItemGroupContext);
  return <ItemRow><ItemSurface {...props} size={size ?? group?.size}/></ItemRow>;
}

export type ItemGroupProps = HTMLAttributes<HTMLUListElement> & {size?:ItemSize;spacing?:'separated'|'joined'};
/** Related rows retain native list semantics and ordinary Tab navigation. */
export function ItemGroup({size='medium',spacing='separated',className,...props}:ItemGroupProps) {
  return <ItemGroupContext.Provider value={{size}}><ul {...props} role="list" data-spacing={spacing} className={cx('ui-item-group',className)}/></ItemGroupContext.Provider>;
}

export function ItemMedia({variant='icon',className,...props}:HTMLAttributes<HTMLDivElement> & {variant?:'icon'|'avatar'|'image'}) {
  return <div aria-hidden={variant==='icon'||undefined} {...props} data-variant={variant} className={cx('ui-item-media',className)}/>;
}
export function ItemContent({className,...props}:HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('ui-item-content',className)}/>;
}
export function ItemTitle({as='div',className,...props}:HTMLAttributes<HTMLDivElement> & {as?:'div'|'h2'|'h3'|'h4'}) {
  return createElement(as,{...props,className:cx('ui-item-title',className)});
}
export function ItemDescription({lines='none',className,...props}:HTMLAttributes<HTMLParagraphElement> & {lines?:1|2|3|'none'}) {
  return <p {...props} data-lines={lines} className={cx('ui-item-description',className)}/>;
}
export function ItemActions({className,...props}:HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('ui-item-actions',className)}/>;
}
export function ItemHeader({className,...props}:HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('ui-item-header',className)}/>;
}
export function ItemFooter({className,...props}:HTMLAttributes<HTMLDivElement>) {
  return <CardFooter {...props} className={cx('ui-item-footer',className)}/>;
}

export type ItemLinkProps = Omit<LinkProps,'children'|'className'|'onPress'|'title'> & Appearance & {
  href:string;
  title:string;
  description?:string;
  media?:ReactNode;
  mediaVariant?:'icon'|'avatar'|'image';
  trailingIcon?:IconComponent;
  onNavigate?:(event:MouseEvent<HTMLElement>)=>void;
  className?:string;
};
/** One native link for the whole row; separate actions belong in Item. */
export function ItemLink({title,description,media,mediaVariant='icon',trailingIcon:TrailingIcon=RiArrowRightSLine,size,variant='outline',align='center',onNavigate,className,render,...props}:ItemLinkProps) {
  const group=useContext(ItemGroupContext),id=useId();
  const descriptionId=description?`${id}-description`:undefined;
  const describedBy=[props['aria-describedby'],descriptionId].filter(Boolean).join(' ')||undefined;
  return <ItemRow><Link {...props} aria-labelledby={props['aria-label']?undefined:props['aria-labelledby']??`${id}-title`} aria-describedby={describedBy} className={cx('ui-item-link',className)} render={(domProps,renderProps)=>{
    const linkProps={...domProps,onClick:(event:MouseEvent<HTMLAnchorElement>)=>{domProps.onClick?.(event);if(!event.defaultPrevented&&!props.isDisabled)onNavigate?.(event);}};
    if(props.isDisabled)return createElement('span',{...linkProps,href:undefined,target:undefined,rel:undefined,download:undefined});
    return render?render(linkProps,renderProps):createElement('a',linkProps);
  }}>
    <ItemSurface size={size??group?.size} variant={variant} align={align}>
      {media&&<ItemMedia variant={mediaVariant}>{media}</ItemMedia>}
      <ItemContent><ItemTitle id={`${id}-title`}>{title}</ItemTitle>{description&&<ItemDescription id={descriptionId}>{description}</ItemDescription>}</ItemContent>
      <ItemActions aria-hidden><TrailingIcon className="ui-item-link__arrow" data-directional={TrailingIcon===RiArrowRightSLine||undefined}/></ItemActions>
    </ItemSurface>
  </Link></ItemRow>;
}
