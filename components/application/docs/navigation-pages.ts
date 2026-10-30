export const navigationPages = {
  direction: {
    title: 'Direction', group: 'Base',
    description: 'A scoped locale and DOM direction for readable layout, logical keyboard navigation and portaled controls. Nested scopes preserve the surrounding application.',
    sections: ['Preview', 'Nested scopes', 'Direction only', 'Portaled controls'],
    snippet: `<Direction locale="ar-AE">\n  <Select label="Visibility" options={visibilityOptions} />\n  <NavigationMenu aria-label="Workspace navigation" items={navigation} />\n</Direction>`,
  },
  'navigation-menu': {
    title: 'Navigation Menu', group: 'Base',
    description: 'Site links with expandable panels, ordinary Tab navigation and measured height transitions. Choose a floating dropdown or inline expansion, with scoped logical direction.',
    sections: ['Preview', 'Inline expansion', 'Hover opening', 'Controlled state', 'Right to left', 'Keyboard access'],
    snippet: `<NavigationMenu aria-label="Product navigation" items={[\n  {id: 'product', label: 'Product', content: <div>\n    <NavigationMenuLink href="/projects" description="Organize the next release.">Projects</NavigationMenuLink>\n    <NavigationMenuLink href="/calendar" description="Keep plans and dates together.">Calendar</NavigationMenuLink>\n  </div>},\n  {id: 'docs', label: 'Documentation', href: '/docs'},\n]} />`,
  },
  menubar: {
    title: 'Menubar', group: 'Base',
    description: 'Application commands in a persistent bar, with one Tab stop, logical arrow navigation, nested actions and independent selection groups.',
    sections: ['Preview', 'Appearances and density', 'Disabled entries', 'Controlled menu', 'Keyboard access'],
    snippet: `<Menubar aria-label="Document commands" items={[\n  {id: 'file', label: 'File', children: <ActionMenu aria-label="File">\n    <ActionMenuItem id="new" onAction={newDocument}>New document</ActionMenuItem>\n    <ActionMenuItem id="save" onAction={saveDocument}>Save</ActionMenuItem>\n  </ActionMenu>},\n  {id: 'edit', label: 'Edit', children: <ActionMenu aria-label="Edit">\n    <ActionMenuItem id="duplicate" onAction={duplicateDocument}>Duplicate</ActionMenuItem>\n  </ActionMenu>},\n]} />`,
  },
  'context-menu': {
    title: 'Context Menu', group: 'Base',
    description: 'Actions at the pointer, with touch long press and keyboard access. Shared menus support submenus, shortcuts, independent selections and animated density.',
    sections: ['Preview', 'Compact', 'Nested actions', 'Selections and density', 'Constrained collections', 'Right to left', 'Disabled target', 'Keyboard access'],
    snippet: `<ContextMenu density="compact">\n  <ContextMenuTrigger aria-label="Actions for release notes">Release notes.md</ContextMenuTrigger>\n  <ActionMenuPopover>\n    <ActionMenu aria-label="File actions">\n      <ActionMenuItem id="open" onAction={openFile}>Open</ActionMenuItem>\n      <ActionMenuItem id="duplicate" onAction={duplicateFile}>Duplicate</ActionMenuItem>\n      <ActionMenuSeparator />\n      <ActionMenuItem id="delete" variant="destructive" onAction={deleteFile}>Delete</ActionMenuItem>\n    </ActionMenu>\n  </ActionMenuPopover>\n</ContextMenu>`,
  },
} as const;
export type NavigationSlug = keyof typeof navigationPages;
export function isNavigationSlug(slug: string): slug is NavigationSlug { return Object.hasOwn(navigationPages, slug); }
