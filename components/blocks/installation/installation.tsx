import { useId, type ReactNode } from 'react';
import { Badge } from '@/components/base/badges/badge';

export type InstallationStep = { title: string; description: ReactNode; content: ReactNode };
export type InstallationProps = {
  id?: string;
  heading?: string;
  description: string;
  themeNote?: ReactNode;
  title: string;
  summary: string;
  mark: ReactNode;
  badge?: string;
  steps: InstallationStep[];
  footer: ReactNode;
  action?: ReactNode;
  note?: ReactNode;
};

/** One installation layout for base components, blocks, charts and templates. */
export function Installation({ id, heading = 'Installation', description, themeNote, title, summary, mark, badge, steps, footer, action, note }: InstallationProps) {
  const headingId = useId();
  return <section className="ui-installation" id={id} aria-labelledby={headingId}>
    <header className="ui-installation__heading"><h2 id={headingId}>{heading}</h2><p>{description}</p>{themeNote && <div>{themeNote}</div>}</header>
    <div className="ui-installation__card">
      <header className="ui-installation__intro">{mark}<div><h3>{title}</h3><p>{summary}</p></div>{badge && <Badge variant="pill">{badge}</Badge>}</header>
      <div className="ui-installation__steps">{steps.map((step,index) => <section key={step.title} className="ui-installation__step"><header><span>{String(index+1).padStart(2,'0')}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></header>{step.content}</section>)}</div>
      <footer><div>{footer}</div>{action}</footer>
    </div>
    {note && <p className="ui-installation__note">{note}</p>}
  </section>;
}
