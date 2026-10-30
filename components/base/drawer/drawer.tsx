'use client';

import { OverlaySurface, type DialogProps } from '@/components/base/dialog/dialog';

export type DrawerProps = DialogProps & { side?: 'start' | 'end' | 'bottom' };

export function Drawer({ side = 'end', ...props }: DrawerProps) {
  return <OverlaySurface {...props} presentation="drawer" side={side}/>;
}
