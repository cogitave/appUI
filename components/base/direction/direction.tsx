'use client';

import type { HTMLAttributes } from 'react';
import { I18nProvider, useLocale } from 'react-aria-components';
import { cx } from '@/utils/cx';

type ScopeProps = Omit<HTMLAttributes<HTMLDivElement>, 'dir'>;
export type DirectionProps = ScopeProps & (
  | { locale: string; dir?: never }
  | { dir: 'ltr' | 'rtl'; locale?: never }
);

function DirectionScope({className, ...props}: ScopeProps) {
  const {direction} = useLocale();
  return <div {...props} className={cx('ui-direction', className)} dir={direction}/>;
}

/** Keep DOM direction and accessible controls, including portals, in one scope.
 * Prefer locale for localized content. Direction-only scopes use en-US/ar-AE.
 */
export function Direction({locale, dir, ...props}: DirectionProps) {
  const scopedLocale = locale ?? (dir === 'rtl' ? 'ar-AE' : 'en-US');
  return <I18nProvider locale={scopedLocale}><DirectionScope {...props} lang={props.lang ?? locale}/></I18nProvider>;
}
