import type { ReactNode } from 'react';
import { Avatar } from '@/components/base/avatar/avatar';
import { BrandMark } from '@/components/foundations/brand-mark';
import { cx } from '@/utils/cx';

export type MessageProps = {
  role: 'user'|'assistant'|'system';
  children: ReactNode;
  name?: string;
  avatar?: ReactNode;
  timestamp?: string;
  dateTime?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  isStreaming?: boolean;
  variant?: 'workspace'|'plain'|'bubble';
  showHeader?: boolean;
  className?: string;
};

export function Message({role,children,name=role==='user'?'You':role==='assistant'?'Assistant':'System',avatar,timestamp,dateTime,actions,footer,isStreaming=false,variant='workspace',showHeader=false,className}: MessageProps) {
  return <article className={cx('ui-message',className)} data-role={role} data-variant={variant} aria-label={`${name} message`} aria-busy={isStreaming || undefined}>
    {variant==='workspace' && role==='assistant' && <span className="ui-message__avatar">{avatar ?? <BrandMark size={24}/>}</span>}
    <div className="ui-message__body">{showHeader && <header className="ui-message__header">{variant!=='workspace' && (avatar ?? (role==='user'?<Avatar size="xs" initials="Y" alt="You"/>:null))}<span>{name}</span>{timestamp && <time dateTime={dateTime}>{timestamp}</time>}</header>}
    <div className="ui-message__content">{children}</div>{footer && <div className="ui-message__footer">{footer}</div>}{actions && !isStreaming && <div className="ui-message__actions">{actions}</div>}</div>
  </article>;
}
