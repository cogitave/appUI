import type { ReactNode } from 'react';
import { RiCheckboxCircleLine, RiErrorWarningLine, RiInformationLine, RiCloseCircleLine } from '@remixicon/react';
import { CloseButton } from '@/components/base/buttons/close-button';
import { cx } from '@/utils/cx';

export type AlertProps = {
  title: string;
  description?: ReactNode;
  tone?: 'information' | 'success' | 'warning' | 'error' | 'neutral';
  variant?: 'soft' | 'bordered';
  actions?: ReactNode;
  icon?: ReactNode;
  onDismiss?: () => void;
  role?: 'alert' | 'status' | 'note';
  className?: string;
};
const icons = { information: RiInformationLine, success: RiCheckboxCircleLine, warning: RiErrorWarningLine, error: RiCloseCircleLine, neutral: RiInformationLine };

/** Use alert/status only for a message introduced during an interaction. */
export function Alert({ title, description, tone = 'information', variant = 'soft', actions, icon, onDismiss, role = 'note', className }: AlertProps) {
  const Icon = icons[tone];
  return <div className={cx('ui-alert', className)} data-tone={tone} data-variant={variant} role={role}>
    <div className="ui-alert__icon" aria-hidden>{icon ?? <Icon size={20}/>}</div><div className="ui-alert__content"><strong>{title}</strong>{description && <div className="ui-alert__description">{description}</div>}{actions && <div className="ui-alert__actions">{actions}</div>}</div>{onDismiss && <CloseButton size="xs" aria-label={`Dismiss ${title}`} onClick={onDismiss}/>}
  </div>;
}
