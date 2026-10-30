import { RiFolder3Line, RiGitBranchLine } from '@remixicon/react';
import { cx } from '@/utils/cx';

export type ComposerStatusTabProps = { branch?: string; project?: string; context?: number; className?: string };

export function ComposerStatusTab({ branch = 'Main', project = 'project-sea', context = 57, className }: ComposerStatusTabProps) {
  const percent = Number.isFinite(context) ? Math.min(100, Math.max(0, context)) : 0;
  return <div className={cx('ui-composer__status ui-composer-status-tab', className)}>
    {branch && <span title={branch}><RiGitBranchLine size={16} aria-hidden /><span>{branch}</span></span>}
    {project && <span title={project}><RiFolder3Line size={16} aria-hidden /><span>{project}</span></span>}
    <span className="ui-composer__status-spacer" />
    <span className="ui-composer-status-tab__context" aria-label={`Context used: ${Math.round(percent)}%`}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle className="ui-composer-status-tab__track" cx="8" cy="8" r="6" fill="none" strokeWidth="2.5"/><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength="100" strokeDasharray={`${percent} 100`} transform="rotate(-90 8 8)" /></svg>{Math.round(percent)}%</span>
  </div>;
}
