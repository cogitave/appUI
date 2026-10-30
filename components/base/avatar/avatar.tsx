'use client';

import type { HTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/cx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarColor = 'neutral' | 'blue' | 'lime' | 'pink';

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  size?: AvatarSize;
  color?: AvatarColor;
  initials?: string;
  src?: string;
  alt?: string;
};

export function Avatar({ size = 'md', color = 'neutral', initials, src, alt, className, ...props }: AvatarProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const showImage = Boolean(src && src !== failedSource);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !src) return;
    const fail = () => setFailedSource(src);
    if (image.complete && image.naturalWidth === 0) fail();
    image.addEventListener('error', fail);
    return () => image.removeEventListener('error', fail);
  }, [src, showImage]);

  return (
    <span role="img" aria-label={alt || initials || 'Avatar'} data-size={size} data-color={color} className={cx('ui-avatar', className)} {...props}>
      <span className="ui-avatar__initials" aria-hidden="true">{initials}</span>
      {showImage && <img ref={imageRef} src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={() => setFailedSource(src!)} />}
    </span>
  );
}
