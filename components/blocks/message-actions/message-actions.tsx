'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { RiCheckLine, RiFileCopyLine, RiLoader4Line, RiRefreshLine, RiThumbDownFill, RiThumbDownLine, RiThumbUpFill, RiThumbUpLine, RiVolumeUpLine } from '@remixicon/react';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { cx } from '@/utils/cx';

export type MessageFeedback = 'helpful' | 'unhelpful' | null;
export type MessageActionsProps = {
  content: string;
  feedback?: MessageFeedback;
  defaultFeedback?: MessageFeedback;
  onFeedbackChange?: (feedback: MessageFeedback) => void;
  onRegenerate?: () => void;
  onReadAloud?: () => void;
  onCopy?: (content: string) => void;
  showFeedback?: boolean;
  isDisabled?: boolean;
  className?: string;
};

export function MessageActions({content,feedback,defaultFeedback=null,onFeedbackChange,onRegenerate,onReadAloud,onCopy,showFeedback=false,isDisabled=false,className}: MessageActionsProps) {
  const [internalFeedback,setInternalFeedback]=useState<MessageFeedback>(defaultFeedback), [copied,setCopied]=useState(false), [status,setStatus]=useState(''), [pending,setPending]=useState(false);
  const [regeneration,setRegeneration]=useState(0), [reading,setReading]=useState(0);
  const selected=feedback===undefined?internalFeedback:feedback, timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const currentContent=useRef(content),request=useRef(0),busy=useRef(false);
  useLayoutEffect(()=>{
    currentContent.current=content;request.current+=1;busy.current=false;
    clearTimeout(timer.current);setCopied(false);setPending(false);setStatus('');
    return()=>{request.current+=1;busy.current=false;clearTimeout(timer.current);};
  },[content]);
  async function copy() {
    if(isDisabled||!content||busy.current)return;
    const sequence=++request.current,snapshot=content;
    busy.current=true;clearTimeout(timer.current);setPending(true);setCopied(false);setStatus('Copying response…');
    try {
      await navigator.clipboard.writeText(snapshot);
      if(sequence!==request.current||snapshot!==currentContent.current)return;
      setCopied(true);setStatus('Response copied.');onCopy?.(snapshot);
      timer.current=setTimeout(()=>{setCopied(false);setStatus('');},2000);
    } catch {
      if(sequence===request.current&&snapshot===currentContent.current)setStatus('Could not copy. Select the response to copy it manually.');
    } finally {
      if(sequence===request.current&&snapshot===currentContent.current){busy.current=false;setPending(false);}
    }
  }
  function rate(value: Exclude<MessageFeedback,null>) {const next=selected===value?null:value;if(feedback===undefined)setInternalFeedback(next);onFeedbackChange?.(next);setStatus(next==='helpful'?'Marked helpful.':next==='unhelpful'?'Marked unhelpful.':'Feedback cleared.');}
  return <div className={cx('ui-message-actions',className)} role="group" aria-label="Response actions">
    <Tooltip content={pending?'Copying response':copied?'Copied':'Copy response'}><IconButton icon={pending?RiLoader4Line:copied?RiCheckLine:RiFileCopyLine} iconKey={pending?'pending':copied?'copied':'copy'} isPending={pending} pendingLabel="Copying response" data-copied={copied || undefined} variant="ghost" size="xs" aria-label={copied?'Response copied':'Copy response'} disabled={isDisabled||!content} onClick={copy}/></Tooltip>
    {showFeedback && <><Tooltip content="Helpful"><IconButton icon={selected==='helpful'?RiThumbUpFill:RiThumbUpLine} iconKey={selected==='helpful'?'selected':'default'} variant="ghost" size="xs" aria-label="Mark response helpful" aria-pressed={selected==='helpful'} disabled={isDisabled} onClick={()=>rate('helpful')}/></Tooltip><Tooltip content="Unhelpful"><IconButton icon={selected==='unhelpful'?RiThumbDownFill:RiThumbDownLine} iconKey={selected==='unhelpful'?'selected':'default'} variant="ghost" size="xs" aria-label="Mark response unhelpful" aria-pressed={selected==='unhelpful'} disabled={isDisabled} onClick={()=>rate('unhelpful')}/></Tooltip></>}
    {onRegenerate && <Tooltip content="Regenerate response"><IconButton icon={RiRefreshLine} iconKey={regeneration} variant="ghost" size="xs" aria-label="Regenerate response" disabled={isDisabled} onClick={()=>{setRegeneration(v=>v+1);onRegenerate();}}/></Tooltip>}
    {onReadAloud && <Tooltip content="Read aloud"><IconButton icon={RiVolumeUpLine} iconKey={reading} variant="ghost" size="xs" aria-label="Read response aloud" disabled={isDisabled} onClick={()=>{setReading(v=>v+1);onReadAloud();}}/></Tooltip>}
    <span className="sr-only" role="status">{status}</span>
  </div>;
}
