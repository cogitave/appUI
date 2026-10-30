'use client';

import { useState } from 'react';
import { cx } from '@/utils/cx';

export type StreamingTextProps = { text: string; isStreaming?: boolean; showCursor?: boolean; animate?: boolean; className?: string; };

/** Display incoming text immediately; animate only the latest appended part. */
export function StreamingText({text,isStreaming=false,showCursor=true,animate=true,className}: StreamingTextProps) {
  const [snapshot,setSnapshot] = useState({text,prefix:text.length});
  let current = snapshot;
  if(snapshot.text !== text) {
    current = {text,prefix:text.startsWith(snapshot.text) ? snapshot.text.length : 0};
    setSnapshot(current);
  }
  return <span className={cx('ui-streaming-text',className)} data-streaming={isStreaming || undefined} aria-busy={isStreaming || undefined}>
    {text.slice(0,current.prefix)}<span key={`${current.prefix}:${text.length}`} className={animate && isStreaming ? 'ui-streaming-text__incoming' : undefined}>{text.slice(current.prefix)}</span>{showCursor && isStreaming && <span className="ui-streaming-text__cursor" aria-hidden/>}
  </span>;
}
