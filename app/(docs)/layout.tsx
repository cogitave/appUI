import type { ReactNode } from 'react';
import { DocsLayout } from '@/components/application/docs/docs-layout';

export default function DocumentationLayout({ children }: { children: ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
