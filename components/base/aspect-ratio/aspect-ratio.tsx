import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

export type AspectRatioProps = HTMLAttributes<HTMLDivElement> & {
  ratio?: number;
  fit?: 'cover' | 'contain';
  radius?: 'none' | 'small' | 'medium' | 'large';
};

/** Reserve media layout before it loads. Invalid ratios fall back to 16:9. */
export function AspectRatio({ ratio = 16 / 9, fit = 'cover', radius = 'medium', children, className, style, ...props }: AspectRatioProps) {
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9;
  return <div {...props} className={cx('ui-aspect-ratio', className)} data-fit={fit} data-radius={radius} style={{...style, aspectRatio: safeRatio, '--media-fit': fit} as CSSProperties}><div className="ui-aspect-ratio__content">{children}</div></div>;
}
