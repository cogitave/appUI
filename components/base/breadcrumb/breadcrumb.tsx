import { Children, Fragment, isValidElement } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { RiArrowRightSLine } from '@remixicon/react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

export type BreadcrumbProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children: ReactNode;
  'aria-label'?: string;
};

export function Breadcrumb({ children, className, 'aria-label': ariaLabel = 'Breadcrumb', ...props }: BreadcrumbProps) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <nav aria-label={ariaLabel} className={cx('ui-breadcrumb', className)} {...props}>
      <ol>
        {items.map((item, index) => (
          <Fragment key={item.key ?? index}>
            {index > 0 && <li className="ui-breadcrumb__separator" aria-hidden="true"><RiArrowRightSLine size={14} /></li>}
            {item}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export type BreadcrumbItemProps = {
  children: ReactNode;
  icon?: IconComponent;
  href?: string;
  onClick?: () => void;
  current?: boolean;
  className?: string;
};

export function BreadcrumbItem({ children, icon: Icon, href, onClick, current = false, className }: BreadcrumbItemProps) {
  const content = <>{Icon && <Icon className="ui-breadcrumb__icon" aria-hidden />}{children}</>;
  if (current) return <li className={cx('ui-breadcrumb__item is-current', className)} aria-current="page"><span>{content}</span></li>;
  if (href) return <li className={cx('ui-breadcrumb__item', className)}><a href={href}>{content}</a></li>;
  if (onClick) return <li className={cx('ui-breadcrumb__item', className)}><button type="button" onClick={onClick}>{content}</button></li>;
  return <li className={cx('ui-breadcrumb__item', className)}><span>{content}</span></li>;
}
