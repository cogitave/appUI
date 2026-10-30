import { RiFolder3Line, RiFolderOpenLine } from '@remixicon/react';
import { cx } from '@/utils/cx';

/** Keep both folder shapes mounted so an interrupted disclosure can reverse. */
export function FolderIcon({ isOpen, className }: { isOpen:boolean; className?:string }) {
  return <span className={cx('ui-folder-icon',className)} data-open={isOpen||undefined} aria-hidden>
    <RiFolder3Line className="ui-folder-icon__closed"/>
    <RiFolderOpenLine className="ui-folder-icon__open"/>
  </span>;
}
