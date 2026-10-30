'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { docsPages, type DocSlug } from './docs-data';
import { DocsShell } from './docs-shell';
import { guidePaths } from './getting-started-pages';

export function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname().replace(/\/+$/, '') || '/';
  const guideSlug = Object.entries(guidePaths).find(([, path]) => path === pathname)?.[0];
  const componentSlug = /^\/components\/([^/]+)$/.exec(pathname)?.[1];
  // Canonical guide aliases are redirected by their server page.
  const slug = guideSlug ?? (componentSlug && !Object.hasOwn(guidePaths, componentSlug) ? componentSlug : undefined);
  if (!slug || !Object.hasOwn(docsPages, slug)) return <>{children}</>;
  return <DocsShell slug={slug as DocSlug} />;
}
