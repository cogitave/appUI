export const commandPages = {
  'command-menu': {
    title: 'Command Menu', group: 'Base',
    description: 'Searchable, grouped actions with keyboard navigation, optional descriptions, shortcuts and a fixed scrolling area. The search field keeps focus while you move between results.',
    sections: ['Preview', 'Density', 'Descriptions and keywords', 'Empty and loading'],
    snippet: `<CommandMenu items={commands} label="Workspace commands"\n  onAction={command => openView(command.id)}\n  density="normal" height={360} />`,
  },
  'command-palette': {
    title: 'Command Palette', group: 'Blocks',
    description: 'The shared Command Menu inside a focus-trapped Dialog. An optional hideHeader surface keeps its accessible title while showing search directly. Search and result changes preserve the panel bounds; choosing an action can close the palette or keep it available.',
    sections: ['Preview', 'Keep open after action', 'Initial search', 'Keyboard access'],
    snippet: `<Button onClick={() => setOpen(true)}>Open commands</Button>\n<CommandPalette isOpen={open} onOpenChange={setOpen}\n  items={commands} onAction={runCommand} />`,
  },
} as const;
export type CommandSlug = keyof typeof commandPages;
export function isCommandSlug(slug: string): slug is CommandSlug { return Object.hasOwn(commandPages, slug); }
