'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import { RiLayoutLeftLine, RiSearchLine } from '@remixicon/react';
import { Announcement } from '@/components/base/announcement/announcement';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badge';
import { Kbd } from '@/components/base/kbd/kbd';
import { ThemeSwitch } from '@/components/base/theme-switch/theme-switch';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export interface SidebarItem {
  key: string;
  label: string;
  icon: IconComponent;
  href?: string;
  badge?: string | number;
}

export interface SidebarIdentity { name: string; initials: string; image?: string; email?: string }
export type SidebarSelectionVariant = 'accent' | 'neutral';
export interface SidebarProps {
  ref?: Ref<HTMLElement>;
  role?: 'dialog';
  'aria-modal'?: boolean;
  workspace: SidebarIdentity;
  user: SidebarIdentity;
  items: SidebarItem[];
  secondaryItems?: SidebarItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  selectionVariant?: SidebarSelectionVariant;
  onSelectionChange?: (key: string) => void;
  onWorkspaceClick?: () => void;
  onUserClick?: () => void;
  announcement?: { title: string; description: string; actionLabel?: string; onAction?: () => void };
  collapsed?: boolean;
  showThemeSwitch?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  'aria-label'?: string;
}

export function Sidebar({ ref, role, 'aria-modal': ariaModal, workspace, user, items, secondaryItems = [], selectedKey, defaultSelectedKey, selectionVariant = 'accent', onSelectionChange, onWorkspaceClick, onUserClick, announcement, collapsed, showThemeSwitch = false, defaultCollapsed = false, onCollapsedChange, className, 'aria-label': ariaLabel = 'Workspace navigation' }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalSelected, setInternalSelected] = useState(defaultSelectedKey ?? items[0]?.key);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const isCollapsed = collapsed === undefined ? internalCollapsed : collapsed;
  const selected = selectedKey === undefined ? internalSelected : selectedKey;
  const shownItems = items.filter(item => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const shownSecondary = secondaryItems.filter(item => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  useEffect(() => {
    if (!isCollapsed && query) searchRef.current?.focus();
  }, [isCollapsed, query]);

  function setCollapsed(next: boolean) {
    if (next) setQuery('');
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  function select(key: string) {
    if (selectedKey === undefined) setInternalSelected(key);
    onSelectionChange?.(key);
  }

  function navItem(item: SidebarItem) {
    const Icon = item.icon;
    const isSelected = item.key === selected;
    const content = <><Icon className="ui-app-sidebar__nav-icon" aria-hidden /><span className="ui-app-sidebar__nav-label">{item.label}</span>{item.badge !== undefined && <Badge color={isSelected && selectionVariant === 'accent' ? 'primary' : 'neutral'} className="ui-app-sidebar__badge">{item.badge}</Badge>}</>;
    const shared = { className: 'ui-app-sidebar__nav-item', 'aria-label': item.label, 'aria-current': isSelected ? 'page' as const : undefined, title: isCollapsed ? item.label : undefined, onClick: () => select(item.key) };
    return item.href ? <a key={item.key} {...shared} href={item.href}>{content}</a> : <button key={item.key} {...shared} type="button">{content}</button>;
  }

  return <aside ref={ref} role={role} aria-modal={ariaModal} className={cx('ui-app-sidebar', className)} data-selection-variant={selectionVariant} data-collapsed={isCollapsed || undefined} aria-label={ariaLabel} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (isCollapsed) setCollapsed(false); window.requestAnimationFrame(() => searchRef.current?.focus()); } }}>
    <div className="ui-app-sidebar__top">
      <div className="ui-app-sidebar__head">
        {onWorkspaceClick ? <button type="button" className="ui-app-sidebar__identity" aria-label={`Workspace: ${workspace.name}`} onClick={onWorkspaceClick}><Avatar size="md" initials={workspace.initials} src={workspace.image} alt={workspace.name} /><span>{workspace.name}</span></button> : <div className="ui-app-sidebar__identity"><Avatar size="md" initials={workspace.initials} src={workspace.image} alt={workspace.name} /><span>{workspace.name}</span></div>}
        <button type="button" className="ui-app-sidebar__collapse" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!isCollapsed} onClick={() => setCollapsed(!isCollapsed)}><RiLayoutLeftLine size={19} aria-hidden /></button>
      </div>
      <div className="ui-app-sidebar__search-wrap">
        <label className="ui-app-sidebar__search" aria-hidden={isCollapsed || undefined}><RiSearchLine size={18} aria-hidden /><input ref={searchRef} type="search" tabIndex={isCollapsed ? -1 : undefined} value={query} onChange={event => setQuery(event.target.value)} placeholder="Quick Search" aria-label="Search navigation" /><Kbd>⌘K</Kbd></label>
        <button type="button" className="ui-app-sidebar__search-rail" aria-label="Search navigation" tabIndex={isCollapsed ? undefined : -1} onClick={() => { setCollapsed(false); window.requestAnimationFrame(() => searchRef.current?.focus()); }}><RiSearchLine size={18} aria-hidden /></button>
      </div>
      <nav className="ui-app-sidebar__nav" aria-label="Primary navigation">{shownItems.map(navItem)}{shownItems.length === 0 && !isCollapsed && <span className="ui-app-sidebar__empty">No matching pages</span>}</nav>
    </div>
    <div className="ui-app-sidebar__bottom">
      {showThemeSwitch && <ThemeSwitch/>}
      {secondaryItems.length > 0 && <nav className="ui-app-sidebar__nav ui-app-sidebar__nav--secondary" aria-label="Secondary navigation">{shownSecondary.map(navItem)}</nav>}
      {announcement && <div className="ui-app-sidebar__announcement" aria-hidden={isCollapsed || undefined} inert={isCollapsed}><Announcement title={announcement.title} description={announcement.description} actionLabel={announcement.actionLabel} onAction={announcement.onAction} /></div>}
      {onUserClick ? <button type="button" className="ui-app-sidebar__user" aria-label={`Account: ${user.name}`} onClick={onUserClick}><Avatar size="sm" initials={user.initials} src={user.image} alt={user.name} /><span><strong>{user.name}</strong>{user.email && <small>{user.email}</small>}</span></button> : <div className="ui-app-sidebar__user"><Avatar size="sm" initials={user.initials} src={user.image} alt={user.name} /><span><strong>{user.name}</strong>{user.email && <small>{user.email}</small>}</span></div>}
    </div>
  </aside>;
}
