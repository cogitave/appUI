'use client';

import { Tabs as AriaTabs, TabList as AriaTabList, Tab as AriaTab, TabPanel as AriaTabPanel, type TabsProps as AriaTabsProps, type TabListProps as AriaTabListProps, type TabProps as AriaTabProps, type TabPanelProps as AriaTabPanelProps } from 'react-aria-components';
import { cx } from '@/utils/cx';
import type { Ref } from 'react';

export type TabsProps = AriaTabsProps & { variant?: 'underline' | 'pill'; className?: string; ref?:Ref<HTMLDivElement> };
export function Tabs({ variant = 'underline', className, ...props }: TabsProps) { return <AriaTabs {...props} data-variant={variant} className={cx('ui-tabs', className)} />; }
export function TabList<T extends object>({ className, ...props }: AriaTabListProps<T> & {ref?:Ref<HTMLDivElement>}) { return <AriaTabList {...props} className={typeof className === 'function' ? values => cx('ui-tabs__list', className(values)) : cx('ui-tabs__list', className)} />; }
export function Tab({ className, ...props }: AriaTabProps) { return <AriaTab {...props} className={typeof className === 'function' ? values => cx('ui-tabs__tab', className(values)) : cx('ui-tabs__tab', className)} />; }
export function TabPanel({ className, ...props }: AriaTabPanelProps) { return <AriaTabPanel {...props} className={typeof className === 'function' ? values => cx('ui-tabs__panel', className(values)) : cx('ui-tabs__panel', className)} />; }
