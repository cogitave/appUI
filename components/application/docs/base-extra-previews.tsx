'use client';

import { publicPath } from '@/config/deployment';
import { useState, type ReactNode } from 'react';
import { RiAddLine, RiArrowDownSLine, RiDeleteBin6Line, RiEditLine, RiInformationLine, RiMailLine, RiMore2Line, RiNotification3Line, RiSettings4Line, RiShieldKeyholeLine, RiUserLine } from '@remixicon/react';
import { Dropdown, DropdownDivider, DropdownGroup, DropdownItem, DropdownPopover, DropdownTrigger } from '@/components/base/dropdown/dropdown';
import { FileUpload } from '@/components/base/file-upload/file-upload';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Input } from '@/components/base/input/input';
import { InputOTP } from '@/components/base/input-otp/input-otp';
import { LinkButton } from '@/components/base/buttons/link-button';
import { Notification } from '@/components/base/notification/notification';
import { Pagination } from '@/components/base/pagination/pagination';
import { RadioGroup, Radio } from '@/components/base/radio/radio';
import { RadioCard } from '@/components/base/radio/radio-card';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { BaseControlsExamples, BaseControlsPreview } from './base-controls-previews';
import { FormValidationExample } from './form-validation-example';
import {NotificationDemo,NotificationQueueExample,NotificationStackExample} from './notification-previews';

type Props = { slug: DocSlug; onNotify: (message: string) => void };
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2><p className="docs-example__description">{description}</p>{children}</section>;
}

export function BaseExtraPreview({ slug, onNotify }: Props) {
  const [page, setPage] = useState(6);
  switch (slug) {
    case 'dropdown': return <Dropdown><DropdownTrigger>Workspace <RiArrowDownSLine size={17} aria-hidden /></DropdownTrigger><DropdownPopover aria-label="Workspace actions"><DropdownGroup label="YOUR WORKSPACE"><DropdownItem onSelect={() => onNotify('Profile selected.')}><RiUserLine size={17} aria-hidden /> Profile</DropdownItem><DropdownItem onSelect={() => onNotify('Settings selected.')}><RiSettings4Line size={17} aria-hidden /> Settings</DropdownItem></DropdownGroup><DropdownDivider /><DropdownItem onSelect={() => onNotify('New project selected.')}><RiAddLine size={17} aria-hidden /> New project</DropdownItem></DropdownPopover></Dropdown>;
    case 'file-upload': return <FileUpload onFilesAccepted={files => onNotify(`${files.length} file ready.`)} onReject={onNotify} />;
    case 'icon-button': return <div className="docs-preview__row"><IconButton icon={RiNotification3Line} aria-label="Notifications" onClick={() => onNotify('Notifications opened.')} /><IconButton icon={RiEditLine} aria-label="Edit" onClick={() => onNotify('Edit selected.')} /><IconButton icon={RiMore2Line} aria-label="More actions" onClick={() => onNotify('More actions selected.')} /><IconButton icon={RiDeleteBin6Line} aria-label="Delete" onClick={() => onNotify('Delete selected.')} /></div>;
    case 'input': return <Input label="Email" type="email" placeholder="Enter your email" isRequired leading={<RiMailLine />} trailing={<RiInformationLine />} hint="This is a hint about this input." />;
    case 'input-otp': return <InputOTP onComplete={() => onNotify('Code complete.')} />;
    case 'link-button': return <LinkButton href={publicPath("/components/button")}>Explore buttons</LinkButton>;
    case 'notification': return <NotificationDemo onNotify={onNotify} />;
    case 'pagination': return <Pagination page={page} totalPages={181} onPageChange={setPage} />;
    case 'radio': return <RadioGroup aria-label="Billing period" defaultValue="monthly"><Radio value="monthly">Monthly billing</Radio><Radio value="yearly">Yearly billing</Radio><Radio value="usage" isDisabled>Usage based</Radio></RadioGroup>;
    default: return <BaseControlsPreview slug={slug} onNotify={onNotify} />;
  }
}

export function BaseExtraExamples({ slug, onNotify }: Props) {
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [shortPage, setShortPage] = useState(2);
  const [longPage, setLongPage] = useState(12);
  switch (slug) {
    case 'dropdown': return <>
      <Section title="Grouped actions" description="Related actions sit together, with a separator before less frequent commands."><div className="docs-example__surface"><Dropdown><DropdownTrigger>Project actions <RiArrowDownSLine size={17} aria-hidden /></DropdownTrigger><DropdownPopover aria-label="Project actions"><DropdownGroup label="PROJECT"><DropdownItem onSelect={() => onNotify('Rename selected.')}><RiEditLine size={17} aria-hidden /> Rename</DropdownItem><DropdownItem onSelect={() => onNotify('Permissions selected.')}><RiShieldKeyholeLine size={17} aria-hidden /> Permissions</DropdownItem></DropdownGroup><DropdownDivider /><DropdownItem onSelect={() => onNotify('Delete selected.')}><RiDeleteBin6Line size={17} aria-hidden /> Delete project</DropdownItem></DropdownPopover></Dropdown></div></Section>
      <Section title="Controlled state" description="The surrounding view can manage whether the popover is open."><div className="docs-example__surface docs-example__button-row"><Dropdown isOpen={open} onOpenChange={setOpen}><DropdownTrigger>Options <RiArrowDownSLine size={17} aria-hidden /></DropdownTrigger><DropdownPopover aria-label="Options"><DropdownItem onSelect={() => onNotify('Option selected.')}>First option</DropdownItem><DropdownItem onSelect={() => onNotify('Second selected.')}>Second option</DropdownItem></DropdownPopover></Dropdown><span className="docs-example__date-result">{open ? 'Open' : 'Closed'}</span></div></Section>
    </>;
    case 'file-upload': return <>
      <Section title="Validation" description="Accepted formats and size limits are set through props; invalid drops explain what to change."><div className="docs-example__surface"><FileUpload accept="image/png,image/jpeg" maxSize={2 * 1024 * 1024} hint="PNG or JPG (max 2 MB)" onReject={onNotify} /></div></Section>
      <Section title="Progress" description="The application owns upload progress while the component displays it with progressbar semantics."><div className="docs-example__surface"><FileUpload progress={64} onFilesAccepted={files => onNotify(`${files.length} file ready for upload.`)} /></div></Section>
    </>;
    case 'icon-button': return <Section title="Sizes and states" description="Medium and small sizes retain a 20px or 16px icon and a clear accessible label."><div className="docs-example__surface docs-example__button-row"><IconButton icon={RiNotification3Line} aria-label="Notifications" /><IconButton icon={RiEditLine} size="small" aria-label="Edit" /><IconButton icon={RiMore2Line} aria-label="More actions" disabled /></div></Section>;
    case 'input': return <>
      <Section title="Adornments" description="Icons can reinforce the field’s purpose without taking focus from the input."><div className="docs-example__surface docs-example__button-row"><Input label="Email" type="email" leading={<RiMailLine />} placeholder="you@example.com" /><Input label="Team name" trailing={<RiInformationLine />} placeholder="Design team" /></div></Section>
      <Section title="Sizes and surfaces" description="Compact and large controls share their type role; a soft surface supports quieter search and toolbar fields."><div className="docs-example__surface docs-example__button-row"><Input label="Compact field" size="small" placeholder="Enter a value"/><Input label="Soft field" variant="soft" placeholder="Enter a value"/><Input label="Large field" size="large" placeholder="Enter a value"/></div></Section>
      <Section title="Validation" description="Error text stays associated with the field and the border carries the same state."><div className="docs-example__surface"><Input label="Work email" value="hello" isInvalid error="Enter a valid email address." onChange={() => undefined} /></div></Section>
      <Section title="Disabled" description="Unavailable fields stay visible but cannot receive or change a value."><div className="docs-example__surface"><Input label="Account ID" value="acct_7832" isDisabled /></div></Section>
      <Section title="Native form validation" description="Required and typed fields expose their native errors through the shared field messages. A valid submission includes the named select value in FormData."><div className="docs-example__surface"><FormValidationExample/></div></Section>
    </>;
    case 'input-otp': return <>
      <Section title="Controlled value" description="The parent can keep the code in form state and react when all slots are filled."><div className="docs-example__surface docs-example__button-row"><InputOTP value={otp} onChange={setOtp} onComplete={() => onNotify('Verification code complete.')} /><span className="docs-example__date-result">{otp.length}/6 digits</span></div></Section>
      <Section title="Length and states" description="Length, invalid, and disabled states use the same one-input model."><div className="docs-example__surface docs-example__button-row"><InputOTP length={4} defaultValue="12" aria-label="Four digit code" /><InputOTP length={4} defaultValue="1234" isInvalid aria-label="Invalid code" /><InputOTP length={4} isDisabled aria-label="Disabled code" /></div></Section>
    </>;
    case 'link-button': return <>
      <Section title="Variants" description="Primary leads the eye; neutral and subtle fit supporting navigation."><div className="docs-example__surface docs-example__button-row"><LinkButton href={publicPath("/components/button")}>Primary</LinkButton><LinkButton href={publicPath("/components/color")} variant="neutral">Neutral</LinkButton><LinkButton href={publicPath("/components/typography")} variant="subtle">Subtle</LinkButton></div></Section>
      <Section title="Leading icon" description="An icon can precede the label when it clarifies the destination."><div className="docs-example__surface"><LinkButton href={publicPath("/components/input")} leadingIcon={RiAddLine} trailingIcon={false}>Create a form</LinkButton></div></Section>
    </>;
    case 'notification': return <>
      <Section title="Tones" description="Information, success, and error each use a distinct but restrained visual cue."><div className="docs-example__notification-stack"><Notification title="New activity" description="A new comment is ready to review." tone="information" /><Notification title="Export complete" description="Your file is ready to download." tone="success" /><Notification title="Upload failed" description="The file could not be uploaded." tone="error" /></div></Section>
      <Section title="Actions" description="Offer one next step and, when needed, a quieter secondary action."><div className="docs-example__surface"><Notification title="Your review is ready" description="Three changes need your attention." action={{ label: 'Review now', onPress: () => onNotify('Review selected.') }} secondaryAction={{ label: 'Later', onPress: () => onNotify('Review deferred.') }} /></div></Section>
      <Section title="Timed dismissal" description="The duration is optional; the close control remains available throughout."><div className="docs-example__surface"><Notification title="Saved automatically" description="Your draft is safe." tone="success" duration={8000} onDismiss={() => onNotify('Notification dismissed.')} /></div></Section>
      <Section title="Queue and updates" description="A scoped provider limits visible cards, queues additional items, pauses timeouts on hover and focus, and updates a pending save in place. Errors remain until dismissed."><div className="docs-example__surface"><NotificationQueueExample/></div></Section>
      <Section title="Stacked notifications" description="Stack keeps the latest notification in front. Hover or keyboard focus reveals the list; the disclosure also works on touch screens. Escape folds the stack and returns focus to its control."><div className="docs-example__surface"><NotificationStackExample/></div></Section>
    </>;
    case 'pagination': return <>
      <Section title="Short range" description="A short list shows every page without ellipses."><div className="docs-example__surface"><Pagination page={shortPage} totalPages={5} onPageChange={setShortPage} /></div></Section>
      <Section title="Long range" description="Large result sets retain the beginning, end, and pages around the current position."><div className="docs-example__surface"><Pagination page={longPage} totalPages={81} onPageChange={setLongPage} /></div></Section>
    </>;
    case 'radio': return <>
      <Section title="Sizes" description="The compact control fits denser forms without losing the selected indicator."><div className="docs-example__surface docs-example__button-row"><RadioGroup aria-label="Size example" defaultValue="first"><Radio value="first" size="md">Medium</Radio><Radio value="second" size="sm">Small</Radio></RadioGroup></div></Section>
      <Section title="Radio card" description="Make the full card a choice when each option needs a short explanation."><div className="docs-example__radio-cards"><RadioGroup aria-label="Plan" defaultValue="team"><RadioCard value="solo" title="Solo" description="A focused space for one person." /><RadioCard value="team" title="Team" description="Shared projects and common settings." /></RadioGroup></div></Section>
      <Section title="Disabled" description="Unavailable options remain visible with native radio semantics."><div className="docs-example__surface"><RadioGroup aria-label="Availability" defaultValue="standard"><Radio value="standard">Standard</Radio><Radio value="enterprise" isDisabled>Enterprise</Radio></RadioGroup></div></Section>
    </>;
    default: return <BaseControlsExamples slug={slug} onNotify={onNotify} />;
  }
}
