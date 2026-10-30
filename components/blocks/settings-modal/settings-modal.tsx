'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog as AriaDialog, Modal, ModalOverlay, Form } from 'react-aria-components';
import { RiSettings4Line, RiUser3Line, RiToolsLine, RiHardDrive2Line, RiPaletteLine, RiBankCardLine, RiGitBranchLine, RiPuzzleLine, RiTerminalBoxLine, RiMagicLine, RiComputerLine, RiArrowRightSLine } from '@remixicon/react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Alert } from '@/components/base/alert/alert';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Button } from '@/components/base/buttons/button';
import { Input, type InputProps } from '@/components/base/input/input';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Select } from '@/components/base/select/select';
import { Switch } from '@/components/base/switch/switch';
import { AgentLimitsCard, type AgentLimitsCardProps } from '@/components/blocks/agent-limits/agent-limits-card';
import { cx } from '@/utils/cx';

export type SettingsPage = 'general' | 'profile' | 'appearance' | 'billing' | 'rules' | 'tools' | 'storage' | 'desktop' | 'plugins' | 'developer' | 'skills' | 'git';
export type SettingsField = { id: string; label: string; description?: string; kind: 'toggle' | 'select' | 'text'; defaultValue?: string | boolean; type?: InputProps['type']; placeholder?: string; isDisabled?: boolean; maxLength?: number; options?: { value: string; label: string }[] };
export type SettingsPageDefinition = { description?: string; fields: SettingsField[] };
export type SettingsValues = { workspaceName: string; name: string; email: string; notifications: boolean; compactMode: boolean; reviewProvider: string; reviewDestination: string; additional: Record<string,string | boolean> };
export type SettingsModalProps = { isOpen: boolean; onClose: () => void; initialPage?: SettingsPage; workspaceName?: string; name?: string; email?: string; planName?: string; planPrice?: string; planDescription?: string; pageContent?: Partial<Record<SettingsPage, ReactNode>>; extraPages?: Partial<Record<SettingsPage, SettingsPageDefinition>>; usageLimits?: AgentLimitsCardProps; onPlanClick?: () => void; onSave?: (settings: SettingsValues) => void | Promise<void>; className?: string };
const pageGroups = [
  { label: '', items: [{ id: 'general', label: 'General', icon: RiSettings4Line }, { id: 'profile', label: 'Profile', icon: RiUser3Line }, { id: 'appearance', label: 'Appearance', icon: RiPaletteLine }, { id: 'billing', label: 'Billing', icon: RiBankCardLine }, { id: 'rules', label: 'Rules and workflows', icon: RiGitBranchLine }, { id: 'tools', label: 'Tools', icon: RiToolsLine }, { id: 'storage', label: 'Storage', icon: RiHardDrive2Line }] },
  { label: 'Desktop app', items: [{ id: 'desktop', label: 'General', icon: RiComputerLine }, { id: 'plugins', label: 'Plugins', icon: RiPuzzleLine }, { id: 'developer', label: 'Developer', icon: RiTerminalBoxLine }] },
  { label: 'Customize', items: [{ id: 'skills', label: 'Skills', icon: RiMagicLine }, { id: 'git', label: 'Git', icon: RiGitBranchLine }] },
] as const;
const allPages = pageGroups.flatMap(group => group.items.map(item => ({ id: item.id as SettingsPage, label: item.label })));
const defaultExtraPages: Partial<Record<SettingsPage, SettingsPageDefinition>> = {
  rules: { description: 'Set the rules your team follows when work changes.', fields: [{ id: 'review', label: 'Require review', description: 'Ask for approval before shared changes are applied.', kind: 'toggle', defaultValue: true }, { id: 'branch', label: 'Working branch', description: 'The branch used for new changes.', kind: 'text', defaultValue: 'main' }] },
  tools: { description: 'Choose the tools available to this workspace.', fields: [{ id: 'code', label: 'Code review', description: 'Show review actions inside the workspace.', kind: 'toggle', defaultValue: true }, { id: 'design', label: 'Design files', description: 'Show linked design files with projects.', kind: 'toggle', defaultValue: false }] },
  storage: { description: 'Manage how project files are kept.', fields: [{ id: 'cleanup', label: 'Clean temporary files', description: 'Remove temporary uploads after a completed task.', kind: 'toggle', defaultValue: true }, { id: 'retention', label: 'File retention', description: 'Choose how long temporary files are kept.', kind: 'select', defaultValue: '30', options: [{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }] }] },
  desktop: { description: 'Control this app on your computer.', fields: [{ id: 'startup', label: 'Open at login', description: 'Start the app when you sign in.', kind: 'toggle', defaultValue: false }, { id: 'alerts', label: 'Desktop notifications', description: 'Show status updates on your desktop.', kind: 'toggle', defaultValue: true }] },
  plugins: { description: 'Manage optional workspace extensions.', fields: [{ id: 'enabled', label: 'Enable installed plugins', description: 'Allow enabled plugins to run in this workspace.', kind: 'toggle', defaultValue: true }, { id: 'requests', label: 'Allow plugin requests', description: 'Let members suggest new extensions.', kind: 'toggle', defaultValue: false }] },
  developer: { description: 'Adjust diagnostics for local development.', fields: [{ id: 'logs', label: 'Detailed logs', description: 'Include extra information in local logs.', kind: 'toggle', defaultValue: false }, { id: 'level', label: 'Log level', kind: 'select', defaultValue: 'info', options: [{ value: 'error', label: 'Errors' }, { value: 'info', label: 'Info' }, { value: 'debug', label: 'Debug' }] }] },
  skills: { description: 'Choose how custom capabilities appear.', fields: [{ id: 'enabled', label: 'Enable custom skills', description: 'Make workspace skills available in new tasks.', kind: 'toggle', defaultValue: true }] },
  git: { description: 'Choose defaults for version control.', fields: [{ id: 'branch', label: 'Default branch', kind: 'text', defaultValue: 'main' }, { id: 'fetch', label: 'Fetch changes automatically', description: 'Check for remote changes in the background.', kind: 'toggle', defaultValue: true }] },
};

function SaveFeedback({ error, notice }: { error: string; notice: string }) {
  const present = useIsPresent();
  return <div className="ui-settings-modal__save-feedback" inert={!present} aria-hidden={!present || undefined}><Alert role={error?'alert':'status'} tone={error?'error':'success'} title={error?'Settings were not saved':'Previous changes saved'} description={error || notice}/></div>;
}

export function SettingsModal({ isOpen, onClose, initialPage = 'general', workspaceName = '', name = '', email = '', planName = 'Studio', planPrice = '$49/mo', planDescription = 'More room for your team and projects.', pageContent, extraPages, usageLimits, onPlanClick, onSave, className }: SettingsModalProps) {
  const [page, setPage] = useState<SettingsPage>(initialPage);
  const [workspace, setWorkspace] = useState(workspaceName);
  const [displayName, setDisplayName] = useState(name);
  const [address, setAddress] = useState(email);
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [reviewProvider, setReviewProvider] = useState('GitHub');
  const [reviewDestination, setReviewDestination] = useState('In this workspace');
  const [additional, setAdditional] = useState<Record<string,string | boolean>>({});
  const titleId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [saving,setSaving] = useState(false),[saveError,setSaveError] = useState(''),[saveNotice,setSaveNotice] = useState(''),[emailError,setEmailError] = useState('');
  const savingRef = useRef(false), request = useRef(0), openRef = useRef(isOpen);
  const values: SettingsValues = {workspaceName:workspace,name:displayName,email:address,notifications,compactMode,reviewProvider,reviewDestination,additional};
  const signature = JSON.stringify(values), currentSignature = useRef(signature);
  const reduced = useReducedMotion();
  useLayoutEffect(()=>{currentSignature.current=signature;},[signature]);
  useLayoutEffect(()=>{
    openRef.current=isOpen;request.current++;savingRef.current=false;
    if(isOpen){setSaving(false);setSaveError('');setSaveNotice('');}
  },[isOpen]);
  useEffect(()=>()=>{openRef.current=false;request.current++;},[]);
  async function save() {
    if(savingRef.current || !openRef.current)return;
    // Validate the profile address even when a different settings page is visible.
    const probe=document.createElement('input');probe.type='email';probe.value=address;
    if(!probe.checkValidity()){
      setEmailError('Enter a valid email address.');setPage('profile');
      requestAnimationFrame(()=>emailRef.current?.focus({preventScroll:true}));return;
    }
    const operation=++request.current, submitted=signature;
    savingRef.current=true;setSaving(true);setSaveError('');setSaveNotice('');
    try{
      await onSave?.(values);
      if(operation!==request.current || !openRef.current)return;
      if(currentSignature.current===submitted)onClose();
      else setSaveNotice('Your newer edits are still here. Save again when they are ready.');
    }catch(error){
      if(operation===request.current && openRef.current)setSaveError(error instanceof Error?error.message:'Try saving again.');
    }finally{
      if(operation===request.current && openRef.current){savingRef.current=false;setSaving(false);}
    }
  }
  useEffect(() => { if (isOpen) setPage(initialPage); }, [isOpen, initialPage]);
  const pageLabel = allPages.find(item => item.id === page)?.label ?? 'Settings';
  const extraDefinition = extraPages?.[page] ?? defaultExtraPages[page];
  return <ModalOverlay isOpen={isOpen} onOpenChange={open => { if (!open) onClose(); }} isDismissable className="ui-modal-overlay ui-settings-backdrop">
    <Modal className="ui-modal-surface ui-settings-surface">{({isExiting})=><AriaDialog inert={isExiting} aria-labelledby={titleId} className={cx('ui-settings-modal', className)}>
      <aside><h2 id={titleId}>Settings</h2><nav aria-label="Settings pages">{pageGroups.map(group => <div className="ui-settings-modal__nav-group" key={group.label || 'workspace'}>{group.label && <span>{group.label}</span>}{group.items.map(item => <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><item.icon size={17} aria-hidden />{item.label}</button>)}</div>)}</nav></aside>
      <section><header><h3>{pageLabel}</h3><CloseButton size="xs" aria-label="Close settings" onClick={onClose}/></header>
        <Form className="ui-settings-modal__form" aria-label="Workspace settings" validationBehavior="native" onSubmit={event=>{event.preventDefault();void save();}}>
        <div className="ui-settings-modal__content">{pageContent?.[page] ?? <>
          {page === 'general' && <>
            <div className="ui-settings-modal__plan"><div><small>Current plan</small><strong>{planName} {planPrice}</strong><span>{planDescription}</span>{onPlanClick && <Button size="small" variant="secondary" onClick={onPlanClick}>Manage plan</Button>}</div><div className="ui-settings-modal__plan-art" aria-hidden /></div>
            <button type="button" className="ui-settings-modal__limit" onClick={() => setPage('billing')}><span><strong>Limits</strong><small>Review usage across your workspace.</small></span><span>Manage limits <RiArrowRightSLine size={16} aria-hidden /></span></button>
            <div className="ui-settings-modal__section-label">Pull requests</div>
            <div className="ui-settings-modal__choice"><span><strong>Review provider</strong><small>Choose where code reviews happen.</small></span><Select aria-label="Review provider" selectedKey={reviewProvider} onSelectionChange={value => { if (value) setReviewProvider(value); }} options={['GitHub','GitLab','Bitbucket'].map(value => ({ id: value, label: value }))}/></div>
            <div className="ui-settings-modal__choice"><span><strong>PR destination</strong><small>Open pull request links inside the app.</small></span><Select aria-label="PR destination" selectedKey={reviewDestination} onSelectionChange={value => { if (value) setReviewDestination(value); }} options={['In this workspace','In browser'].map(value => ({ id: value, label: value }))}/></div>
            <div className="ui-settings-modal__section-label">Workspace</div>
            <Input label="Workspace name" name="workspaceName" value={workspace} onChange={setWorkspace}/>
            <div className="ui-settings-modal__setting"><div><strong>Notifications</strong><small>Get updates about activity in your workspace.</small></div><Switch aria-label="Notifications" isSelected={notifications} onChange={setNotifications} /></div>
          </>}
          {page === 'profile' && <><div className="ui-settings-modal__avatar">{displayName.slice(0,1).toUpperCase() || 'U'}</div><Input label="Display name" name="name" value={displayName} onChange={setDisplayName}/><Input inputRef={emailRef} label="Email address" name="email" type="email" value={address} error={emailError || undefined} onChange={value=>{setAddress(value);setEmailError('');}}/></>}
          {page === 'appearance' && <><div className="ui-settings-modal__setting"><div><strong>Compact mode</strong><small>Show more content in less space.</small></div><Switch aria-label="Compact mode" isSelected={compactMode} onChange={setCompactMode} /></div><div className="ui-settings-modal__setting"><div><strong>Notifications</strong><small>Show status changes as they happen.</small></div><Switch aria-label="Status notifications" isSelected={notifications} onChange={setNotifications} /></div></>}
          {page === 'billing' && <><div className="ui-settings-modal__plan"><div><small>Current plan</small><strong>{planName} {planPrice}</strong><span>{planDescription}</span>{onPlanClick && <Button size="small" variant="secondary" onClick={onPlanClick}>Manage plan</Button>}</div><div className="ui-settings-modal__plan-art" aria-hidden /></div><div className="ui-settings-modal__setting"><div><strong>Usage</strong><small>Plan usage and limits for this workspace.</small></div></div>{usageLimits && <AgentLimitsCard {...usageLimits} onPlanClick={usageLimits.onPlanClick ?? onPlanClick}/>}</>}
          {!['general','profile','appearance','billing'].includes(page) && extraDefinition && <div className="ui-settings-modal__extras">{extraDefinition.description && <p>{extraDefinition.description}</p>}{extraDefinition.fields.map(field => { const key = `${page}.${field.id}`; const current = additional[key] ?? field.defaultValue ?? (field.kind === 'toggle' ? false : ''); return <div className="ui-settings-modal__setting" data-kind={field.kind} key={key}><div><strong>{field.label}</strong>{field.description && <small id={`${titleId}-${key}-description`}>{field.description}</small>}</div>{field.kind === 'toggle' ? <Switch isDisabled={field.isDisabled} aria-describedby={field.description?`${titleId}-${key}-description`:undefined} aria-label={field.label} isSelected={Boolean(current)} onChange={value => setAdditional(values => ({ ...values, [key]: value }))} /> : field.kind === 'select' ? <Select isDisabled={field.isDisabled} aria-describedby={field.description?`${titleId}-${key}-description`:undefined} aria-label={field.label} selectedKey={String(current)} onSelectionChange={value => { if (value !== null) setAdditional(values => ({ ...values, [key]: value })); }} options={(field.options ?? []).map(option => ({ id: option.value, label: option.label }))}/> : <Input label={field.label} hideLabel name={key} type={field.type} placeholder={field.placeholder} maxLength={field.maxLength} isDisabled={field.isDisabled} aria-describedby={field.description?`${titleId}-${key}-description`:undefined} value={String(current)} onChange={value => setAdditional(values => ({ ...values, [key]: value }))}/>}</div>; })}</div>}
        </>}
        </div>
        <AnimatedHeight className="ui-settings-modal__save-status"><AnimatePresence initial={false} mode="popLayout">{(saveError || saveNotice) && <motion.div key={saveError?'error':'notice'} initial={{opacity:0,y:reduced?0:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-3}} transition={{duration:reduced?0:.16,ease:[.2,.75,.25,1]}}><SaveFeedback error={saveError} notice={saveNotice}/></motion.div>}</AnimatePresence></AnimatedHeight>
        <footer><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" isLoading={saving} loadingLabel="Saving">Save changes</Button></footer>
        </Form>
      </section>
    </AriaDialog>}</Modal>
  </ModalOverlay>;
}
