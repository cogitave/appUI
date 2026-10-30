import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '@/utils/cx';

export type CardProps = HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement>; variant?: 'bordered' | 'raised' | 'soft'; padding?: 'none' | 'small' | 'medium' | 'large' };
export function Card({ variant = 'bordered', padding = 'medium', className, ...props }: CardProps) {
  return <div {...props} className={cx('ui-card', className)} data-variant={variant} data-padding={padding}/>;
}
export function CardHeader({ title, description, actions, leading }: { title: string; description?: string; actions?: ReactNode; leading?: ReactNode }) {
  return <header className="ui-card__header">{leading && <span className="ui-card__leading" aria-hidden>{leading}</span>}<div><h3>{title}</h3>{description && <p>{description}</p>}</div>{actions && <div className="ui-card__actions">{actions}</div>}</header>;
}
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cx('ui-card__footer', className)}/>; }
