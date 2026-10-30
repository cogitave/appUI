'use client';

import { TagGroup as AriaTagGroup, TagList, Tag, Label, Text, Button, type Selection } from 'react-aria-components';
import { RiCloseLine } from '@remixicon/react';
import { Chip, type ChipColor } from '@/components/base/badges/chip';
import { cx } from '@/utils/cx';

export type TagItem = {id:string;label:string;color?:ChipColor;isDisabled?:boolean;};
export type TagGroupProps={items:TagItem[];label:string;hideLabel?:boolean;description?:string;selectionMode?:'none'|'single'|'multiple';selectedKeys?:string[];defaultSelectedKeys?:string[];onSelectionChange?:(keys:string[])=>void;onRemove?:(keys:string[])=>void;size?:'small'|'medium';emptyMessage?:string;className?:string;};

export function TagGroup({items,label,hideLabel=false,description,selectionMode='none',selectedKeys,defaultSelectedKeys,onSelectionChange,onRemove,size='medium',emptyMessage='No tags',className}:TagGroupProps) {
  function change(selection:Selection){onSelectionChange?.(selection==='all'?items.filter(item=>!item.isDisabled).map(item=>item.id):Array.from(selection,String));}
  return <AriaTagGroup selectionMode={selectionMode} selectionBehavior="toggle" selectedKeys={selectedKeys} defaultSelectedKeys={defaultSelectedKeys} onSelectionChange={change} onRemove={onRemove?keys=>onRemove(Array.from(keys,String)):undefined} className={cx('ui-tag-group',className)} data-size={size}>
    <Label className={cx('ui-input-field__label',hideLabel&&'sr-only')}>{label}</Label>
    <TagList items={items} className="ui-tag-group__list" renderEmptyState={()=> <span className="ui-tag-group__empty">{emptyMessage}</span>}>{item=><Tag id={item.id} textValue={item.label} isDisabled={item.isDisabled} className="ui-tag">{({isSelected,allowsRemoving})=><><Chip variant="subtle" color={isSelected?'primary':item.color??'neutral'}>{item.label}</Chip>{allowsRemoving&&<Button slot="remove" className="ui-tag__remove" aria-label={`Remove ${item.label}`}><RiCloseLine size={13} aria-hidden/></Button>}</>}</Tag>}</TagList>
    {description&&<Text slot="description" className="ui-input-field__message">{description}</Text>}
  </AriaTagGroup>;
}
