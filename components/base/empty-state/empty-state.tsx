import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';

export type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'plain' | 'bordered' | 'soft';
  className?: string;
};

export function EmptyState({ title, description, icon, actions, children, size = 'medium', variant = 'plain', className }: EmptyStateProps) {
  return <div className={cx('ui-empty-state', className)} data-size={size} data-variant={variant}>
    {icon && <div className="ui-empty-state__icon" aria-hidden>{icon}</div>}<h3>{title}</h3>{description && <p>{description}</p>}{actions && <div className="ui-empty-state__actions">{actions}</div>}{children && <div className="ui-empty-state__detail">{children}</div>}
  </div>;
}
