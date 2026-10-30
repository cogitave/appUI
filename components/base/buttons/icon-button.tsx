'use client';

import {useMemo,useRef,type AnchorHTMLAttributes,type ButtonHTMLAttributes,type Ref} from 'react';
import {mergeRefs} from 'react-aria';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import { Button as AriaButton, ProgressBar as AriaProgressBar, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { AnimatePresence, motion } from 'motion/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Spinner } from '@/components/base/spinner/spinner';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type IconButtonSize = 'medium' | 'small' | 'xs';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onClick'> & Pick<AriaButtonProps, 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onClick' | 'isPending' | 'preventFocusOnPress'> & {
  icon: IconComponent;
  /** Animate a glyph change without moving or remounting its button. */
  iconKey?: string | number;
  pendingLabel?: string;
  size?: IconButtonSize;
  variant?: 'secondary' | 'ghost';
  badge?: number;
  ref?: Ref<HTMLButtonElement>;
  'aria-label': string;
};

export type IconLinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'aria-label'> & {
  icon: IconComponent;
  size?: IconButtonSize;
  'aria-label': string;
};

export function IconButton({ icon: Icon, iconKey, pendingLabel = 'Working', isPending, size = 'medium', variant = 'secondary', badge, className, type = 'button', disabled, value, ref, ...props }: IconButtonProps) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const root=useRef<HTMLButtonElement>(null),composed=useMemo(()=>mergeRefs(root,ref),[ref]),tokens=useMotionTokens(root);
  return <AriaButton {...props} ref={composed} type={type} value={value === undefined ? undefined : String(value)} isDisabled={disabled} isPending={isPending} data-size={size} data-variant={variant} className={cx('ui-icon-button', className)}>{iconKey === undefined ? <Icon className="ui-icon-button__icon" aria-hidden /> : <span className="ui-icon-button__glyph" aria-hidden><AnimatePresence initial={false}><motion.span key={iconKey} data-icon-key={iconKey} initial={reducedMotion ? false : { opacity: 0, scale: .65, y: 2 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: .65, y: -2 }} transition={{ duration: reducedMotion ? 0 : tokens.fast, ease: tokens.ease }}><Icon className="ui-icon-button__icon"/></motion.span></AnimatePresence></span>}<span className="ui-icon-button__pending" aria-hidden><Spinner size={size === 'medium' ? 'md' : 'sm'}/></span>{isPending && <AriaProgressBar aria-label={pendingLabel} isIndeterminate className="sr-only"/>}{badge !== undefined && badge > 0 && <span className="ui-icon-button__badge" aria-hidden>{badge > 99 ? '99+' : badge}</span>}</AriaButton>;
}

export function IconLinkButton({ icon: Icon, size = 'medium', className, ...props }: IconLinkButtonProps) {
  return <a data-size={size} className={cx('ui-icon-button', className)} {...props}><Icon className="ui-icon-button__icon" aria-hidden /></a>;
}
