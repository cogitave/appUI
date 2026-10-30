'use client';

import type { ComponentProps } from 'react';
import { AIChatTemplate } from './ai-chat-template';
import { AgentWorkspaceTemplate } from './agent-workspace-template';
import { AIImageGenerationTemplate, AIProfileTemplate, ChatStarterTemplate, FinanceDashboardTemplate, HomeDashboardTemplate, MarketingDashboardTemplate, MedicalProfileTemplate, MultiAgentChatTemplate } from './template-presets';

/** A preset selects a screen composition; each branch retains its own data and callbacks. */
export type WorkspaceTemplateProps =
  | ({ preset?: 'chat' } & ComponentProps<typeof AIChatTemplate>)
  | ({ preset: 'agent' } & ComponentProps<typeof AgentWorkspaceTemplate>)
  | ({ preset: 'multi-agent' } & ComponentProps<typeof MultiAgentChatTemplate>)
  | ({ preset: 'starter' } & ComponentProps<typeof ChatStarterTemplate>)
  | ({ preset: 'image-generation' } & ComponentProps<typeof AIImageGenerationTemplate>);

export function WorkspaceTemplate(props: WorkspaceTemplateProps) {
  if (props.preset === 'agent') { const { preset, ...options } = props; return <AgentWorkspaceTemplate {...options}/>; }
  if (props.preset === 'multi-agent') { const { preset, ...options } = props; return <MultiAgentChatTemplate {...options}/>; }
  if (props.preset === 'starter') { const { preset, ...options } = props; return <ChatStarterTemplate {...options}/>; }
  if (props.preset === 'image-generation') { const { preset, ...options } = props; return <AIImageGenerationTemplate {...options}/>; }
  const { preset, ...options } = props;
  return <AIChatTemplate {...options}/>;
}

export type DashboardTemplateProps =
  | ({ preset?: 'overview' } & ComponentProps<typeof HomeDashboardTemplate>)
  | ({ preset: 'finance' } & ComponentProps<typeof FinanceDashboardTemplate>)
  | ({ preset: 'marketing' } & ComponentProps<typeof MarketingDashboardTemplate>);

export function DashboardTemplate(props: DashboardTemplateProps) {
  if (props.preset === 'finance') { const { preset, ...options } = props; return <FinanceDashboardTemplate {...options}/>; }
  if (props.preset === 'marketing') { const { preset, ...options } = props; return <MarketingDashboardTemplate {...options}/>; }
  const { preset, ...options } = props;
  return <HomeDashboardTemplate {...options}/>;
}

export type ProfileTemplateProps =
  | ({ preset?: 'account' } & ComponentProps<typeof AIProfileTemplate>)
  | ({ preset: 'medical' } & ComponentProps<typeof MedicalProfileTemplate>);

export function ProfileTemplate(props: ProfileTemplateProps) {
  if (props.preset === 'medical') { const { preset, ...options } = props; return <MedicalProfileTemplate {...options}/>; }
  const { preset, ...options } = props;
  return <AIProfileTemplate {...options}/>;
}
