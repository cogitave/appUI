'use client';

import { createContext, createElement, useContext, useEffect, useId, useRef, useState, type ReactNode, type KeyboardEvent, type MouseEvent } from 'react';
import { Link, Popover, useLocale, type LinkProps } from 'react-aria-components';
import { RiArrowDownSLine } from '@remixicon/react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Button } from '@/components/base/buttons/button';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { useAnchorScrollGuard } from '@/hooks/use-anchor-scroll-guard';
import { cx } from '@/utils/cx';

const NavigationContext = createContext<(()=>void)|null>(null);
type Entry = {id: string; label: string; isDisabled?: boolean};
export type NavigationMenuEntry = Entry & (
  | {content: ReactNode; href?: never; isCurrent?: never; target?: never; render?: never; onNavigate?: never}
  | {href: string; content?: never; isCurrent?: boolean; target?: LinkProps['target']; render?: LinkProps['render']; onNavigate?: (event:MouseEvent<HTMLElement>)=>void}
);
export type NavigationMenuProps = {
  items: NavigationMenuEntry[];
  'aria-label': string;
  openId?: string | null;
  defaultOpenId?: string | null;
  onOpenChange?: (id: string | null)=>void;
  /** Dropdown floats beneath the bar; inline expansion moves following content. */
  presentation?: 'dropdown' | 'inline';
  variant?: 'plain' | 'bordered';
  openOnHover?: boolean;
  className?: string;
};
export type NavigationMenuLinkProps = Omit<LinkProps, 'children' | 'className' | 'onPress'> & {
  children: ReactNode;
  href: string;
  /** Runs on native link activation, including keyboard Enter before navigation. */
  onNavigate?: (event:MouseEvent<HTMLElement>)=>void;
  description?: ReactNode;
  icon?: IconComponent;
  variant?: 'plain' | 'card';
  className?: string;
};

export function NavigationMenuLink({children,description,icon:Icon,variant='card',className,onNavigate,render,...props}: NavigationMenuLinkProps) {
  const close = useContext(NavigationContext);
  return <Link {...props} render={(domProps,renderProps)=>{const linkProps={...domProps,onClick:(event:MouseEvent<HTMLAnchorElement>)=>{domProps.onClick?.(event);if(!event.defaultPrevented&&!props.isDisabled){onNavigate?.(event);close?.();}}};return render?render(linkProps,renderProps):createElement(props.isDisabled?'span':'a',linkProps);}} className={cx('ui-navigation-menu-link',className)} data-variant={variant}>
    {Icon && <Icon className="ui-navigation-menu-link__icon" aria-hidden/>}
    <span className="ui-navigation-menu-link__text"><span className="ui-navigation-menu-link__label">{children}</span>{description && <span className="ui-navigation-menu-link__description">{description}</span>}</span>
  </Link>;
}

export function NavigationMenu({items,'aria-label':label,openId,defaultOpenId=null,onOpenChange,presentation='dropdown',variant='plain',openOnHover=false,className}: NavigationMenuProps) {
  const {direction}=useLocale(),scopeId=useId();
  const [localOpen,setLocalOpen]=useState<string|null>(defaultOpenId);
  const requested=openId===undefined?localOpen:openId;
  const active=items.find(item=>item.id===requested&&!item.isDisabled&&item.content!==undefined)?.id??null;
  const root=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),bar=useRef<HTMLUListElement>(null);
  const ignoreQueuedScroll=useAnchorScrollGuard(active!==null&&presentation==='dropdown',bar);
  const [lastActive,setLastActive]=useState(active);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null),requestedFocus=useRef<'first'|'last'|null>(null);
  function cancelClose(){if(timer.current!==null){clearTimeout(timer.current);timer.current=null;}}
  function change(id:string|null){cancelClose();if(openId===undefined)setLocalOpen(id);onOpenChange?.(id);}
  function triggerFor(id:string){return bar.current?.querySelector<HTMLButtonElement>(`[data-nav-id="${CSS.escape(id)}"]`);}
  function close(restore=false){if(restore&&active)triggerFor(active)?.focus({preventScroll:true});requestedFocus.current=null;change(null);}
  useEffect(()=>()=>cancelClose(),[]);
  useEffect(()=>{
    if(!active)return;
    const onPointerDown=(event:PointerEvent)=>{if(event.target instanceof Node&&!root.current?.contains(event.target)&&!viewport.current?.contains(event.target))change(null);};
    const onFocus=(event:FocusEvent)=>{if(event.target instanceof Node&&!root.current?.contains(event.target)&&!viewport.current?.contains(event.target))change(null);};
    const onEscape=(event:globalThis.KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();close(true);}};
    document.addEventListener('pointerdown',onPointerDown,true);
    document.addEventListener('focusin',onFocus);
    document.addEventListener('keydown',onEscape);
    return()=>{document.removeEventListener('pointerdown',onPointerDown,true);document.removeEventListener('focusin',onFocus);document.removeEventListener('keydown',onEscape);};
  },[active,openId,onOpenChange]);
  useEffect(()=>{if(active)setLastActive(active);},[active]);
  useEffect(()=>{
    if(!active||!requestedFocus.current)return;
    const target=requestedFocus.current;requestedFocus.current=null;
    const panel=document.getElementById(`${scopeId}-panel-${active}`);
    const links=panel?.querySelectorAll<HTMLElement>('a[href]:not([data-disabled]),button:not(:disabled),[role="link"]:not([data-disabled])');
    (target==='last'?links?.[links.length-1]:links?.[0])?.focus({preventScroll:true});
  },[active,scopeId]);
  function keyDown(event:KeyboardEvent<HTMLElement>){
    if(event.defaultPrevented)return;
    if(event.key==='Escape'&&active){event.preventDefault();event.stopPropagation();close(true);return;}
    const target=event.target as HTMLElement;
    const top=target.closest<HTMLElement>('[data-nav-id]');
    if(!top||!bar.current?.contains(top))return;
    const id=top.dataset.navId!,entry=items.find(item=>item.id===id);
    if((event.key==='ArrowDown'||event.key==='ArrowUp')&&entry?.content!==undefined){
      event.preventDefault();requestedFocus.current=event.key==='ArrowUp'?'last':'first';
      if(active===id){const panel=document.getElementById(`${scopeId}-panel-${id}`);const links=panel?.querySelectorAll<HTMLElement>('a[href]:not([data-disabled]),button:not(:disabled),[role="link"]:not([data-disabled])');(event.key==='ArrowUp'?links?.[links.length-1]:links?.[0])?.focus({preventScroll:true});requestedFocus.current=null;}else change(id);
      return;
    }
    const available=items.filter(item=>!item.isDisabled),index=available.findIndex(item=>item.id===id);
    let next:number|undefined;
    if(event.key==='Home')next=0;else if(event.key==='End')next=available.length-1;
    else if(event.key==='ArrowRight')next=(index+(direction==='rtl'?-1:1)+available.length)%available.length;
    else if(event.key==='ArrowLeft')next=(index+(direction==='rtl'?1:-1)+available.length)%available.length;
    if(next!==undefined&&available[next]){event.preventDefault();const item=available[next];bar.current.querySelector<HTMLElement>(`[data-nav-id="${CSS.escape(item.id)}"]`)?.focus({preventScroll:true});if(active)change(item.content!==undefined?item.id:null);}
  }
  function leave(pointerType:string){if(!openOnHover||pointerType!=='mouse')return;cancelClose();timer.current=setTimeout(()=>{if(!root.current?.contains(document.activeElement)&&!viewport.current?.contains(document.activeElement))change(null);},180);}
  function panels(displayId:string|null,isExiting=false){return <div ref={viewport} className="ui-navigation-menu__viewport" data-open={active!==null||undefined} inert={isExiting||active===null} aria-hidden={isExiting||active===null||undefined} onKeyDown={keyDown} onPointerEnter={cancelClose} onPointerLeave={event=>leave(event.pointerType)}>
    <AnimatedHeight>{items.filter(item=>item.content!==undefined).map(item=><div id={`${scopeId}-panel-${item.id}`} key={item.id} className="ui-navigation-menu__panel" data-active={displayId===item.id||undefined} inert={isExiting||active!==item.id} aria-hidden={isExiting||active!==item.id||undefined} role="region" aria-labelledby={`${scopeId}-trigger-${item.id}`}>
      <ScrollArea label={`${item.label} navigation`} viewportClassName="ui-navigation-menu__scroll"><div className="ui-navigation-menu__content">{item.content}</div></ScrollArea>
    </div>)}</AnimatedHeight>
  </div>;}
  return <NavigationContext.Provider value={()=>close()}><nav ref={root} aria-label={label} className={cx('ui-navigation-menu',className)} data-presentation={presentation} data-variant={variant} onKeyDown={keyDown}
    onBlurCapture={event=>{if(event.relatedTarget instanceof Node&&!event.currentTarget.contains(event.relatedTarget)&&!viewport.current?.contains(event.relatedTarget))close();}}
    onPointerEnter={cancelClose} onPointerLeave={event=>leave(event.pointerType)}>
    <ul ref={bar} className="ui-navigation-menu__list">{items.map(item=><li key={item.id}>
      {item.content!==undefined?<Button id={`${scopeId}-trigger-${item.id}`} data-nav-id={item.id} variant="ghost" className="ui-navigation-menu__trigger" trailingIcon={RiArrowDownSLine} disabled={item.isDisabled} aria-expanded={active===item.id} aria-controls={`${scopeId}-panel-${item.id}`} onClick={()=>{requestedFocus.current=null;change(active===item.id?null:item.id);}} onPointerEnter={event=>{if(openOnHover&&event.pointerType==='mouse'&&!item.isDisabled)change(item.id);}}>{item.label}</Button>:<NavigationMenuLink href={item.href!} target={item.target} render={item.render} isDisabled={item.isDisabled} aria-current={item.isCurrent?'page':undefined} data-nav-id={item.id} variant="plain" className="ui-navigation-menu__trigger ui-navigation-menu__direct" onNavigate={item.onNavigate}>{item.label}</NavigationMenuLink>}
    </li>)}</ul>
    {presentation==='inline'?panels(active):<Popover isOpen={active!==null} onOpenChange={open=>{if(!open&&!ignoreQueuedScroll())close();}} triggerRef={bar} isNonModal placement="bottom start" offset={6} className="ui-navigation-menu-popover" shouldCloseOnInteractOutside={target=>!root.current?.contains(target)}>{({isExiting})=>panels(active??lastActive,isExiting)}</Popover>}
  </nav></NavigationContext.Provider>;
}
