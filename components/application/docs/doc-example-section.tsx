import type { ReactNode } from 'react';
import { sectionId } from './docs-data';

export function DocExampleSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2>{description && <p className="docs-example__description">{description}</p>}<div className="docs-example__surface docs-example__surface--extended">{children}</div></section>;
}
