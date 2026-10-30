
import {colorSwatchPages} from './color-swatch-pages';
import { teamMembersPages } from './team-members-pages';
import { workspaceTabsPages } from './workspace-tabs-pages';
import catalogSource from './catalog.json';
import { itemPages } from './item-pages';
import { fieldPages } from './field-pages';
import { navigationPages } from './navigation-pages';
import { compositionPages } from './composition-pages';
import { baseExtraPages } from './base-extra-pages';
import { blockPages } from './block-pages';
import { chartPages } from './chart-pages';
import { templatePages } from './template-pages';
import { gettingStartedPages } from './getting-started-pages';
import { extendedBasePages } from './extended-base-pages';
import { overlayFieldPages } from './overlay-field-pages';
import { aiContentPages } from './ai-content-pages';
import { conversationPages } from './conversation-pages';
import { searchFilterPages } from './search-filter-pages';
import { commandPages } from './command-pages';
import { meterPage } from './meter-page';
import { journeyPages } from './journey-pages';
import { stepperPage } from './stepper-page';
import { treePages } from './tree-pages';
import { codeBlockPage } from './code-block-page';
import { splitPanePage } from './split-pane-page';

export const docsPages = {
  ...colorSwatchPages,
  ...teamMembersPages,
  ...workspaceTabsPages,
  ...itemPages,
  ...fieldPages,
  ...navigationPages,
  ...compositionPages,
  ...splitPanePage,
  ...codeBlockPage,
  ...treePages,
  ...stepperPage,
  ...journeyPages,
  ...meterPage,
  ...commandPages,
  ...searchFilterPages,
  ...conversationPages,
  ...aiContentPages,
  ...gettingStartedPages,
  color: {
    title: 'Color',
    group: 'Foundations',
    description: 'A small set of semantic color roles gives every surface, action, and state a consistent meaning in light and dark appearances.',
    sections: ['How color works', 'Appearances', 'Semantic roles', 'Accent ramp'],
    snippet: `/* Use roles in a component, not palette values */\n.card {\n  background: var(--surface-base);\n  color: var(--text-strong);\n  border-color: var(--border-subtle);\n}`,
  },
  typography: {
    title: 'Typography',
    group: 'Foundations',
    description: 'A measured Inter type scale, from display text to compact captions, with optical sizing and predictable line height.',
    sections: ['The scale', 'Type roles', 'Weights', 'Usage'],
    snippet: `<h1 className="text-display-3-semibold">A clearer hierarchy</h1>\n<p className="text-body-regular">Useful text feels effortless.</p>`,
  },
  announcement: {
    title: 'Announcement',
    group: 'Base',
    description: 'A compact message card for onboarding and product updates. It supports an icon, a focused action, and an animated dismiss control.',
    sections: ['Preview', 'In the sidebar', 'Variations'],
    snippet: `<Announcement\n  title="Finish setting up"\n  description="A few details make your workspace yours."\n  actionLabel="Continue setup"\n  onAction={openSetup}\n  dismissible\n/>`,
  },
  avatar: {
    title: 'Avatar',
    group: 'Base',
    description: 'A person’s photo or initials in four measured sizes. Initials remain visible if the image fails to load.',
    sections: ['Preview', 'Sizes', 'Initial tints', 'Photo'],
    snippet: `<Avatar src="/avatars/studio-portrait.png" alt="Maya Chen" initials="MC" />\n<Avatar size="sm" color="blue" initials="MC" />`,
  },
  badge: {
    title: 'Badge',
    group: 'Base',
    description: 'Small count labels for navigation and unread totals. The primary color sits comfortably on selected surfaces.',
    sections: ['Preview', 'Colors', 'In navigation'],
    snippet: `<Badge color="neutral">91</Badge>\n<Badge color="primary">152</Badge>`,
  },
  breadcrumb: {
    title: 'Breadcrumb',
    group: 'Base',
    description: 'A compact path through the interface. Ancestors are interactive, while the current page is announced clearly to assistive technology.',
    sections: ['Preview', 'With avatars', 'Narrow screens'],
    snippet: `<Breadcrumb>\n  <BreadcrumbItem href="/components">Components</BreadcrumbItem>\n  <BreadcrumbItem href="/components/avatar">People</BreadcrumbItem>\n  <BreadcrumbItem current>Profile</BreadcrumbItem>\n</Breadcrumb>`,
  },
  button: {
    title: 'Button',
    group: 'Base',
    description: 'Primary, secondary, ghost, and danger actions in three sizes, with clear hover, pressed, focus, and disabled states.',
    sections: ['Preview', 'Variants', 'Sizes', 'Icons', 'Loading', 'Submit actions', 'Disabled'],
    snippet: `<Button variant="primary" leadingIcon={RiAddLine}>Create new</Button>\n<Button variant="secondary">Continue</Button>`,
  },
  'button-group': {
    title: 'Button Group',
    group: 'Base',
    description: 'Related controls share one border and a quiet shadow. Use the selected state for toolbars and compact filters.',
    sections: ['Preview', 'Selected item', 'Icon only'],
    snippet: `const [period, setPeriod] = useState('Week');\n\n<ButtonGroup aria-label="Period">\n  {['Day', 'Week', 'Month', 'Year'].map(item => (\n    <ButtonGroupItem key={item} selected={period === item} onClick={() => setPeriod(item)}>\n      {item}\n    </ButtonGroupItem>\n  ))}\n</ButtonGroup>`,
  },
  carousel: {
    title: 'Carousel',
    group: 'Base',
    description: 'A gallery driven by native scrolling and scroll snap. Touch, trackpad, keyboard, arrows, and position controls all stay in sync.',
    sections: ['Preview', 'Card widths', 'Alignment and controls', 'Accessibility'],
    snippet: `<Carousel aria-label="Editorial gallery" align="center" gap={16}>\n  <CarouselItem><GalleryCard image="/carousel/sunlit-kitchen.webp" /></CarouselItem>\n  <CarouselItem><GalleryCard image="/carousel/paper-shark.webp" /></CarouselItem>\n  <CarouselItem><GalleryCard image="/carousel/coral-arch.webp" /></CarouselItem>\n</Carousel>`,
  },
  checkbox: {
    title: 'Checkbox',
    group: 'Base',
    description: 'A precise 16px choice control built on React Aria. Checked, mixed, disabled, and labelled states share one visual language.',
    sections: ['Preview', 'Sizes', 'Labels and control', 'Card'],
    snippet: `<Checkbox defaultSelected>Remember me</Checkbox>\n<Checkbox size="sm" aria-label="Select row" />\n<CheckboxCard title="Product updates" description="Occasional news from the team." />`,
  },
  chip: {
    title: 'Chip',
    group: 'Base',
    description: 'Compact color labels for statuses, values, and tags. Three emphasis levels cover nine semantic color pairs.',
    sections: ['Preview', 'Variants and colors', 'Outline', 'Status dot'],
    snippet: `<Chip variant="bold" color="lime">+12.5%</Chip>\n<Chip variant="subtle" color="cyan">$3,252</Chip>\n<Chip variant="caption" color="rose">Backend Engineer</Chip>`,
  },
  'close-button': {
    title: 'Close Button',
    group: 'Base',
    description: 'The circular dismiss action for compact surfaces and dialogs. Four sizes keep the icon stroke crisp at every scale.',
    sections: ['Preview', 'Sizes', 'In a modal header'],
    snippet: `<CloseButton size="xs" aria-label="Dismiss announcement" />\n<CloseButton size="md" aria-label="Close dialog" onClick={onClose} />`,
  },
  'date-picker': {
    title: 'Date Picker',
    group: 'Base',
    description: 'Choose a single day or a date range in a calendar that supports keyboard navigation, quick ranges, editable dates, and an explicit Apply action.',
    sections: ['Preview', 'Meeting scheduler', 'Quick select', 'Controlled and uncontrolled', 'Disabled', 'Single date'],
    snippet: `<DateRangePicker\n  value={range}\n  onChange={setRange}\n  aria-label="Report dates"\n/>\n\n<DatePicker onChange={setDate} aria-label="Due date" />`,
  },
  divider: {
    title: 'Divider',
    group: 'Base',
    description: 'A composable separator for dense interfaces. A hairline, framed double line, or soft filled strip can hold text and compact controls.',
    sections: ['Preview', 'Variants', 'Alignment', 'Composed content', 'Without content'],
    snippet: `<Divider>Notifications</Divider>\n<Divider variant="double">Today</Divider>\n<Divider variant="fill">Latest activity</Divider>`,
  },
  sidebar: {
    title: 'Sidebar',
    group: 'Blocks',
    description: 'A floating navigation panel with a workspace identity, search, selected route, badges, secondary actions, and an account footer. The same component can collapse to a compact rail.',
    sections: ['Preview', 'Selection variants', 'Collapsed rail', 'Composed content', 'Navigation data'],
    snippet: `<Sidebar\n  workspace={{ name: 'Studio team', initials: 'S' }}\n  user={{ name: 'Maya Chen', initials: 'MC', email: 'maya@studio.co' }}\n  items={navigation}\n  defaultSelectedKey="home"\n  selectionVariant="neutral"\n  onSelectionChange={setSelectedKey}\n/>`,
  },
  ...baseExtraPages,
  ...blockPages,
  ...chartPages,
  ...templatePages,
  ...extendedBasePages,
  ...overlayFieldPages,
} as const;

export type DocSlug = keyof typeof docsPages;
export const catalog = catalogSource.entries;
export const readySlugs = catalog.map(item => item.slug).filter((slug): slug is DocSlug => slug in docsPages);
export const templateCategories = ['AI & Chat', 'Dashboards', 'Workspace', 'Monetization'] as const;
export const catalogGroups = ['Getting Started', 'Foundations', 'Base', 'Blocks', 'Charts', 'Templates'] as const;

export function sectionId(label: string) {
  return label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '');
}
