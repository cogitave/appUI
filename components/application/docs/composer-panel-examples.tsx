'use client';

import { publicPath } from '@/config/deployment';
import { useRef, useState, type ReactNode } from 'react';
import { ComposerPanel, ComposerStatusTab, COMPOSER_PERMISSIONS, EFFORT_LEVELS, ModelPicker, PermissionMenu, type ComposerPermission } from '@/components/blocks/composer-panel/composer-panel';
import { type ComposerAttachment } from '@/components/blocks/composer/composer-attachments';
import { Button } from '@/components/base/buttons/button';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { LinkButton } from '@/components/base/buttons/link-button';
import { sectionId } from './docs-data';

type Props = { onNotify: (message: string) => void };
function Example({ title, description, children, code }: { title: string; description: string; children: ReactNode; code?: string }) {
  return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p><div className="docs-example__surface docs-composer-panel-example">{children}</div>{code && <CodeBlock label="Usage" examples={[{ value: 'tsx', label: 'tsx', code }]} />}</section>;
}

export function ComposerPanelPreview({ onNotify }: Props) {
  return <div className="docs-preview__composer"><ComposerPanel learnMoreHref="#permissions" onVoice={() => onNotify('Voice input selected.')} onSend={message => onNotify(`Sent: ${message}`)} /></div>;
}

export function ComposerPanelExamples({ onNotify }: Props) {
  const [permission, setPermission] = useState<ComposerPermission>('auto');
  const [model, setModel] = useState('fable');
  const [effort, setEffort] = useState(3);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([{ id: 'brief', name: 'Design brief.pdf', status: 'ready' }, { id: 'portrait', name: 'Portrait.png', thumbnail: publicPath("/avatars/studio-portrait.png"), status: 'ready' }]);
  const currentPermission = COMPOSER_PERMISSIONS.find(item => item.id === permission)!;
  return <>
    <Example title="Permissions" description="Choose Auto, Manual, Plan mode or Bypass all. Use the menu on its own, or pass permission and onPermissionChange to the panel. Your application applies the selected mode." code={'<ComposerPanel defaultPermission="plan" />\n\n<PermissionMenu value={permission} onChange={setPermission}\n  onLearnMore={showPermissionHelp} />'}>
      <PermissionMenu value={permission} onChange={setPermission} onLearnMore={() => onNotify('Auto delegates approval decisions. Manual requests review. Plan mode prepares a plan. Bypass all skips approval prompts.')} />
      <p className="docs-composer-panel-example__result" role="status">{currentPermission.label}: {currentPermission.description}</p>
    </Example>
    <Example title="Model picker" description="Browse providers, search across every model with Quick Search or /, and adjust effort on the selected row. The included catalogue is demo data; pass providers to use your application's models." code={'<ComposerPanel selectedModel={model} onModelChange={setModel}\n  effort={effort} onEffortChange={setEffort} providers={providers} />\n\n<ModelPicker value={model} onChange={setModel}\n  effort={effort} onEffortChange={setEffort} />'}>
      <ModelPicker value={model} onChange={setModel} effort={effort} onEffortChange={setEffort} />
      <p className="docs-composer-panel-example__result" role="status">{model} · {EFFORT_LEVELS[effort]} effort</p>
    </Example>
    <Example title="Status tab" description="The status slot accepts branch, project and context information, a custom element, or null for a panel without the tab." code={'<ComposerPanel status={\n  <ComposerStatusTab branch="release/2.0" project="studio" context={82} />\n} />\n\n<ComposerPanel status={null} />'}>
      <ComposerPanel status={<ComposerStatusTab branch="release/2.0" project="studio" context={82} />} onSend={message => onNotify(`Sent: ${message}`)} />
      <ComposerPanel status={null} placeholder="Write without a status tab…" onSend={message => onNotify(`Sent: ${message}`)} />
    </Example>
    <Example title="Wiring it up" description="Enter sends and Shift+Enter adds a line. The prompt grows up to ten lines. Control the draft, disable sending during a response, and focus the field through inputRef." code={'const inputRef = useRef<HTMLTextAreaElement>(null);\n<ComposerPanel value={draft} onChange={setDraft} onSend={send}\n  disabled={waiting} inputRef={inputRef} />'}>
      <div className="docs-composer-panel-example__actions"><Button variant="secondary" size="small" onClick={() => inputRef.current?.focus()}>Focus prompt</Button><Button variant="secondary" size="small" aria-pressed={busy} onClick={() => setBusy(value => !value)}>{busy ? 'Finish response' : 'Simulate response'}</Button></div>
      <ComposerPanel showStatus={false} inputRef={inputRef} value={draft} onChange={setDraft} disabled={busy} onSend={setSent} onVoice={() => onNotify('Voice input selected.')} />
      <p className="docs-composer-panel-example__result" role="status">{busy ? 'Waiting for a response…' : sent ? `Sent: ${sent}` : 'Type a message to try sending.'}</p>
    </Example>
    <Example title="Attachments" description="Files use the same attachment tiles and upload states as Composer Attachments. The plus menu, removal controls and custom upload callbacks work in both layouts.">
      <ComposerPanel attachments={attachments} onAddFiles={files => setAttachments(current => [...current, ...files.map(file => ({ id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, status: 'ready' as const }))])} onRemoveAttachment={id => setAttachments(current => current.filter(item => item.id !== id))} onSend={message => onNotify(`Sent: ${message}`)} />
      <LinkButton href={publicPath("/components/composer-attachments")}>Explore upload queues and attachment states</LinkButton>
    </Example>
  </>;
}
