'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RiSparklingFill } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type AnnouncementProps = Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconComponent;
  actionLabel?: ReactNode;
  onAction?: () => void;
  dismissible?: boolean;
  closeLabel?: string;
  onClose?: () => void;
};

export function Announcement({
  title,
  description,
  icon: Icon = RiSparklingFill,
  actionLabel,
  onAction,
  dismissible = false,
  closeLabel = 'Dismiss announcement',
  onClose,
  className,
  ...props
}: AnnouncementProps) {
  const [open, setOpen] = useState(true);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -5, filter: 'blur(3px)' }}
          transition={{ duration: reduceMotion ? 0.01 : 0.2, ease: 'easeOut' }}
          className={cx('ui-announcement', className)}
          {...props}
        >
          <div className="ui-announcement__top">
            <Icon className="ui-announcement__icon" aria-hidden />
            {dismissible && <CloseButton size="xs" aria-label={closeLabel} onClick={() => setOpen(false)} />}
          </div>
          <div className="ui-announcement__copy">
            <p className="ui-announcement__title">{title}</p>
            {description && <p className="ui-announcement__description">{description}</p>}
          </div>
          {actionLabel && <Button variant="secondary" size="small" className="ui-announcement__action" onClick={onAction}>{actionLabel}</Button>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
