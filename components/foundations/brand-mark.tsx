import { MetalSurface } from '@/components/base/metal-surface/metal-surface';

export function BrandMark({ size = 34, appearance = 'accent' }: { size?: number; appearance?: 'accent' | 'metal' }) {
  if (appearance === 'metal') return <MetalSurface size={size}><svg width={size*.7} height={size*.7} viewBox="0 0 36 36" fill="none" aria-hidden><path d="M10.5 25.5L17.3 10.5H19L25.5 25.5M13.2 20H22.7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="27" cy="9" r="2" fill="currentColor"/></svg></MetalSurface>;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="34" height="34" rx="10" fill="var(--accent-strong)" />
      <rect x="1.5" y="1.5" width="33" height="33" rx="9.5" stroke="white" strokeOpacity=".25" />
      <path d="M10.5 25.5L17.3 10.5H19L25.5 25.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2 20H22.7" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="27" cy="9" r="2" fill="white" fillOpacity=".55" />
    </svg>
  );
}
