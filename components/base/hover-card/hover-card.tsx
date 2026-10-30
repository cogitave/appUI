'use client';

import { cloneElement, useContext, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode, type Ref, type RefObject } from 'react';
import { Focusable, OverlayArrow, OverlayTriggerStateContext, Popover, PreviewTrigger, type PopoverProps } from 'react-aria-components';
import { cx } from '@/utils/cx';

export type HoverCardProps = {
  trigger: ComponentProps<typeof Focusable>['children'];
  children: ReactNode;
  title?: string;
  label?: string;
  placement?: PopoverProps['placement'];
  delay?: number;
  closeDelay?: number;
  isDisabled?: boolean;
  showArrow?: boolean;
  className?: string;
};

/** A non-modal preview: hover keeps page focus; Tab can enter its controls. */
function PointerTrigger({trigger,isDisabled,triggerRef,suppressRestore}:{trigger:HoverCardProps['trigger'];isDisabled?:boolean;triggerRef:Ref<HTMLElement>;suppressRestore:RefObject<boolean>}) {
  const state = useContext(OverlayTriggerStateContext);
  const element = trigger;
  // A first hover can precede a pointer press. Use the public trigger state so
  // it keeps the configured warmup, safe area and focus behavior without
  // changing the page's keyboard modality.
  const pointerTrigger = cloneElement(element,{onPointerEnter:event=>{
    element.props.onPointerEnter?.(event);
    if(!isDisabled&&!event.defaultPrevented&&(event.pointerType==='mouse'||event.pointerType==='pen')&&!state?.isOpen)state?.open();
  },onFocusCapture:event=>{
    element.props.onFocusCapture?.(event);
    if(suppressRestore.current){suppressRestore.current=false;event.stopPropagation();element.props.onFocus?.(event);}
  }}) as HoverCardProps['trigger'];
  return <Focusable ref={triggerRef}>{pointerTrigger}</Focusable>;
}

function PreviewContent({children,title,titleId,label,isExiting,onDismiss}:{children:ReactNode;title?:string;titleId:string;label:string;isExiting:boolean;onDismiss:()=>void}) {
  const state = useContext(OverlayTriggerStateContext);
  function handleKeyDown(event:KeyboardEvent<HTMLElement>) {
    if(event.key!=='Escape'||event.defaultPrevented)return;
    // Keep the public preview state's cooldown and cancellation bookkeeping,
    // then close the controlled surface immediately for explicit dismissal.
    state?.close();
    onDismiss();
  }
  return <section onKeyDown={handleKeyDown} inert={isExiting} aria-hidden={isExiting || undefined} className="ui-popover__dialog" role="region" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label}>
    {title && <header className="ui-popover__header"><h3 id={titleId}>{title}</h3></header>}<div className="ui-popover__body">{children}</div>
  </section>;
}

export function HoverCard({ trigger, children, title, label = 'Preview details', placement = 'top', delay = 400, closeDelay = 180, isDisabled, showArrow = true, className }: HoverCardProps) {
  const titleId = useId();
  const triggerRef = useRef<HTMLElement>(null);
  const suppressRestore = useRef(false);
  const [open, setOpen] = useState(false);
  function dismiss() {
    // Pointer travel keeps its close delay; an explicit dismissal starts the
    // exit immediately so Tab cannot return to the outgoing preview.
    setOpen(false);
    suppressRestore.current=true;
    triggerRef.current?.focus({preventScroll:true});
  }
  return <PreviewTrigger isOpen={open} onOpenChange={setOpen} delay={delay} closeDelay={closeDelay} isDisabled={isDisabled}>
    <PointerTrigger trigger={trigger} isDisabled={isDisabled} triggerRef={triggerRef} suppressRestore={suppressRestore}/>
    <Popover shouldSkipAnimation={false} placement={placement} offset={showArrow ? 10 : 6} aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label} className={cx('ui-popover ui-hover-card', className)}>
      {({isExiting})=><>
      {showArrow && <OverlayArrow className="ui-popover__arrow"><svg width="12" height="8" viewBox="0 0 12 8" aria-hidden><path d="M0 0 6 6 12 0"/></svg></OverlayArrow>}
      <PreviewContent isExiting={isExiting} title={title} titleId={titleId} label={label} onDismiss={dismiss}>{children}</PreviewContent>
      </>}
    </Popover>
  </PreviewTrigger>;
}
