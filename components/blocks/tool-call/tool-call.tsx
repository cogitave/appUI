'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { RiArrowDownSLine, RiCheckLine, RiCloseCircleLine, RiCloseLine, RiToolsLine } from '@remixicon/react';
import { Alert } from '@/components/base/alert/alert';
import { Badge } from '@/components/base/badges/badge';
import { Button } from '@/components/base/buttons/button';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { Collapsible } from '@/components/base/collapsible/collapsible';
import { Spinner } from '@/components/base/spinner/spinner';
import { cx } from '@/utils/cx';

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'requires-action';
export type ToolCallProps = {
  name: string;
  title?: string;
  status: ToolCallStatus;
  arguments?: string;
  result?: ReactNode;
  error?: string;
  durationMs?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  approvalPrompt?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  onCopy?: (message: string) => void;
  variant?: 'bordered' | 'plain';
  className?: string;
};
const statusLabels: Record<ToolCallStatus, string> = { pending: 'Queued', running: 'Running', completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled', 'requires-action': 'Waiting for approval' };

/** Render tool state from your application's data; the card never runs a tool. */
export function ToolCall({ name, title = name, status, arguments: args, result, error, durationMs, expanded, defaultExpanded, onExpandedChange, approvalPrompt, onApprove, onReject, onRetry, onCancel, onCopy, variant = 'bordered', className }: ToolCallProps) {
  const [internalOpen, setInternalOpen] = useState(defaultExpanded ?? status === 'requires-action');
  const open = expanded ?? internalOpen, id = useId();
  useEffect(() => { if (status === 'requires-action' && expanded === undefined) setInternalOpen(true); }, [status, expanded]);
  function setOpen(next: boolean) { if (expanded === undefined) setInternalOpen(next); onExpandedChange?.(next); }
  const StatusIcon = status === 'completed' ? RiCheckLine : status === 'failed' ? RiCloseCircleLine : status === 'cancelled' ? RiCloseLine : RiToolsLine;
  const duration = durationMs != null && Number.isFinite(durationMs) ? `${Math.max(0,durationMs / 1000).toFixed(1)}s` : undefined;
  return <article className={cx('ui-tool-call',className)} data-status={status} data-variant={variant}>
    <button type="button" className="ui-tool-call__trigger" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      <span className="ui-tool-call__icon" aria-hidden>{status === 'running' ? <Spinner size="sm"/> : <StatusIcon size={16}/>}</span><span className="ui-tool-call__title">{title}</span><span className="ui-tool-call__status">{statusLabels[status]}</span>{duration && <span className="ui-tool-call__duration">{duration}</span>}<RiArrowDownSLine size={16} aria-hidden/>
    </button>
    <span className="sr-only" role="status">{title}: {statusLabels[status]}</span>
    <Collapsible id={id} isOpen={open}><div className="ui-tool-call__details">
      {status === 'failed' && <Alert title="The tool couldn't finish" description={error ?? 'Try the operation again when you are ready.'} tone="error"/>}
      {args && <CodeBlock label="Arguments" examples={[{value:'json',label:'json',code:args}]} onCopy={onCopy}/>}
      {status === 'requires-action' && <div className="ui-tool-call__approval"><p>{approvalPrompt ?? 'Review the operation before allowing it to continue.'}</p><div>{onReject && <Button size="small" variant="secondary" onClick={onReject}>Reject</Button>}{onApprove && <Button size="small" variant="solid" onClick={onApprove}>Approve</Button>}{!onApprove && !onReject && <Badge variant="label">REVIEW REQUIRED</Badge>}</div></div>}
      {result != null && <div className="ui-tool-call__result"><span>Result</span><div>{result}</div></div>}
      {((status === 'failed' && onRetry) || ((status === 'running' || status === 'pending') && onCancel)) && <div className="ui-tool-call__actions">{status === 'failed' && onRetry && <Button size="small" variant="secondary" onClick={onRetry}>Retry tool</Button>}{(status === 'running' || status === 'pending') && onCancel && <Button size="small" variant="secondary" onClick={onCancel}>Cancel operation</Button>}</div>}
    </div></Collapsible>
  </article>;
}
