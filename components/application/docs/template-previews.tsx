'use client';

import { useRef, useState } from 'react';
import { SettingsModal, type SettingsValues } from '@/components/blocks/settings-modal/settings-modal';
import { DashboardTemplate, ProfileTemplate, WorkspaceTemplate, ProjectBoardTemplate } from '@/components/templates/templates';
import { PaywallTemplate } from '@/components/templates/paywall/paywall-template';
import type { DocSlug } from './docs-data';

type Props = { slug:DocSlug; onNotify:(message:string)=>void };
const workspacePresets = { 'ai-chat':'chat', 'agent-workspace':'agent', 'multi-agent-chat':'multi-agent', 'chat-starter':'starter', 'ai-image-generation':'image-generation' } as const;
const dashboardPresets = { 'home-dashboard':'overview', 'finance-dashboard':'finance', 'marketing-dashboard':'marketing' } as const;
const profilePresets = { 'ai-profile':'account', 'medical-profile':'medical' } as const;
export function TemplatePreview({slug,onNotify}:Props){
  const [settingsOpen,setSettingsOpen]=useState(false),[settings,setSettings]=useState<SettingsValues|null>(null);
  const root=useRef<HTMLDivElement>(null),returnFocus=useRef<HTMLElement|null>(null),focusEpoch=useRef(0);
  function action(message:string){
    if(slug==='ai-chat' && message==='settings'){
      focusEpoch.current++;returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setSettingsOpen(true);
    }else onNotify(message);
  }
  function closeSettings(){
    setSettingsOpen(false);const operation=++focusEpoch.current;
    requestAnimationFrame(()=>{
      if(operation!==focusEpoch.current)return;
      const target=returnFocus.current;
      if(target?.isConnected && !target.closest('[inert]') && getComputedStyle(target).visibility!=='hidden' && target.getClientRects().length)target.focus({preventScroll:true});
      else root.current?.querySelector<HTMLButtonElement>('button[aria-label="Open conversations"]')?.focus({preventScroll:true});
    });
  }
  const workspacePreset=workspacePresets[slug as keyof typeof workspacePresets];
  const dashboardPreset=dashboardPresets[slug as keyof typeof dashboardPresets];
  const profilePreset=profilePresets[slug as keyof typeof profilePresets];
  if(!workspacePreset && !dashboardPreset && !profilePreset && slug!=='paywall' && slug!=='project-board')return null;
  return <div ref={root} className="docs-preview__template">
    {workspacePreset && (workspacePreset==='chat' ? <WorkspaceTemplate preset="chat" onAction={action} workspaceName={settings?.workspaceName}/> : <WorkspaceTemplate preset={workspacePreset} onAction={action}/>)}
    {dashboardPreset && <DashboardTemplate preset={dashboardPreset} onAction={action}/>}
    {profilePreset && <ProfileTemplate preset={profilePreset} onAction={action}/>}
    {slug==='paywall' && <PaywallTemplate onAction={action}/>}
    {slug==='project-board' && <ProjectBoardTemplate onAction={action}/>}
    {slug==='ai-chat' && <SettingsModal isOpen={settingsOpen} onClose={closeSettings} workspaceName="Studio workspace" name="Maya Chen" email="maya@studio.co" onSave={values=>{setSettings(values);onNotify('Settings saved.');}}/>}
  </div>;
}
