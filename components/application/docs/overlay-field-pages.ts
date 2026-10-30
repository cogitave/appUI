export const overlayFieldPages = {
  alert: {
    title: 'Alert', group: 'Base',
    description: 'An inline message with semantic colors, optional actions and dismissal. Use a live announcement only when a new message needs attention.',
    sections: ['Preview', 'Semantic tones', 'Actions and dismissal', 'Bordered surfaces'],
    snippet: `<Alert\n  title="Your changes are saved"\n  description="Everyone in the project can see the latest version."\n  tone="success"\n  role="status"\n/>`,
  },
  card: {
    title: 'Card', group: 'Base',
    description: 'A shared content surface with measured padding, headers and footers. Compose it from the same controls as the rest of your product.',
    sections: ['Preview', 'Surfaces', 'Padding and composition'],
    snippet: `<Card variant="bordered">\n  <CardHeader title="Project details" description="The work behind the next release." />\n  <Progress label="Tasks completed" value={72} />\n  <CardFooter><Button>Open project</Button></CardFooter>\n</Card>`,
  },
  combobox: {
    title: 'ComboBox', group: 'Base',
    description: 'Search a list of choices with keyboard navigation, rich option details, disabled items and a useful empty state.',
    sections: ['Preview', 'Controlled selection', 'Custom values and empty results', 'States and sizes', 'Menu density and long lists'],
    snippet: `<ComboBox\n  label="Project owner"\n  options={people}\n  selectedKey={owner}\n  onSelectionChange={setOwner}\n/>`,
  },
  dialog: {
    title: 'Dialog', group: 'Base',
    description: 'A focused modal surface with a named header, dynamic content, optional actions, keyboard dismissal and focus restoration.',
    sections: ['Preview', 'Sizes', 'Confirmation', 'Scroll behavior'],
    snippet: `<Dialog\n  isOpen={open}\n  onOpenChange={setOpen}\n  title="Edit project"\n  description="Keep the essential details together."\n  footer={({ close }) => <Button onClick={close}>Done</Button>}\n>\n  <Input label="Project name" defaultValue="Studio launch" />\n</Dialog>`,
  },
  drawer: {
    title: 'Drawer', group: 'Base',
    description: 'A side or bottom detail surface that shares Dialog behavior, fits its viewport and keeps header and actions reachable.',
    sections: ['Preview', 'Placement', 'Bottom sheet'],
    snippet: `<Drawer\n  side="end"\n  title="Project settings"\n  isOpen={open}\n  onOpenChange={setOpen}\n>\n  <ProjectSettings />\n</Drawer>`,
  },
  'number-field': {
    title: 'Number Field', group: 'Base',
    description: 'A locale-aware numeric control with keyboard and press-and-hold steppers, range limits, currency formatting and associated validation.',
    sections: ['Preview', 'Formatting', 'Stepper placement', 'Validation and limits'],
    snippet: `<NumberField label="Quantity" defaultValue={2} minValue={1} maxValue={20} />\n<NumberField\n  label="Budget"\n  defaultValue={2500}\n  formatOptions={{ style: 'currency', currency: 'USD' }}\n  step={100}\n/>`,
  },
  popover: {
    title: 'Popover', group: 'Base',
    description: 'A positioned content surface with focus management, optional arrow, controlled state and dismissal that returns to its trigger.',
    sections: ['Preview', 'Placement and arrows', 'Interactive content'],
    snippet: `<Popover\n  trigger={<Button variant="secondary">Project details</Button>}\n  title="Studio launch"\n  showArrow\n>\n  <p>A shared place for your next release.</p>\n</Popover>`,
  },
} as const;
export type OverlayFieldSlug = keyof typeof overlayFieldPages;
export function isOverlayFieldSlug(slug: string): slug is OverlayFieldSlug { return Object.hasOwn(overlayFieldPages, slug); }
