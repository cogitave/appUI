'use client';

import {createContext,useContext,useEffect,useId,useLayoutEffect,useRef,useState,useMemo,type FormEvent,type Ref} from 'react';
import type {CellContext,ColumnDef} from '@tanstack/react-table';
import {DataTable,type DataTableFilter} from '@/components/blocks/data-table/data-table';
import {Form} from 'react-aria-components';
import {mergeRefs} from 'react-aria';
import {AnimatePresence,animate,motion,usePresence,useIsPresent,usePresenceData,useReducedMotion} from 'motion/react';
import {RiDeleteBinLine,RiUserAddLine,RiTeamLine} from '@remixicon/react';
import {Card,CardHeader,CardFooter} from '@/components/base/card/card';
import {Item,ItemGroup,ItemMedia,ItemContent,ItemTitle,ItemDescription,ItemActions,ItemFooter} from '@/components/base/item/item';
import {Avatar,type AvatarColor} from '@/components/base/avatar/avatar';
import {Badge} from '@/components/base/badges/badge';
import {Button} from '@/components/base/buttons/button';
import {IconButton} from '@/components/base/buttons/icon-button';
import {Dialog} from '@/components/base/dialog/dialog';
import {Select,type SelectOption} from '@/components/base/select/select';
import {Input} from '@/components/base/input/input';
import {FieldGroup,FieldSet} from '@/components/base/field/field';
import {EmptyState} from '@/components/base/empty-state/empty-state';
import {Spinner} from '@/components/base/spinner/spinner';
import {Tooltip} from '@/components/base/tooltip/tooltip';
import {AnimatedHeight} from '@/components/base/animated-height/animated-height';
import {useMotionTokens} from '@/hooks/use-motion-tokens';
import {cx} from '@/utils/cx';

export type TeamMember={id:string;name:string;email?:string;roleId:string;avatar?:string;avatarColor?:AvatarColor;status?:'active'|'invited'|'suspended';isOwner?:boolean};
export type TeamInvitation={name:string;email:string;roleId:string};
export type TeamMembersProps={
 members:TeamMember[];roles?:SelectOption[];title?:string;description?:string;
 layout?:'list'|'table';isInviteOpen?:boolean;onInviteOpenChange?:(open:boolean)=>void;showInviteAction?:boolean;showHeader?:boolean;density?:'comfortable'|'compact';variant?:'outline'|'soft'|'plain';showEmail?:boolean;showStatus?:boolean;currentUserId?:string;className?:string;
 onInvite?:(invitation:TeamInvitation)=>void|Promise<void>;
 onRoleChange?:(memberId:string,roleId:string)=>void|Promise<void>;
 onRemove?:(memberId:string)=>void|Promise<void>;
};
const defaultRoles:SelectOption[]=[{id:'member',label:'Member'},{id:'admin',label:'Admin'},{id:'viewer',label:'Viewer'}];
function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(word=>Array.from(word)[0]).join('').toUpperCase();}
function message(error:unknown){return error instanceof Error?error.message:'Could not save this change. Please try again.';}
function focusable(element:Element|null):element is HTMLElement{return element instanceof HTMLElement&&element!==document.body&&element.isConnected&&!element.closest('[inert]')&&!element.matches(':disabled')&&!!element.getClientRects().length;}

function ErrorNotice({error,id,ref}:{error:string;id?:string;ref?:Ref<HTMLParagraphElement>}){const present=useIsPresent(),root=useRef<HTMLParagraphElement>(null),composed=useMemo(()=>mergeRefs(root,ref),[ref]),tokens=useMotionTokens(root),reduced=useReducedMotion();return <motion.p ref={composed} id={present?id:undefined} role={present?'alert':undefined} inert={!present} aria-hidden={!present||undefined} className="ui-team-members__error" initial={reduced?false:{opacity:0,y:2}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-2}} transition={{duration:reduced?0:tokens.fast,ease:tokens.ease}}>{error}</motion.p>;}
function ErrorFeedback({error,id}:{error?:string;id?:string}){return <AnimatedHeight><AnimatePresence initial={false} mode="popLayout">{error&&<ErrorNotice key={error} error={error} id={id}/>}</AnimatePresence></AnimatedHeight>;}

function EmptyTeam({ref}:{ref?:Ref<HTMLDivElement>}){const present=useIsPresent(),root=useRef<HTMLDivElement>(null),composed=useMemo(()=>mergeRefs(root,ref),[ref]),tokens=useMotionTokens(root),reduced=useReducedMotion();return <motion.div ref={composed} inert={!present} aria-hidden={!present||undefined} initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:tokens.fast,ease:tokens.ease}}><EmptyState size="small" title="No team members yet" description="Members added to this workspace will appear here." icon={<RiTeamLine size={24}/>}/></motion.div>;}

function MemberRow({member,roles,density,showEmail,showStatus,isCurrent,busy,error,onRoleChange,onRemove,register,animateOnMount}:{member:TeamMember;roles:SelectOption[];density:'comfortable'|'compact';showEmail:boolean;showStatus:boolean;isCurrent:boolean;busy:boolean;error?:string;onRoleChange?:(role:string)=>void;onRemove?:()=>void;register:(id:string,node:HTMLDivElement|null)=>void;animateOnMount:boolean}){
 const transition=usePresenceData() as {empty:boolean;fromEmpty:boolean}|undefined,fromEmpty=useRef(Boolean(transition?.fromEmpty));
 const root=useRef<HTMLDivElement>(null),[present,safeToRemove]=usePresence(),reduced=useReducedMotion(),tokens=useMotionTokens(root),entered=useRef(!animateOnMount),exiting=useRef(false),[roleOpen,setRoleOpen]=useState(false),titleId=useId();
 useLayoutEffect(()=>{register(member.id,root.current);return()=>register(member.id,null);},[member.id,register]);
 useLayoutEffect(()=>{
  const row=root.current?.parentElement;if(!row)return;
  row.inert=!present;if(present)row.removeAttribute('aria-hidden');else row.setAttribute('aria-hidden','true');
  const reversing=present&&exiting.current;exiting.current=!present;
  if(present&&entered.current&&!reversing)return;
  const end=root.current!.getBoundingClientRect().height,current=entered.current?row.getBoundingClientRect().height:0;
  let cancelled=false;
  if(reversing){row.style.position='';row.style.width='';row.style.top='';row.style.insetInlineStart='';}
  const moveHeight=present?(reversing||!fromEmpty.current):!transition?.empty;
  if(!present&&transition?.empty){row.style.width=`${row.getBoundingClientRect().width}px`;row.style.position='absolute';row.style.insetInlineStart='0';row.style.top='0';}
  if(moveHeight){row.style.transition='none';row.style.height=`${present?current:row.getBoundingClientRect().height}px`;void row.offsetHeight;row.style.transition=reduced?'none':`height ${tokens.standard}s cubic-bezier(${tokens.ease.join(',')})`;row.style.height=`${present?end:0}px`;}
  const control=animate(row,{opacity:present?[entered.current?+getComputedStyle(row).opacity:0,1]:[+getComputedStyle(row).opacity,0]},{duration:reduced?0:tokens.standard,ease:tokens.ease});
  row.style.overflow='hidden';
  control.then(()=>{if(cancelled)return;if(present){entered.current=true;row.style.height='';row.style.opacity='';row.style.overflow='';row.style.transition='';}else safeToRemove?.();});
  return()=>{cancelled=true;control.stop();};
 },[present,reduced,tokens.standard,tokens.ease,safeToRemove,transition?.empty]);
 useEffect(()=>{if(busy||!present)setRoleOpen(false);},[busy,present]);
 const role=member.isOwner?'Owner':roles.find(option=>option.id===member.roleId)?.label??member.roleId;
 return <Item ref={root} size={density==='compact'?'small':'medium'} variant="plain" role="group" tabIndex={-1} aria-labelledby={titleId} data-member-id={member.id} data-exiting={!present||undefined} inert={!present} aria-hidden={!present||undefined} className="ui-team-members__member">
  <ItemMedia variant="avatar"><Avatar size={density==='compact'?'sm':'md'} initials={initials(member.name)} alt={member.name} src={member.avatar} color={member.avatarColor}/></ItemMedia>
  <ItemContent><ItemTitle id={titleId} className="ui-team-members__name">{member.name}{isCurrent&&<Badge variant="subtle">You</Badge>}{showStatus&&member.status&&member.status!=='active'&&<Badge variant="subtle">{member.status==='invited'?'Invited':'Suspended'}</Badge>}</ItemTitle>{showEmail&&member.email&&<ItemDescription>{member.email}</ItemDescription>}</ItemContent>
  <ItemActions aria-busy={busy||undefined} className="ui-team-members__member-actions">
   <span className="ui-team-members__pending">{busy&&<Spinner size="sm" label={`Saving ${member.name}`}/>}</span>
   {onRoleChange&&!member.isOwner?<Select label={`Role for ${member.name}`} hideLabel size="small" density={density} options={roles} selectedKey={member.roleId} aria-describedby={error?`${titleId}-error`:undefined} isOpen={roleOpen} onOpenChange={open=>setRoleOpen(open&&!busy&&Boolean(present))} onSelectionChange={key=>{if(key&&!busy&&key!==member.roleId)onRoleChange(key);}}/>:<span className="ui-team-members__role">{role}</span>}
   {onRemove&&!member.isOwner&&!isCurrent?<Tooltip content={`Remove ${member.name}`}><IconButton icon={RiDeleteBinLine} size="small" aria-label={`Remove ${member.name}`} disabled={busy} onClick={onRemove}/></Tooltip>:<span className="ui-team-members__action-space" aria-hidden/>}
  </ItemActions>
  <ItemFooter className="ui-team-members__feedback"><ErrorFeedback error={error} id={`${titleId}-error`}/></ItemFooter>
 </Item>;
}

function MemberIdentity({member,isCurrent,showEmail,showStatus,register}:{member:TeamMember;isCurrent:boolean;showEmail:boolean;showStatus:boolean;register:(id:string,node:HTMLDivElement|null)=>void}){
 return <div ref={node=>register(member.id,node)} role="group" aria-label={member.name} tabIndex={-1} data-member-id={member.id} className="ui-team-members__table-identity"><Avatar size="sm" initials={initials(member.name)} alt={member.name} src={member.avatar} color={member.avatarColor}/><div><div className="ui-team-members__table-name">{member.name}{isCurrent&&<Badge variant="subtle">You</Badge>}{showStatus&&member.status&&member.status!=='active'&&<Badge variant="subtle">{member.status==='invited'?'Invited':'Suspended'}</Badge>}</div>{showEmail&&member.email&&<p>{member.email}</p>}</div></div>;
}
function MemberTableRole({member,roles,busy,error,onChange}:{member:TeamMember;roles:SelectOption[];busy:boolean;error?:string;onChange?:(role:string)=>void}){
 const [open,setOpen]=useState(false),id=useId(),present=useIsPresent();useEffect(()=>{if(busy||!present)setOpen(false);},[busy,present]);
 return <div className="ui-team-members__table-role" aria-busy={busy||undefined}><div>{busy&&<Spinner size="sm" label={`Saving ${member.name}`}/>}<Select label={`Role for ${member.name}`} hideLabel size="small" options={roles} selectedKey={member.roleId} isDisabled={busy||!present||member.isOwner||!onChange} aria-describedby={error?id:undefined} isOpen={open} onOpenChange={next=>setOpen(next&&!busy&&present)} onSelectionChange={key=>{if(key&&!busy&&key!==member.roleId)onChange?.(key);}}/></div><ErrorFeedback error={error} id={id}/></div>;
}

type TeamTableState={roles:SelectOption[];busy:Set<string>;errors:Map<string,string>;currentUserId?:string;showEmail:boolean;showStatus:boolean;register:(id:string,node:HTMLDivElement|null)=>void;onRoleChange?:(member:TeamMember,role:string)=>void;onRemove?:(member:TeamMember)=>void};
const TeamTableContext=createContext<TeamTableState|null>(null);
function TeamIdentityCell({row}:CellContext<TeamMember,unknown>){const state=useContext(TeamTableContext)!;return <MemberIdentity member={row.original} isCurrent={row.id===state.currentUserId} showEmail={state.showEmail} showStatus={state.showStatus} register={state.register}/>;}
function TeamRoleCell({row}:CellContext<TeamMember,unknown>){const state=useContext(TeamTableContext)!;return row.original.isOwner?<span className="ui-team-members__role">Owner</span>:<MemberTableRole member={row.original} roles={state.roles} busy={state.busy.has(row.id)} error={state.errors.get(row.id)} onChange={state.onRoleChange?role=>state.onRoleChange?.(row.original,role):undefined}/>;}
function TeamActionsCell({row}:CellContext<TeamMember,unknown>){const state=useContext(TeamTableContext)!,present=useIsPresent();return state.onRemove&&!row.original.isOwner&&row.id!==state.currentUserId?<Tooltip isDisabled={!present} content={`Remove ${row.original.name}`}><IconButton icon={RiDeleteBinLine} size="small" aria-label={`Remove ${row.original.name}`} disabled={state.busy.has(row.id)||!present} onClick={()=>state.onRemove?.(row.original)}/></Tooltip>:null;}
const memberTableColumns:ColumnDef<TeamMember>[]=[{id:'member',header:'Member',accessorFn:member=>`${member.name} ${member.email??''}`,cell:TeamIdentityCell},{id:'role',header:'Role',accessorFn:member=>member.isOwner?'Owner':member.roleId,cell:TeamRoleCell},{id:'actions',header:'Actions',enableSorting:false,cell:TeamActionsCell}];

/** The caller owns saved membership. Callbacks resolve after its data is updated. */
export function TeamMembers({members,roles=defaultRoles,title='Team members',description='Manage the people and roles in this workspace.',layout='list',isInviteOpen,onInviteOpenChange,showInviteAction=true,showHeader=true,density='comfortable',variant='outline',showEmail=true,showStatus=true,currentUserId,className,onInvite,onRoleChange,onRemove}:TeamMembersProps){
 const root=useRef<HTMLDivElement>(null),inviteTrigger=useRef<HTMLButtonElement>(null),rows=useRef(new Map<string,HTMLDivElement>()),latest=useRef(members);latest.current=members;
 const previousCount=useRef(members.length);const fromEmpty=previousCount.current===0;useLayoutEffect(()=>{previousCount.current=members.length;},[members.length]);
 const hydrated=useRef(false);useEffect(()=>{hydrated.current=true;},[]);
 const alive=useRef(true),jobs=useRef(new Map<string,symbol>()),[busy,setBusy]=useState(new Set<string>()),[errors,setErrors]=useState(new Map<string,string>());
 const nameInput=useRef<HTMLInputElement>(null),[nameError,setNameError]=useState('');
 const [internalInviteOpen,setInternalInviteOpen]=useState(false),[inviting,setInviting]=useState(false),inviteJob=useRef(false),[name,setName]=useState(''),[email,setEmail]=useState(''),[roleId,setRoleId]=useState(roles.find(role=>!role.isDisabled)?.id??''),[inviteError,setInviteError]=useState('');
 const inviteOpen=isInviteOpen??internalInviteOpen;
 function setInviteOpen(open:boolean){if(isInviteOpen===undefined)setInternalInviteOpen(open);onInviteOpenChange?.(open);}
 const previousInvite=useRef(false);
 useLayoutEffect(()=>{if(inviteOpen&&!previousInvite.current){setName('');setNameError('');setEmail('');setRoleId(roles.find(role=>!role.isDisabled)?.id??'');setInviteError('');}previousInvite.current=inviteOpen;},[inviteOpen,roles]);
 const [removeOpen,setRemoveOpen]=useState(false),[removing,setRemoving]=useState(false),[removeError,setRemoveError]=useState(''),[selected,setSelected]=useState<TeamMember|null>(null),removeJob=useRef(false);
 const confirmClass=`ui-team-members-confirm-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
 const interaction=useRef(0),handoff=useRef<{next?:string;interaction:number}|null>(null);
 const register=useRef((id:string,node:HTMLDivElement|null)=>{if(node)rows.current.set(id,node);else rows.current.delete(id);}).current;
 useLayoutEffect(()=>{alive.current=true;return()=>{alive.current=false;jobs.current.clear();};},[]);
 useLayoutEffect(()=>{for(const id of jobs.current.keys())if(!members.some(member=>member.id===id))jobs.current.delete(id);setBusy(previous=>{const next=new Set([...previous].filter(id=>members.some(member=>member.id===id)));return next.size===previous.size?previous:next;});setErrors(previous=>{const next=new Map([...previous].filter(([id])=>members.some(member=>member.id===id)));return next.size===previous.size?previous:next;});},[members]);
 useEffect(()=>{
  const request=handoff.current;if(removeOpen||!request)return;let frame=0;
  function restore(){
   if(handoff.current!==request)return;if(interaction.current!==request!.interaction){handoff.current=null;return;}
   const overlay=document.querySelector(`.${CSS.escape(confirmClass)}`)?.closest('.ui-modal-overlay');if(overlay){if(overlay.hasAttribute('data-exiting'))frame=requestAnimationFrame(restore);else handoff.current=null;return;}
   handoff.current=null;
   const active=document.activeElement;if(focusable(active)&&!root.current?.contains(active)&&active.closest('.ui-modal-overlay')!==root.current?.closest('.ui-modal-overlay'))return;
   const target=request!.next?rows.current.get(request!.next):undefined;(target??inviteTrigger.current??root.current)?.focus({preventScroll:true});
  }
  const cancel=()=>{handoff.current=null;};document.addEventListener('keydown',cancel,true);document.addEventListener('pointerdown',cancel,true);
  frame=requestAnimationFrame(restore);return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',cancel,true);document.removeEventListener('pointerdown',cancel,true);};
 },[removeOpen,members,confirmClass]);
 async function changeRole(member:TeamMember,next:string){
  if(!onRoleChange||member.isOwner||jobs.current.has(member.id))return;
  const token=Symbol();jobs.current.set(member.id,token);setBusy(new Set(jobs.current.keys()));setErrors(previous=>{const nextErrors=new Map(previous);nextErrors.delete(member.id);return nextErrors;});
  try{await onRoleChange(member.id,next);}
  catch(error){if(alive.current&&jobs.current.get(member.id)===token&&latest.current.some(item=>item.id===member.id&&item.roleId===member.roleId))setErrors(previous=>new Map(previous).set(member.id,message(error)));}
  finally{if(alive.current&&jobs.current.get(member.id)===token){jobs.current.delete(member.id);setBusy(new Set(jobs.current.keys()));}}
 }
 function openInvite(){if(!onInvite||inviteJob.current)return;setName('');setNameError('');setEmail('');setRoleId(roles.find(role=>!role.isDisabled)?.id??'');setInviteError('');setInviteOpen(true);}
 async function invite(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!onInvite||inviteJob.current||!roleId)return;const snapshot={name:name.trim(),email:email.trim(),roleId};if(!snapshot.name){setNameError('Enter a full name.');nameInput.current?.focus();return;}inviteJob.current=true;setInviting(true);setInviteError('');
  try{await onInvite(snapshot);if(alive.current)setInviteOpen(false);}
  catch(error){if(alive.current)setInviteError(message(error));}
  finally{inviteJob.current=false;if(alive.current)setInviting(false);}
 }
 async function remove(){
  if(!selected||!onRemove||selected.isOwner||selected.id===currentUserId||removeJob.current)return;
  const saved=latest.current.find(member=>member.id===selected.id);if(!saved||saved.isOwner){setRemoveOpen(false);return;}
  const snapshot=selected,index=members.findIndex(member=>member.id===snapshot.id),next=members[index+1]??members[index-1];removeJob.current=true;setRemoving(true);setRemoveError('');
  try{await onRemove(snapshot.id);if(alive.current){handoff.current={next:next?.id,interaction:interaction.current};setRemoveOpen(false);}}
  catch(error){if(alive.current)setRemoveError(message(error));}
  finally{removeJob.current=false;if(alive.current)setRemoving(false);}
 }
 const tableFilters:DataTableFilter<TeamMember>[]=[{id:'role',label:'All roles',ariaLabel:'Filter members by role',options:[{value:'owner',label:'Owner'},...roles.map(role=>({value:role.id,label:role.label}))],getValue:member=>member.isOwner?'owner':member.roleId},{id:'status',label:'All statuses',ariaLabel:'Filter members by status',options:[{value:'active',label:'Active'},{value:'invited',label:'Invited'},{value:'suspended',label:'Suspended'}],getValue:member=>member.status??'active'}];
 return <Card ref={root} role="region" aria-label={title} tabIndex={-1} padding="none" variant={variant==='soft'?'soft':'bordered'} data-team-variant={variant} data-density={density} className={cx('ui-team-members',className)} onKeyDownCapture={()=>interaction.current++} onPointerDownCapture={()=>interaction.current++}>
  {showHeader?<CardHeader title={title} description={description} actions={layout==='list'&&showInviteAction&&onInvite&&<Button ref={inviteTrigger} size="small" leadingIcon={RiUserAddLine} onClick={openInvite}>Invite member</Button>}/>:layout==='list'&&showInviteAction&&onInvite?<div className="ui-team-members__toolbar"><Button ref={inviteTrigger} size="small" leadingIcon={RiUserAddLine} onClick={openInvite}>Invite member</Button></div>:null}
  {layout==='table'?<TeamTableContext.Provider value={{roles,busy,errors,currentUserId,showEmail,showStatus,register,onRoleChange:onRoleChange?(member,role)=>void changeRole(member,role):undefined,onRemove:onRemove?member=>{setSelected({...member});setRemoveError('');setRemoveOpen(true);}:undefined}}><DataTable className="ui-team-members__table" data={members} columns={memberTableColumns} getRowId={member=>member.id} filters={tableFilters} toolbarActions={showInviteAction&&onInvite?<Button ref={inviteTrigger} leadingIcon={RiUserAddLine} onClick={openInvite}>Invite member</Button>:undefined} enableRowSelection={false} showPagination={false} size={density==='compact'?'sm':'md'} searchPlaceholder="Search members" resultLabel="members" emptyState={<EmptyState size="small" title="No matching members" description="Try another name or clear the filters." icon={<RiTeamLine size={24}/>}/>}/></TeamTableContext.Provider>:<><AnimatedHeight><div className="ui-team-members__body"><ItemGroup spacing="joined" size={density==='compact'?'small':'medium'} aria-label={`${title} list`} className="ui-team-members__list"><AnimatePresence initial={false} custom={{empty:members.length===0,fromEmpty}}>{members.map(member=><MemberRow key={member.id} member={member} roles={roles} density={density} showEmail={showEmail} showStatus={showStatus} isCurrent={member.id===currentUserId} busy={busy.has(member.id)} error={errors.get(member.id)} onRoleChange={onRoleChange?next=>void changeRole(member,next):undefined} onRemove={onRemove?()=>{setSelected({...member});setRemoveError('');setRemoveOpen(true);}:undefined} register={register} animateOnMount={hydrated.current}/>)}</AnimatePresence></ItemGroup><AnimatePresence initial={false} mode="popLayout">{!members.length&&<EmptyTeam key="empty"/>}</AnimatePresence></div></AnimatedHeight>
  <CardFooter><span role="status">{members.length} {members.length===1?'member':'members'}</span></CardFooter></>}
  <Dialog title="Invite member" description="Add a person with the appropriate workspace role." isOpen={inviteOpen} onOpenChange={open=>{if(!inviteJob.current)setInviteOpen(open);}} isDismissable={!inviting} isKeyboardDismissDisabled={inviting} showCloseButton={!inviting} size="small">
   <Form onSubmit={invite} className="ui-team-members__form"><FieldSet legend="Member details" disabled={inviting}><FieldGroup><Input label="Full name" name="full-name" inputRef={nameInput} value={name} onChange={value=>{setName(value);setNameError('');}} error={nameError} isRequired/><Input label="Email address" name="email" type="email" value={email} onChange={value=>{setEmail(value);setInviteError('');}} isRequired/><Select label="Workspace role" options={roles} selectedKey={roleId} onSelectionChange={key=>setRoleId(key??'')} isRequired/></FieldGroup></FieldSet><ErrorFeedback error={inviteError}/><div className="ui-team-members__form-actions"><Button variant="secondary" disabled={inviting} onClick={()=>setInviteOpen(false)}>Cancel</Button><Button type="submit" isLoading={inviting} loadingLabel="Adding member">Add member</Button></div></Form>
  </Dialog>
  <Dialog title={`Remove ${selected?.name??'member'}?`} description={selected?.email} role="alertdialog" className={confirmClass} isOpen={removeOpen} onOpenChange={open=>{if(!removeJob.current)setRemoveOpen(open);}} isDismissable={!removing} isKeyboardDismissDisabled={removing} showCloseButton={!removing} size="small" footer={<><Button variant="secondary" disabled={removing} onClick={()=>setRemoveOpen(false)}>Cancel</Button><Button variant="danger" isLoading={removing} loadingLabel="Removing member" onClick={()=>void remove()}>Remove member</Button></>}><p className="ui-team-members__confirmation-copy">This person will no longer appear in the workspace member list.</p><ErrorFeedback error={removeError}/></Dialog>
 </Card>;
}
