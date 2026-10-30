import type { ButtonHTMLAttributes, Ref } from 'react';
import { cx } from '@/utils/cx';

export type CloseButtonSize = '2xs' | 'xs' | 'sm' | 'md';

export type CloseButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  size?: CloseButtonSize;
  ref?: Ref<HTMLButtonElement>;
  'aria-label': string;
};

const glyphSizes: Record<CloseButtonSize, number> = { '2xs': 8, xs: 11, sm: 13, md: 17 };
const strokes: Record<CloseButtonSize, number> = { '2xs': 1.6, xs: 2, sm: 2, md: 2.5 };

export function CloseButton({ size = 'xs', className, type = 'button', ...props }: CloseButtonProps) {
  const glyph = glyphSizes[size];
  const inset = size === '2xs' ? 1.4 : 2;
  return (
    <button type={type} data-size={size} className={cx('ui-close-button', className)} {...props}>
      <svg width={glyph} height={glyph} viewBox={`0 0 ${glyph} ${glyph}`} fill="none" aria-hidden="true">
        <path d={`M${inset} ${inset}L${glyph - inset} ${glyph - inset}M${glyph - inset} ${inset}L${inset} ${glyph - inset}`} stroke="currentColor" strokeWidth={strokes[size]} strokeLinecap="round" />
      </svg>
    </button>
  );
}
