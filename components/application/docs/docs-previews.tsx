'use client';

import { publicPath } from '@/config/deployment';
import {ColorSwatchPreview,ColorSwatchExamples} from './color-swatch-previews';

import { TeamMembersPreview, TeamMembersExamples } from './team-members-previews';
import { WorkspaceTabsPreview, WorkspaceTabsExamples } from './workspace-tabs-previews';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { RiAddLine, RiArrowRightLine, RiBankLine, RiBold, RiCalendarLine, RiChatAiLine, RiCustomerServiceLine, RiGridLine, RiHome4Line, RiHomeLine, RiImageAiLine, RiInformationLine, RiItalic, RiListCheck, RiMegaphoneLine, RiSettings4Line, RiSparklingFill, RiTableLine, RiUnderline, RiUserSmileLine } from '@remixicon/react';
import { Sidebar, type SidebarItem, type SidebarSelectionVariant } from '@/components/blocks/sidebar/sidebar';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Announcement } from '@/components/base/announcement/announcement';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badge';
import { Chip, type ChipColor } from '@/components/base/badges/chip';
import { StatusDot } from '@/components/base/badges/status-dot';
import { Breadcrumb, BreadcrumbItem } from '@/components/base/breadcrumb/breadcrumb';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/buttons/button-group';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Carousel, CarouselItem } from '@/components/base/carousel/carousel';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { CheckboxCard } from '@/components/base/checkbox/checkbox-card';
import { DatePicker } from '@/components/base/date-picker/date-picker';
import { DateRangePicker, type DateRangeValue } from '@/components/base/date-picker/date-range-picker';
import { MeetingScheduler } from '@/components/base/date-picker/meeting-scheduler';
import { Divider } from '@/components/base/divider/divider';
import { Kbd } from '@/components/base/kbd/kbd';
import { accents, semanticColors, typeSpecimens } from '@/components/foundations/foundation-data';
import { useAppearance } from '@/hooks/use-appearance';
import type { DocSlug } from './docs-data';
import { sectionId } from './docs-data';
import { BaseExtraExamples, BaseExtraPreview } from './base-extra-previews';
import { isExtendedBaseSlug } from './extended-base-pages';
import { isCompositionSlug } from './composition-pages';
import { CompositionPreview, CompositionExamples } from './composition-previews';
import { isNavigationSlug } from './navigation-pages';
import { NavigationPreview, NavigationExamples } from './navigation-previews';
import { isFieldSlug } from './field-pages';
import { isItemSlug } from './item-pages';
import { ItemPreview, ItemExamples } from './item-previews';
import { FieldPreview, FieldExamples } from './field-previews';
import { ExtendedBasePreview, ExtendedBaseExamples, ButtonLoadingExample, PendingSubmitExample } from './extended-base-previews';
import { isOverlayFieldSlug } from './overlay-field-pages';
import { OverlayFieldPreview, OverlayFieldExamples } from './overlay-field-previews';
import { isAiContentSlug } from './ai-content-pages';
import { AiContentPreview, AiContentExamples } from './ai-content-previews';
import { isConversationSlug } from './conversation-pages';
import { ConversationPreview, ConversationExamples } from './conversation-previews';
import { isSearchFilterSlug } from './search-filter-pages';
import { SearchFilterPreview, SearchFilterExamples } from './search-filter-previews';
import { isCommandSlug } from './command-pages';
import { CommandPreview, CommandExamples } from './command-previews';
import { MeterPreview, MeterExamples } from './usage-previews';
import { isJourneySlug } from './journey-pages';
import { JourneyPreview, JourneyExamples } from './journey-previews';
import { StepperPreview, StepperExamples } from './stepper-previews';
import { isTreeSlug } from './tree-pages';
import { TreePreview, TreeExamples } from './tree-previews';
import { CodeBlockPreview, CodeBlockExamples } from './code-block-previews';
import { SplitPanePreview, SplitPaneExamples } from './split-pane-previews';

type PreviewProps = { slug: DocSlug; onNotify: (message: string) => void };

const gallery = [
  { src: publicPath("/carousel/sunlit-kitchen.webp"), title: 'Sunlit kitchen', type: 'Editorial' },
  { src: publicPath("/carousel/paper-shark.webp"), title: 'Paper shark', type: 'Paper collage' },
  { src: publicPath("/carousel/coral-arch.webp"), title: 'Coral arch', type: 'Illustration' },
] as const;
const chipColors: ChipColor[] = ['lime', 'rose', 'yellow', 'cyan', 'blue', 'purple', 'neutral', 'gray', 'soft', 'primary'];
const sidebarItems: SidebarItem[] = [
  { key: 'home', label: 'Home', icon: RiHomeLine, badge: 152 },
  { key: 'projects', label: 'Project board', icon: RiGridLine },
  { key: 'marketing', label: 'Marketing', icon: RiMegaphoneLine },
  { key: 'calendar', label: 'Calendar', icon: RiCalendarLine },
  { key: 'finance', label: 'Finance', icon: RiBankLine },
  { key: 'chat', label: 'AI Chat', icon: RiChatAiLine },
  { key: 'images', label: 'AI Image Generation', icon: RiImageAiLine },
  { key: 'profile', label: 'Profile', icon: RiUserSmileLine },
];
const sidebarSecondary: SidebarItem[] = [
  { key: 'support', label: 'Support', icon: RiCustomerServiceLine },
  { key: 'settings', label: 'Settings', icon: RiSettings4Line },
];
const sidebarWorkspace = { name: 'Studio team', initials: 'S' };
const sidebarUser = { name: 'Maya Chen', initials: 'MC', email: 'maya@studio.co', image: publicPath("/avatars/studio-portrait.png") };

function GalleryCard({ image }: { image: (typeof gallery)[number] }) {
  return <div className="docs-gallery-card"><img src={image.src} alt={image.title} loading="lazy" /><div><strong>{image.title}</strong><span>{image.type}</span></div></div>;
}

export function DocsPreview({ slug, onNotify }: PreviewProps) {
  const { accent, setAccent } = useAppearance();
  const [period, setPeriod] = useState('Week');
  if (slug==='color-swatch') return <ColorSwatchPreview/>;
  if (slug==='team-members') return <TeamMembersPreview/>;
  if (slug==='workspace-tabs') return <WorkspaceTabsPreview/>;
  if (isExtendedBaseSlug(slug)) return <ExtendedBasePreview slug={slug}/>;
  if (isCompositionSlug(slug)) return <CompositionPreview slug={slug}/>;
  if (isNavigationSlug(slug)) return <NavigationPreview slug={slug}/>;
  if (isItemSlug(slug)) return <ItemPreview onNotify={onNotify}/>;
  if (isFieldSlug(slug)) return <FieldPreview/>;
  if (isOverlayFieldSlug(slug)) return <OverlayFieldPreview slug={slug} onNotify={onNotify}/>;
  if (isAiContentSlug(slug)) return <AiContentPreview slug={slug}/>;
  if (isConversationSlug(slug)) return <ConversationPreview slug={slug}/>;
  if (isSearchFilterSlug(slug)) return <SearchFilterPreview slug={slug}/>;
  if (isCommandSlug(slug)) return <CommandPreview slug={slug}/>;
  if (slug === 'meter') return <MeterPreview/>;
  if (isJourneySlug(slug)) return <JourneyPreview slug={slug}/>;
  if (slug === 'stepper') return <StepperPreview/>;
  if (isTreeSlug(slug)) return <TreePreview slug={slug}/>;
  if (slug === 'split-pane') return <SplitPanePreview/>;
  if (slug === 'code-block') return <CodeBlockPreview/>;

  switch (slug) {
    case 'announcement':
      return <div className="docs-preview__announcement"><Announcement title="Finish setting up" description="A few details make your workspace yours." actionLabel="Continue setup" onAction={() => onNotify('Setup selected.')} dismissible onClose={() => onNotify('Announcement dismissed.')} /></div>;
    case 'avatar':
      return <div className="docs-preview__row"><Avatar size="lg" src={publicPath("/avatars/studio-portrait.png")} alt="Maya Chen" initials="MC" /><Avatar size="lg" color="blue" initials="M" /><Avatar size="lg" color="neutral" initials="A" /></div>;
    case 'badge':
      return <div className="docs-preview__row"><Badge>91</Badge><Badge color="primary">152</Badge><Kbd>⌘L</Kbd></div>;
    case 'breadcrumb':
      return <div className="docs-preview__breadcrumb"><Breadcrumb><BreadcrumbItem href={publicPath("/components/color")}>Design system</BreadcrumbItem><BreadcrumbItem href={publicPath("/components/avatar")}>People</BreadcrumbItem><BreadcrumbItem current icon={RiHome4Line}>Profile</BreadcrumbItem></Breadcrumb></div>;
    case 'button':
      return <div className="docs-preview__row docs-preview__buttons"><Button onClick={() => onNotify('Primary action pressed.')}>Get started</Button><Button variant="secondary" trailingIcon={RiArrowRightLine} onClick={() => onNotify('Continue pressed.')}>Continue</Button><Button variant="ghost" onClick={() => onNotify('Marked as done.')}>Mark as done</Button><Button variant="danger" onClick={() => onNotify('Danger action pressed.')}>Delete</Button></div>;
    case 'button-group':
      return <ButtonGroup aria-label="Period">{['Day', 'Week', 'Month', 'Year'].map(item => <ButtonGroupItem key={item} selected={period === item} onClick={() => setPeriod(item)}>{item}</ButtonGroupItem>)}</ButtonGroup>;
    case 'carousel':
      return <Carousel className="docs-preview__carousel" aria-label="Editorial gallery" align="center">{gallery.map(image => <CarouselItem key={image.src}><GalleryCard image={image} /></CarouselItem>)}</Carousel>;
    case 'checkbox':
      return <div className="docs-preview__row docs-preview__checks"><Checkbox aria-label="Unchecked" /><Checkbox aria-label="Checked" defaultSelected /><Checkbox aria-label="Mixed" isIndeterminate /><Checkbox aria-label="Disabled" isDisabled /><Checkbox aria-label="Disabled checked" isDisabled defaultSelected /></div>;
    case 'chip':
      return <div className="docs-preview__row docs-preview__chips"><Chip color="lime">+12.5%</Chip><Chip variant="subtle" color="cyan">$3,252</Chip><Chip variant="caption" color="rose">Backend Engineer</Chip></div>;
    case 'close-button':
      return <div className="docs-preview__row docs-preview__close-buttons">{(['2xs','xs','sm','md'] as const).map(size => <div key={size}><CloseButton size={size} aria-label={`Close ${size} example`} onClick={() => onNotify(`${size} close pressed.`)} /><span>{size}</span></div>)}</div>;
    case 'date-picker':
      return <div className="docs-preview__date"><DateRangePicker onChange={range => onNotify(range ? 'Date range selected.' : 'Date range cleared.')} /></div>;
    case 'divider':
      return <div className="docs-preview__divider"><Divider>Notifications</Divider><Divider variant="double">Today</Divider><Divider variant="fill">Latest activity</Divider></div>;
    case 'sidebar':
      return <div className="docs-preview__sidebar"><Sidebar workspace={sidebarWorkspace} user={sidebarUser} items={sidebarItems} secondaryItems={sidebarSecondary} defaultSelectedKey="home" onSelectionChange={key => onNotify(`${sidebarItems.concat(sidebarSecondary).find(item => item.key === key)?.label} selected.`)} onWorkspaceClick={() => onNotify('Workspace switcher selected.')} onUserClick={() => onNotify('Account menu selected.')} /></div>;
    case 'color':
      return <div className="docs-preview__color"><div className="docs-preview__color-accent" /><div className="docs-preview__color-copy"><span>INTERACTION</span><strong>Color follows meaning.</strong><p>One accent, many surfaces.</p><div>{accents.map((item) => <button key={item.id} type="button" aria-label={`${item.label} accent`} aria-pressed={accent === item.id} onClick={() => setAccent(item.id)} style={{ background: item.swatch }} />)}</div></div></div>;
    case 'typography':
      return <div className="docs-preview__type"><span>INTER / OPTICAL SIZING</span><strong>Clarity in every detail.</strong><p>A restrained scale makes space for the content.</p></div>;
    default:
      return <BaseExtraPreview slug={slug} onNotify={onNotify} />;
  }
}

function ExampleSection({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return <section id={sectionId(title)} className="docs-example"><h2>{title}</h2>{description && <p className="docs-example__description">{description}</p>}{children}</section>;
}

export function DocsExamples({ slug, onNotify }: PreviewProps) {
  const { accent, setAccent } = useAppearance();
  const [sidebarSelectionVariant, setSidebarSelectionVariant] = useState<SidebarSelectionVariant>('neutral');
  const [view, setView] = useState('List');
  const [formatting, setFormatting] = useState<string[]>([]);
  const [controlledChecked, setControlledChecked] = useState(false);
  const [controlledRange, setControlledRange] = useState<DateRangeValue | null>(null);
  if (slug==='color-swatch') return <ColorSwatchExamples/>;
  if (slug==='team-members') return <TeamMembersExamples/>;
  if (slug==='workspace-tabs') return <WorkspaceTabsExamples/>;
  if (isExtendedBaseSlug(slug)) return <ExtendedBaseExamples slug={slug} onNotify={onNotify}/>;
  if (isCompositionSlug(slug)) return <CompositionExamples slug={slug}/>;
  if (isNavigationSlug(slug)) return <NavigationExamples slug={slug}/>;
  if (isItemSlug(slug)) return <ItemExamples onNotify={onNotify}/>;
  if (isFieldSlug(slug)) return <FieldExamples/>;
  if (isOverlayFieldSlug(slug)) return <OverlayFieldExamples slug={slug} onNotify={onNotify}/>;
  if (isAiContentSlug(slug)) return <AiContentExamples slug={slug}/>;
  if (isConversationSlug(slug)) return <ConversationExamples slug={slug}/>;
  if (isSearchFilterSlug(slug)) return <SearchFilterExamples slug={slug}/>;
  if (isCommandSlug(slug)) return <CommandExamples slug={slug}/>;
  if (slug === 'meter') return <MeterExamples/>;
  if (isJourneySlug(slug)) return <JourneyExamples slug={slug}/>;
  if (slug === 'stepper') return <StepperExamples/>;
  if (isTreeSlug(slug)) return <TreeExamples slug={slug}/>;
  if (slug === 'split-pane') return <SplitPaneExamples/>;
  if (slug === 'code-block') return <CodeBlockExamples/>;
  switch (slug) {
    case 'announcement': return <>
      <ExampleSection title="In the sidebar" description="The message is sized for a quiet corner of the application, with one clear next step."><div className="docs-example__surface docs-example__surface--sidebar"><Announcement title="Welcome to appUI" description="Your workspace is ready to explore." actionLabel="Take a look" onAction={() => onNotify('Tour selected.')} /></div></ExampleSection>
      <ExampleSection title="Variations" description="Each part is optional. Keep only the information the moment needs."><div className="docs-example__grid"><Announcement title="What’s new" description="A calmer way to organize your work." icon={RiSparklingFill} actionLabel="See updates" onAction={() => onNotify('Updates selected.')} /><Announcement title="You’re all set" description="Your preferences have been saved." icon={RiInformationLine} dismissible /></div></ExampleSection>
    </>;
    case 'avatar': return <>
      <ExampleSection title="Sizes" description="Four sizes cover dense tables, navigation, and larger profile contexts."><div className="docs-example__surface docs-example__avatar-sizes">{(['xs','sm','md','lg'] as const).map(size => <div key={size}><Avatar size={size} initials="M" color="blue" /><code>{size.toUpperCase()}</code></div>)}</div></ExampleSection>
      <ExampleSection title="Initial tints" description="A neutral default with three optional tints for visual distinction."><div className="docs-example__surface docs-example__row">{(['neutral','blue','lime','pink'] as const).map(color => <div key={color}><Avatar color={color} initials={color[0].toUpperCase()} /><span>{color}</span></div>)}</div></ExampleSection>
      <ExampleSection title="Photo" description="Initials remain visible when a photo is unavailable."><div className="docs-example__surface docs-example__row"><Avatar size="lg" src={publicPath("/avatars/studio-portrait.png")} alt="Maya Chen" initials="MC" /><span>Maya Chen</span><Avatar size="lg" alt="Maya Chen" initials="MC" /><span>Fallback</span></div></ExampleSection>
    </>;
    case 'badge': return <>
      <ExampleSection title="Colors" description="Neutral supports quiet counts; primary highlights the selected area."><div className="docs-example__surface docs-example__row"><Badge>91</Badge><Badge color="primary">152</Badge></div></ExampleSection>
      <ExampleSection title="In navigation" description="Counts stay close to their label without becoming the main focus."><div className="docs-example__nav-row"><span>Inbox</span><Badge color="primary">12</Badge></div></ExampleSection>
    </>;
    case 'breadcrumb': return <>
      <ExampleSection title="With avatars" description="Leading content helps a trail show a team, person, or workspace."><div className="docs-example__surface"><Breadcrumb aria-label="Team"><BreadcrumbItem href={publicPath("/components/avatar")}><Avatar size="xs" color="blue" initials="A" /> appUI team</BreadcrumbItem><BreadcrumbItem href={publicPath("/components/avatar")}><Avatar size="xs" src={publicPath("/avatars/studio-portrait.png")} alt="Maya Chen" initials="MC" /> Maya</BreadcrumbItem><BreadcrumbItem current>Overview</BreadcrumbItem></Breadcrumb></div></ExampleSection>
      <ExampleSection title="Narrow screens" description="The path scrolls horizontally when there is not enough room, preserving every destination."><div className="docs-example__surface docs-example__narrow"><Breadcrumb><BreadcrumbItem href={publicPath("/components/color")}>Workspace</BreadcrumbItem><BreadcrumbItem href={publicPath("/components/avatar")}>People</BreadcrumbItem><BreadcrumbItem href={publicPath("/components/breadcrumb")}>Maya Chen</BreadcrumbItem><BreadcrumbItem current>Activity</BreadcrumbItem></Breadcrumb></div></ExampleSection>
    </>;
    case 'button': return <>
      <ExampleSection title="Variants" description="Choose an action’s visual weight from its importance and consequence."><div className="docs-example__surface docs-example__button-row"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button><Button variant="soft" onClick={() => onNotify('Soft action pressed.')}>Soft action</Button><Button variant="outline" onClick={() => onNotify('Outline action pressed.')}>Outline action</Button><Button variant="solid" onClick={() => onNotify('Solid action pressed.')}>Solid action</Button><Button variant="quiet" onClick={() => onNotify('Quiet action pressed.')}>Quiet action</Button></div></ExampleSection>
      <ExampleSection title="Sizes" description="The same proportions carry through medium, small, and extra small controls."><div className="docs-example__surface docs-example__button-row"><Button size="medium">Medium</Button><Button size="small">Small</Button><Button size="xs">Extra small</Button></div></ExampleSection>
      <ExampleSection title="Icons" description="An icon reinforces the label; icon only buttons need an accessible name."><div className="docs-example__surface docs-example__button-row"><Button leadingIcon={RiAddLine}>Create new</Button><Button variant="secondary" trailingIcon={RiArrowRightLine}>Continue</Button><Button variant="secondary" iconOnly leadingIcon={RiAddLine} aria-label="Add item" /></div></ExampleSection>
      <ExampleSection title="Loading" description="Pending actions retain keyboard focus and prevent repeated activation. A centered spinner replaces the visible label and glyphs while the button keeps its width."><div className="docs-example__surface docs-example__button-row"><ButtonLoadingExample/><ButtonLoadingExample leading/><ButtonLoadingExample iconOnly/><Button variant="secondary" isLoading>Working</Button></div></ExampleSection>
      <ExampleSection title="Submit actions" description="The form owns validation and saved data. A pending submit action stays focusable and guards repeat clicks and keyboard activation."><div className="docs-example__surface"><PendingSubmitExample/></div></ExampleSection>
      <ExampleSection title="Disabled" description="Unavailable actions remain visible without responding to pointer or keyboard input."><div className="docs-example__surface docs-example__button-row"><Button disabled>Unavailable</Button><Button variant="secondary" disabled>Unavailable</Button><CloseButton aria-label="Disabled close" disabled /></div></ExampleSection>
    </>;
    case 'button-group': return <>
      <ExampleSection title="Selected item" description="The pressed state stays visible while a toolbar or filter remains selected."><div className="docs-example__surface"><ButtonGroup aria-label="View">{[{ label: 'List', icon: RiListCheck }, { label: 'Grid', icon: RiGridLine }, { label: 'Table', icon: RiTableLine }].map(item => <ButtonGroupItem key={item.label} leadingIcon={item.icon} selected={view === item.label} onClick={() => setView(item.label)}>{item.label}</ButtonGroupItem>)}</ButtonGroup></div></ExampleSection>
      <ExampleSection title="Icon only" description="Small icon controls keep their accessible names even without visible labels."><div className="docs-example__surface"><ButtonGroup size="small" aria-label="Formatting">{[{ label: 'Bold', icon: RiBold }, { label: 'Italic', icon: RiItalic }, { label: 'Underline', icon: RiUnderline }].map(item => <ButtonGroupItem key={item.label} iconOnly aria-label={item.label} leadingIcon={item.icon} selected={formatting.includes(item.label)} onClick={() => setFormatting(current => current.includes(item.label) ? current.filter(value => value !== item.label) : [...current, item.label])} />)}</ButtonGroup></div></ExampleSection>
    </>;
    case 'carousel': return <>
      <ExampleSection title="Card widths" description="Slides can be narrower than the track to reveal what comes next."><div className="docs-example__surface"><Carousel className="docs-example__carousel" aria-label="Gallery with a visible next card" showArrows={false}>{gallery.map(image => <CarouselItem key={image.src} className="w-[85%]"><GalleryCard image={image} /></CarouselItem>)}</Carousel></div></ExampleSection>
      <ExampleSection title="Alignment and controls" description="Center snapping and controls can be chosen separately for each context."><div className="docs-example__surface"><Carousel className="docs-example__carousel" aria-label="Centered swipe gallery" align="center" showArrows={false} showDots={false}>{gallery.map(image => <CarouselItem key={image.src}><GalleryCard image={image} /></CarouselItem>)}</Carousel></div></ExampleSection>
      <ExampleSection title="Accessibility" description="The track accepts keyboard focus. Arrow keys move between slides, and each slide announces its position."><div className="docs-example__surface docs-example__keyboard"><Kbd>←</Kbd><Kbd>→</Kbd><span>Focus the gallery, then move one slide at a time.</span></div></ExampleSection>
    </>;
    case 'checkbox': return <>
      <ExampleSection title="Sizes" description="Medium fits forms and cards; small stays readable in dense tables."><div className="docs-example__surface docs-example__checkbox-sizes"><div><Checkbox size="md" defaultSelected aria-label="Medium checkbox" /><span>Medium · 16px</span></div><div><Checkbox size="sm" defaultSelected aria-label="Small checkbox" /><span>Small · 14px</span></div></div></ExampleSection>
      <ExampleSection title="Labels and control" description="The label is clickable, and React Aria handles keyboard selection and form semantics."><div className="docs-example__surface docs-example__check-list"><Checkbox defaultSelected>Remember me</Checkbox><Checkbox>Send me product updates</Checkbox><Checkbox isSelected={controlledChecked} onChange={setControlledChecked}>Controlled choice</Checkbox></div></ExampleSection>
      <ExampleSection title="Card" description="The entire card can be one choice, with a short title and supporting detail."><div className="docs-example__check-cards"><CheckboxCard title="Product updates" description="Occasional news from the team." /><CheckboxCard defaultSelected title="Security alerts" description="Important changes to your account." /></div></ExampleSection>
    </>;
    case 'chip': return <>
      <ExampleSection title="Variants and colors" description="Use bold for a strong status, subtle for a value, and caption for a short tag."><div className="docs-example__chip-matrix">{chipColors.map(color => <div key={color}><span>{color}</span><Chip color={color}>Active</Chip><Chip variant="subtle" color={color}>$3,252</Chip><Chip variant="caption" color={color}>Designer</Chip></div>)}</div></ExampleSection>
      <ExampleSection title="Outline" description="A quieter boundary keeps the same color meaning. The primary tint follows the chosen accent palette."><div className="docs-example__surface docs-example__button-row"><Chip variant="outline" color="primary">Selected</Chip><Chip variant="outline" color="lime">Active</Chip><Chip variant="outline" color="neutral">Draft</Chip></div></ExampleSection>
      <ExampleSection title="Status dot" description="A small indicator can sit beside a status label inside menus and tables."><div className="docs-example__surface docs-example__status-dots"><span><StatusDot color="green" /> Active</span><span><StatusDot color="yellow" /> Waiting</span><span><StatusDot color="indigo" /> In review</span></div></ExampleSection>
    </>;
    case 'close-button': return <>
      <ExampleSection title="Sizes" description="The icon stroke is tuned per size, so the smallest control stays legible."><div className="docs-example__surface docs-example__close-sizes">{(['2xs','xs','sm','md'] as const).map(size => <div key={size}><CloseButton size={size} aria-label={`Close ${size}`} onClick={() => onNotify(`${size} close pressed.`)} /><code>{size}</code></div>)}</div></ExampleSection>
      <ExampleSection title="In a modal header" description="A larger close action balances the title without drawing attention away from it."><div className="docs-example__modal-header"><strong>Profile settings</strong><CloseButton size="md" aria-label="Close profile settings" onClick={() => onNotify('Dialog close pressed.')} /></div></ExampleSection>
    </>;
    case 'date-picker': return <>
      <ExampleSection title="Meeting scheduler" description="A booking surface connects a selected day, timezone, time format, and generated time slots."><div className="docs-example__surface docs-example__date"><MeetingScheduler onChange={selection => onNotify(`Meeting selected for ${selection.time} (${selection.timezone}).`)} /></div></ExampleSection>
      <ExampleSection title="Quick select" description="Presets update the pending range. Apply confirms the selection; Cancel leaves the committed range untouched."><div className="docs-example__surface docs-example__date"><DateRangePicker placeholder="Choose a reporting period" /></div></ExampleSection>
      <ExampleSection title="Controlled and uncontrolled" description="Pass value and onChange when the surrounding form owns the date range. Omit value to let the picker manage it."><div className="docs-example__surface docs-example__date"><DateRangePicker value={controlledRange} onChange={setControlledRange} aria-label="Controlled range" /><span className="docs-example__date-result">{controlledRange ? `${controlledRange.start.toString()} to ${controlledRange.end.toString()}` : 'No dates selected'}</span></div></ExampleSection>
      <ExampleSection title="Disabled" description="The trigger stays visible but cannot open the calendar."><div className="docs-example__surface docs-example__date"><DateRangePicker isDisabled /></div></ExampleSection>
      <ExampleSection title="Single date" description="A smaller panel shares the same month navigation, day cells, and editable date chip."><div className="docs-example__surface docs-example__date"><DatePicker onChange={date => onNotify(date ? `Date selected: ${date.toString()}` : 'Date cleared.')} /></div></ExampleSection>
    </>;
    case 'divider': return <>
      <ExampleSection title="Variants" description="Three treatments give each section the right amount of separation."><div className="docs-example__surface docs-example__divider-list"><Divider>Single line</Divider><Divider variant="double">Double line</Divider><Divider variant="fill">Background fill</Divider></div></ExampleSection>
      <ExampleSection title="Alignment" description="Place short labels at the start, center, or end of the available width."><div className="docs-example__surface docs-example__divider-list"><Divider align="start">Start</Divider><Divider align="center">Center</Divider><Divider align="end">End</Divider></div></ExampleSection>
      <ExampleSection title="Composed content" description="The slot accepts controls and status elements as well as text."><div className="docs-example__surface docs-example__divider-list"><Divider><Chip variant="caption" color="blue">NEW</Chip></Divider><Divider><Button variant="secondary" size="small" leadingIcon={RiAddLine}>Add item</Button></Divider><Divider variant="fill"><Avatar size="sm" initials="MC" color="blue" /><Avatar size="sm" initials="AL" color="pink" /></Divider></div></ExampleSection>
      <ExampleSection title="Without content" description="An empty divider exposes separator semantics for assistive technology."><div className="docs-example__surface docs-example__divider-list"><Divider aria-label="Section break" /><Divider variant="double" aria-label="Section break" /><Divider variant="fill" aria-label="Section break" /></div></ExampleSection>
    </>;
    case 'sidebar': return <>
      <ExampleSection title="Selection variants" description="Use accent for a colored active route, or neutral for a quieter surface. Both support expanded and collapsed navigation.">
        <div className="docs-example__surface docs-example__sidebar-card docs-example__sidebar-variants">
          <SegmentedControl aria-label="Sidebar selection variant" value={sidebarSelectionVariant} onValueChange={value => setSidebarSelectionVariant(value as SidebarSelectionVariant)} options={[{ value: 'accent', label: 'Accent' }, { value: 'neutral', label: 'Neutral' }]} />
          <Sidebar workspace={sidebarWorkspace} user={sidebarUser} items={sidebarItems} secondaryItems={sidebarSecondary} defaultSelectedKey="home" selectionVariant={sidebarSelectionVariant} />
        </div>
      </ExampleSection>
      <ExampleSection title="Collapsed rail" description="The same navigation reduces to a 60px rail. Labels remain available as accessible names, and search expands the panel."><div className="docs-example__surface docs-example__sidebar-rail"><Sidebar workspace={sidebarWorkspace} user={sidebarUser} items={sidebarItems} secondaryItems={sidebarSecondary} defaultSelectedKey="home" defaultCollapsed /></div></ExampleSection>
      <ExampleSection title="Composed content" description="An optional announcement sits above the account footer without changing the navigation API."><div className="docs-example__surface docs-example__sidebar-card"><Sidebar workspace={sidebarWorkspace} user={sidebarUser} items={sidebarItems.slice(0,5)} defaultSelectedKey="projects" announcement={{ title: 'A calmer workspace', description: 'Explore the latest improvements.', actionLabel: 'What’s new', onAction: () => onNotify('Updates selected.') }} /></div></ExampleSection>
      <ExampleSection title="Navigation data" description="Routes, labels, icons, badges, and secondary actions are supplied by the application. A local selection works when no route is provided."><div className="docs-example__surface docs-example__sidebar-data"><code>{`{ key: 'home', label: 'Home', icon: RiHomeLine, badge: 152 }`}</code><code>{`{ key: 'settings', label: 'Settings', icon: RiSettings4Line }`}</code></div></ExampleSection>
    </>;
    case 'color': return <>
      <ExampleSection title="Semantic roles" description="Components ask for a role, so the palette can evolve without editing every component."><div className="docs-example__tokens">{semanticColors.map(item => <div key={item.token}><i style={{ background: `var(${item.token})` }} /><div><strong>{item.label}</strong><span>{item.note}</span></div><code>{item.token}</code></div>)}</div></ExampleSection>
      <ExampleSection title="Accents" description="The selected accent is shared by actions, focus rings, and active navigation."><div className="docs-example__surface docs-example__button-row">{accents.map(item => <button key={item.id} className="docs-accent-choice" type="button" aria-pressed={accent === item.id} onClick={() => setAccent(item.id)}><i style={{ background: item.swatch }} />{item.label}</button>)}</div></ExampleSection>
      <ExampleSection title="Appearance" description="Semantic roles adapt the same components across light and dark appearances."><div className="docs-example__surface docs-example__button-row"><Button>Primary action</Button><Button variant="secondary">Secondary action</Button></div></ExampleSection>
    </>;
    case 'typography': return <>
      <ExampleSection title="Type scale" description="Display, title, body, and caption styles use explicit size and line-height pairs."><div className="docs-example__type-list">{typeSpecimens.map(item => <div key={item.name}><span>{item.name}</span><strong className={item.className}>{item.sample}</strong><code>{item.metric}</code></div>)}</div></ExampleSection>
      <ExampleSection title="Weights" description="Four weights make hierarchy clear without introducing another typeface."><div className="docs-example__surface docs-example__weights"><span>Regular</span><strong>Medium</strong><b>Semibold</b><b className="docs-example__bold">Bold</b></div></ExampleSection>
      <ExampleSection title="Usage" description="Use the smallest number of levels that still explains the content."><div className="docs-example__surface docs-example__type-usage"><h3>Build with clarity</h3><p>Readable type lets each component support the task in front of it.</p></div></ExampleSection>
    </>;
    default: return <BaseExtraExamples slug={slug} onNotify={onNotify} />;
  }
}
