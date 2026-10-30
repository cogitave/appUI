export const extendedBasePages = {
  accordion: {
    title: 'Accordion', group: 'Base',
    description: 'Related sections with single or multiple expansion, keyboard navigation and a smooth change in layout height.',
    sections: ['Preview', 'Multiple sections', 'Variants', 'Disabled section'],
    snippet: `<Accordion\n  items={sections}\n  defaultExpandedKeys={['overview']}\n  allowsMultipleExpanded\n  onExpandedChange={setExpandedKeys}\n/>`,
  },
  collapsible: {
    title: 'Collapsible', group: 'Base',
    description: 'An animated content region that preserves child state while removing hidden content from keyboard navigation and the accessibility tree.',
    sections: ['Preview', 'Preserved content', 'Layout flow'],
    snippet: `<Button aria-expanded={open} aria-controls="details" onClick={() => setOpen(!open)}>\n  Details\n</Button>\n<Collapsible id="details" isOpen={open}>\n  <Input label="Project name" defaultValue="Studio" />\n</Collapsible>`,
  },
  'empty-state': {
    title: 'Empty State', group: 'Base',
    description: 'A clear explanation and useful next action for an empty collection, filtered result, first visit or unavailable content.',
    sections: ['Preview', 'First use and no results', 'Sizes and surfaces'],
    snippet: `<EmptyState\n  title="No matching projects"\n  description="Try a different search or clear the active filters."\n  icon={<RiSearchLine />}\n  actions={<Button onClick={clearFilters}>Clear filters</Button>}\n/>`,
  },
  progress: {
    title: 'Progress', group: 'Base',
    description: 'Determinate and indeterminate progress in bars or rings, with an accessible label, custom range and animated updates.',
    sections: ['Preview', 'Indeterminate', 'Rings and sizes', 'Ranges and tones'],
    snippet: `<Progress label="Processing files" value={completed} maxValue={total} />\n<Progress label="Connecting" isIndeterminate />\n<Progress label="Setup" value={75} variant="ring" />`,
  },
  skeleton: {
    title: 'Skeleton', group: 'Base',
    description: 'Content-shaped loading placeholders with shimmer, pulse or static motion, a smooth content crossfade and a shared busy region.',
    sections: ['Preview', 'Shapes and motion', 'Preserve dimensions'],
    snippet: `<SkeletonGroup isLoading={loading} label="Loading profile">\n  <Skeleton isLoading={loading} shape="circle"><Avatar initials="MC" size="lg" /></Skeleton>\n  <Skeleton isLoading={loading} width="70%"><strong>Maya Chen</strong></Skeleton>\n  <Skeleton isLoading={loading}><Button>Open profile</Button></Skeleton>\n</SkeletonGroup>`,
  },
  'scroll-area': {
    title: 'Scroll Area', group: 'Base',
    description: 'Native wheel, touch and keyboard scrolling with animated directional controls instead of a visible scrollbar.',
    sections: ['Preview', 'Content that fits', 'Horizontal scrolling', 'Keyboard and focus'],
    snippet: `<ScrollArea label="Project updates" className="h-60">\n  <UpdateList items={updates} />\n</ScrollArea>\n\n<ScrollArea label="Project stages" orientation="horizontal">\n  <StageCards />\n</ScrollArea>`,
  },
  spinner: {
    title: 'Spinner', group: 'Base',
    description: 'A compact loading indicator with four measured sizes and an accessible progress label.',
    sections: ['Preview', 'Sizes', 'Inside actions'],
    snippet: `<Spinner size="md" label="Loading results" />\n<Button isLoading loadingLabel="Saving">Save changes</Button>`,
  },
} as const;

export type ExtendedBaseSlug = keyof typeof extendedBasePages;
export function isExtendedBaseSlug(slug: string): slug is ExtendedBaseSlug { return Object.hasOwn(extendedBasePages, slug); }
