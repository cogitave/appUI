'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/base/buttons/button';
import { SearchField } from '@/components/base/search-field/search-field';
import { Select, type SelectOption } from '@/components/base/select/select';
import { TagGroup, type TagItem } from '@/components/base/tag-group/tag-group';
import { cx } from '@/utils/cx';

export type FilterDefinition={id:string;label:string;options:SelectOption[];};
export type FilterBarProps={search:string;onSearchChange:(value:string)=>void;searchLabel?:string;filters?:FilterDefinition[];values?:Record<string,string>;onFilterChange?:(id:string,value:string|null)=>void;onReset?:()=>void;resultsLabel?:string;actions?:ReactNode;variant?:'plain'|'bordered';size?:'small'|'medium';className?:string;};

export function FilterBar({search,onSearchChange,searchLabel='Search results',filters=[],values={},onFilterChange,onReset,resultsLabel,actions,variant='plain',size='medium',className}:FilterBarProps) {
  const active:TagItem[]=filters.flatMap(filter=>{const choice=filter.options.find(option=>option.id===values[filter.id]);return choice?[{id:filter.id,label:`${filter.label}: ${choice.label}`}]:[];});
  return <section className={cx('ui-filter-bar',className)} data-variant={variant} data-size={size} aria-label="Results filters">
    <div className="ui-filter-bar__controls"><SearchField label={searchLabel} hideLabel placeholder={searchLabel} value={search} onChange={onSearchChange} size={size}/><div className="ui-filter-bar__selects">{filters.map(filter=><Select key={filter.id} options={filter.options} aria-label={filter.label} placeholder={`All ${filter.label.toLowerCase()}`} selectedKey={values[filter.id]??null} onSelectionChange={value=>onFilterChange?.(filter.id,value)}/>)}</div>{actions&&<div className="ui-filter-bar__actions">{actions}</div>}</div>
    {(active.length>0||resultsLabel||((search||active.length>0)&&onReset))&&<div className="ui-filter-bar__summary">{active.length>0&&<TagGroup label="Applied filters" hideLabel items={active} size="small" onRemove={keys=>keys.forEach(key=>onFilterChange?.(key,null))}/>}<span className="ui-filter-bar__results" role="status">{resultsLabel}</span>{(search||active.length>0)&&onReset&&<Button variant="ghost" size="xs" onClick={onReset}>Clear filters</Button>}</div>}
  </section>;
}
