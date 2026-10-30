export const compositionPages = {
  toggle: {
    title: 'Toggle', group: 'Base',
    description: 'A pressed action with controlled or independent state, three appearances, three sizes and animated feedback.',
    sections: ['Preview', 'Appearances', 'Sizes', 'Icon actions', 'Disabled'],
    snippet: `<Toggle isSelected={saved} onChange={setSaved}>\n  <RiBookmarkLine aria-hidden /> Save\n</Toggle>`,
  },
  'toggle-group': {
    title: 'Toggle Group', group: 'Base',
    description: 'Related pressed controls with single or multiple selection, joined or separated surfaces and logical keyboard navigation.',
    sections: ['Preview', 'Single selection', 'Layouts and orientation', 'Formatting toolbar', 'Disabled items'],
    snippet: `<ToggleGroup aria-label="Text formatting" selectionMode="multiple"\n  selectedKeys={formatting} onSelectionChange={setFormatting}>\n  <Toggle id="bold" aria-label="Bold" iconOnly><RiBold aria-hidden /></Toggle>\n  <Toggle id="italic" aria-label="Italic" iconOnly><RiItalic aria-hidden /></Toggle>\n</ToggleGroup>`,
  },
  'aspect-ratio': {
    title: 'Aspect Ratio', group: 'Base',
    description: 'A responsive media container that reserves exact bounds before content loads, with cover or contain fitting and four corner options.',
    sections: ['Preview', 'Ratios', 'Cover and contain', 'Corner options'],
    snippet: `<AspectRatio ratio={16 / 9} fit="cover" radius="medium">\n  <ImageArtwork image={{src: '/carousel/coral-arch.webp'}} alt="Coral paper arch" />\n</AspectRatio>`,
  },
  kbd: {
    title: 'Kbd', group: 'Base',
    description: 'Compact keyboard hints and shortcut groups in soft or outlined surfaces. The visual hint does not register a shortcut by itself.',
    sections: ['Preview', 'Appearances and sizes', 'Shortcut groups', 'With controls'],
    snippet: `<KbdGroup aria-label="Command K">\n  <Kbd variant="outline">⌘</Kbd>\n  <Kbd variant="outline">K</Kbd>\n</KbdGroup>`,
  },
  'input-group': {
    title: 'Input Group', group: 'Base',
    description: 'Inline icons, text, actions and block additions composed from the shared Input and Textarea, with their labels, focus and validation intact.',
    sections: ['Preview', 'Inline additions', 'Block additions', 'Textarea and actions', 'Sizes and states'],
    snippet: `<InputGroup label="Project address" leading="https://"\n  placeholder="your-project" trailing=".app" />\n<InputGroup kind="textarea" label="Project note"\n  blockStart={<span>Markdown supported</span>}\n  blockEnd={<Button type="submit">Save note</Button>} />`,
  },
} as const;

export type CompositionSlug = keyof typeof compositionPages;
export function isCompositionSlug(slug: string): slug is CompositionSlug { return Object.hasOwn(compositionPages, slug); }
