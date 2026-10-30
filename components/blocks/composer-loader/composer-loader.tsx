'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import { useElementSize } from '@/hooks/use-element-size';
import { cx } from '@/utils/cx';

export type ComposerLoaderProps = {
  active: boolean;
  children: ReactNode;
  colors?: string[];
  speed?: number;
  arc?: number;
  intensity?: number;
  bloom?: number;
  bloomStrength?: number;
  radius?: number;
  reverse?: boolean;
  className?: string;
};

const defaultColors = ['#5eead4', '#46baec', '#9677c8', '#e633a4', '#00faa7'];

/** A measured SVG rim keeps the band at a constant speed around any surface. */
export function ComposerLoader({ active, children, colors = defaultColors, speed = 4.5, arc = 120, intensity = .7, bloom = 16, bloomStrength = .3, radius, reverse = false, className }: ComposerLoaderProps) {
  const id = useId().replaceAll(':', '');
  const { ref, width, height } = useElementSize<HTMLDivElement>(560, 52);
  const palette = colors.length ? colors : defaultColors;
  const stops = palette.length === 1 ? [palette[0], palette[0]] : palette;
  const curve = Math.max(0, Math.min(radius ?? height / 2, height / 2, width / 2));
  const band = Math.max(1, Math.min(99, arc / 3.6));
  const layers = [
    { width: Math.max(0, bloom) * 2, blur: 14, opacity: Math.max(0, Math.min(1, bloomStrength)), band: Math.max(1, band - 3.33) },
    { width: 8, blur: 6, opacity: .8, band: Math.max(1, band - 1.67) },
    { width: 2.5, blur: .5, opacity: 1, band },
  ];
  return <div ref={ref} className={cx('ui-composer-loader', className)} data-active={active || undefined} style={{ '--loader-radius': `${curve}px`, '--loader-speed': `${Math.max(.1, speed)}s`, '--loader-direction': reverse ? 'reverse' : 'normal' } as CSSProperties}>
    <span className="ui-composer-loader__light" aria-hidden="true">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ opacity: Math.max(0, Math.min(1, intensity)) }}>
        <defs>
          <linearGradient id={`${id}-colors`} x1="0" y1="0" x2="1" y2="0">{stops.map((color, index) => <stop key={index} offset={`${index * 100 / (stops.length - 1)}%`} stopColor={color} />)}</linearGradient>
          {layers.map((layer, index) => <filter key={index} id={`${id}-blur-${index}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={layer.blur} /></filter>)}
        </defs>
        {layers.map((layer, index) => <rect key={index} x="0" y="0" width={width} height={height} rx={curve} pathLength="100" fill="none" stroke={`url(#${id}-colors)`} strokeWidth={layer.width} strokeLinecap="round" strokeDasharray={`${layer.band} ${100 - layer.band}`} filter={`url(#${id}-blur-${index})`} opacity={layer.opacity} />)}
      </svg>
    </span>
    <div className="ui-composer-loader__content">{children}</div>
  </div>;
}
