import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';

export type CollapsibleProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { isOpen: boolean; children: ReactNode };

/** Keep descendants mounted while hiding their focus targets and animating flow. */
export function Collapsible({ isOpen, children, className, ...props }: CollapsibleProps) {
  return <div {...props} className={cx('ui-collapsible', className)} data-open={isOpen || undefined} aria-hidden={!isOpen} inert={!isOpen}>
    <div className="ui-collapsible__inner"><div className="ui-collapsible__content">{children}</div></div>
  </div>;
}
