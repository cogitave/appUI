'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useState, type ReactNode } from 'react';
import { RiAttachmentLine, RiCodeBoxLine, RiFileTextLine, RiFocus2Line, RiListCheck3, RiSlideshowLine, RiTableLine } from '@remixicon/react';
import { AuthCard, type AuthCardMode } from '@/components/blocks/auth-card/auth-card';
import { Calendar, type CalendarEvent, type CalendarNotification } from '@/components/blocks/calendar/calendar';
import { Composer } from '@/components/blocks/composer/composer';
import type { ComposerMenuGroup } from '@/components/blocks/composer/composer-add-menu';
import { ComposerPanel } from '@/components/blocks/composer-panel/composer-panel';
import { ComposerAttachments, type ComposerAttachment } from '@/components/blocks/composer/composer-attachments';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { BlockLaterPreview, BlockLaterExamples } from './block-later-previews';

type Props = { slug: DocSlug; onNotify: (message: string) => void };
const events: CalendarEvent[] = [
  { id: 'coffee', title: 'Coffee', date: '2026-07-28', time: '09:30', color: 'lime' },
  { id: 'payday-july', title: 'Payday', date: '2026-07-30', color: 'lime' },
  { id: 'brunch-august', title: 'Brunch', date: '2026-08-01', time: '11:00', endTime: '13:00', color: 'lime', meetingProvider: 'Meet', meetingCode: 'jcy-wdkq-rrp', timezone: 'GMT+3 Istanbul', reminder: '2h before', attendees: ['maya@example.com', 'eric@example.com', 'olivia@example.com'] },
  { id: 'standup', title: 'Stand-up', date: '2026-08-02', time: '11:30', color: 'pink' },
  { id: 'sync', title: '1:1 sync', date: '2026-08-02', time: '16:30', color: 'lime' },
  { id: 'gym', title: 'Gym', date: '2026-08-05', time: '07:00', color: 'pink' },
  { id: 'game', title: 'Game night', date: '2026-08-08', time: '19:00', color: 'purple' },
  { id: 'holiday', title: 'Holidays', date: '2026-08-11', color: 'cyan' },
  { id: 'birthday', title: 'Birthday dinner', date: '2026-08-11', time: '20:30', color: 'purple' },
  { id: 'retro', title: 'Retro', date: '2026-08-14', time: '15:00', color: 'blue' },
  { id: 'planning', title: 'Planning', date: '2026-08-17', time: '10:00', color: 'blue' },
  { id: 'haircut', title: 'Haircut', date: '2026-08-17', time: '16:00', color: 'cyan' },
  { id: 'standup-20', title: 'Stand-up', date: '2026-08-20', time: '11:30', color: 'pink' },
  { id: 'tea-20', title: 'Team tea', date: '2026-08-20', time: '13:00', color: 'purple' },
  { id: 'portfolio-20', title: 'Portfolio review', date: '2026-08-20', time: '14:30', color: 'blue' },
  { id: 'sync-20', title: '1:1 sync', date: '2026-08-20', time: '16:30', color: 'lime' },
  { id: 'notes-20', title: 'Review notes', date: '2026-08-20', time: '17:00', color: 'cyan' },
  { id: 'wrap-20', title: 'Wrap-up', date: '2026-08-20', time: '17:30', color: 'pink' },
  { id: 'dinner', title: 'Dinner', date: '2026-08-24', time: '19:15', color: 'purple' },
  { id: 'yoga', title: 'Yoga', date: '2026-08-27', time: '07:30', color: 'pink' },
  { id: 'brunch-end', title: 'Brunch', date: '2026-08-29', time: '11:00', color: 'lime' },
  { id: 'payday-august', title: 'Payday', date: '2026-08-31', color: 'lime' },
];
const notifications: CalendarNotification[] = [
  { id: '1', title: 'Brunch starts soon', detail: 'August 1 at 11:00' },
  { id: '2', title: 'Team tea', detail: 'August 20 at 13:00' },
  { id: '3', title: 'Portfolio review', detail: 'August 20 at 14:30' },
  { id: '4', title: 'Planning', detail: 'August 17 at 10:00' },
  { id: '5', title: 'Retro', detail: 'August 14 at 15:00' },
];
const composerMenuGroups: ComposerMenuGroup[] = [
  { label: 'Add', items: [
    { id: 'files', label: 'Files and folders', icon: <RiAttachmentLine size={18} /> },
    { id: 'goal', label: 'Goal', description: 'Set a goal for faster results', icon: <RiFocus2Line size={18} /> },
    { id: 'plan', label: 'Plan mode', description: 'Manage complex tasks', icon: <RiListCheck3 size={18} /> },
  ] },
  { label: 'Plugins', items: [
    { id: 'documents', label: 'Documents', description: 'Create and edit documents', icon: <RiFileTextLine size={16} /> },
    { id: 'spreadsheets', label: 'Spreadsheets', description: 'Generate spreadsheets', icon: <RiTableLine size={16} /> },
    { id: 'presentations', label: 'Presentations', description: 'Create marketing assets', icon: <RiSlideshowLine size={16} /> },
    { id: 'code', label: 'Code blocks', description: 'Write and edit existing code', icon: <RiCodeBoxLine size={16} /> },
  ] },
];
const starterAttachments: ComposerAttachment[] = [{ id: 'portrait', name: 'portrait.png', thumbnail: publicPath("/avatars/studio-portrait.png"), status: 'uploading', progress: 0 }];
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p>{children}</section>; }

export function BlockMorePreview({ slug, onNotify }: Props) {
  const [authMode, setAuthMode] = useState<AuthCardMode>('sign-in');
  const [attachments, setAttachments] = useState(starterAttachments);
  useEffect(() => { if (slug !== 'composer-attachments' || !attachments.some(item => item.status === 'uploading')) return; const timer = window.setTimeout(() => setAttachments(current => current.map(item => item.status === 'uploading' ? { ...item, progress: Math.min(100,(item.progress ?? 0) + 5), status: (item.progress ?? 0) >= 95 ? 'ready' : 'uploading' } : item)), 140); return () => window.clearTimeout(timer); }, [slug,attachments]);
  switch (slug) {
    case 'auth-card': return <div className="docs-preview__block"><AuthCard mode={authMode} onModeChange={setAuthMode} onSubmit={data => onNotify(`${data.get('email')} submitted.`)} onProvider={provider => onNotify(`${provider} sign-in selected.`)} onVerify={code => onNotify(`Code ${code} entered.`)} /></div>;
    case 'calendar': return <div className="docs-preview__calendar"><Calendar events={events} notifications={notifications} defaultMonth={new Date(2026,7,1)} onNewEvent={date => onNotify(`New event ${date ?? 'selected'}.`)} onJoinMeeting={event => onNotify(`Join ${event.title} selected.`)} /></div>;
    case 'composer': return <div className="docs-preview__composer"><Composer menuGroups={composerMenuGroups} onMenuAction={id => onNotify(`${composerMenuGroups.flatMap(group => group.items).find(item => item.id === id)?.label ?? id} selected.`)} branch="Main" project="project-sea" agentLabel="Agent" contextPercent={57} onSend={message => onNotify(`Sent: ${message}`)} onVoice={() => onNotify('Voice input selected.')} /></div>;
    case 'composer-attachments': return <div className="docs-preview__composer"><ComposerPanel attachments={attachments} onAddFiles={files => setAttachments(current => [...current,...files.map(file => ({ id: `${file.name}-${file.lastModified}`, name: file.name, status: 'uploading' as const, progress: 0 }))])} onRemoveAttachment={id => setAttachments(current => current.filter(item => item.id !== id))} permission="bypass" onVoice={() => onNotify('Voice input selected.')} onSend={message => onNotify(`Sent: ${message}`)} /></div>;
    default: return <BlockLaterPreview slug={slug} onNotify={onNotify} />;
  }
}

export function BlockMoreExamples({ slug, onNotify }: Props) {
  const [authMode, setAuthMode] = useState<AuthCardMode>('sign-up');
  const [attachments, setAttachments] = useState<ComposerAttachment[]>(starterAttachments);
  switch (slug) {
    case 'auth-card': return <>
      <Section title="Sign up" description="The same surface supports account creation and passes FormData to your auth layer."><div className="docs-example__surface docs-example__block"><AuthCard mode={authMode} onModeChange={setAuthMode} onSubmit={data => onNotify(`${data.get('email')} submitted.`)} providers={['google','github']} /></div></Section>
      <Section title="Verification code" description="A one-time code arrives as one accessible value and calls onVerify when complete."><div className="docs-example__surface docs-example__block"><AuthCard mode="verify" onVerify={() => onNotify('Code submitted.')} /></div></Section>
      <Section title="Providers" description="Pass the sign-in methods your application supports."><div className="docs-example__surface docs-example__block"><AuthCard mode="sign-in" providers={['google','microsoft']} onProvider={provider => onNotify(`${provider} selected.`)} /></div></Section>
    </>;
    case 'calendar': return <>
      <Section title="Events" description="Events are supplied as data; the calendar only formats and opens them."><div className="docs-example__surface docs-example__block"><Calendar events={events} defaultMonth={new Date(2026,7,1)} onEventClick={event => onNotify(`${event.title} opened.`)} /></div></Section>
      <Section title="Month navigation" description="The active month can be controlled by the surrounding view."><div className="docs-example__surface docs-example__block"><Calendar events={events} defaultMonth={new Date(2026,7,1)} onMonthChange={month => onNotify(`${month.toLocaleString('en',{month:'long'})} shown.`)} /></div></Section>
    </>;
    case 'composer': return <>
      <Section title="Working state" description="Agent status appears above the input while sending is unavailable."><div className="docs-example__surface docs-example__surface--composer"><Composer branch="Main" project="studio" agentLabel="Agent" contextPercent={57} isWorking /></div></Section>
      <Section title="Send and attach" description="Enter sends, Shift+Enter inserts a line, and files are passed to the host application."><div className="docs-example__surface docs-example__surface--composer"><Composer onSend={message => onNotify(`Sent: ${message}`)} onAddFiles={files => onNotify(`${files.length} file attached.`)} onVoice={() => onNotify('Voice input selected.')} /></div></Section>
    </>;
    case 'composer-attachments': return <>
      <Section title="Upload queue" description="Each tile can show progress supplied by your uploader."><div className="docs-example__surface"><ComposerAttachments attachments={attachments} onAddFiles={files => setAttachments(current => [...current,...files.map(file => ({ id: `${file.name}-${file.lastModified}`, name: file.name, status: 'ready' as const }))])} onRemove={id => setAttachments(current => current.filter(item => item.id !== id))} /></div></Section>
      <Section title="Tile kinds" description="A file name, thumbnail, and upload status are independent data fields."><div className="docs-example__surface"><ComposerAttachments attachments={[{ id: 'photo', name: 'cover.jpg', thumbnail: publicPath("/carousel/sunlit-kitchen.webp"), status: 'ready' }, { id: 'doc', name: 'plan.pdf', status: 'ready' }]} /></div></Section>
    </>;
    default: return <BlockLaterExamples slug={slug} onNotify={onNotify} />;
  }
}
