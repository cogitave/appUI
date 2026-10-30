export const treePages = {
  tree: {
    title: 'Tree', group: 'Base',
    description: 'A nested collection with independent focus and selection, controlled expansion, optional guides and animated groups. Single and multiple selection share the same row geometry and keyboard behavior.',
    sections: ['Preview', 'Multiple selection', 'Density and selection', 'Actions and grouping', 'Empty and disabled'],
    snippet: `<Tree items={items} aria-label="Project files"\n  defaultExpandedKeys={['src']} selectionMode="single"\n  selectedKeys={selected} onSelectionChange={setSelected}\n  onAction={openFile} />`,
  },
  'file-explorer': {
    title: 'File Explorer', group: 'Blocks',
    description: 'A file panel composed from Tree, SearchField, ScrollArea and Card. Search retains matching ancestors, manual expansion survives search, and constrained panels use native scrolling with directional controls.',
    sections: ['Preview', 'Long collections', 'Density and surfaces', 'Empty and loading'],
    snippet: `<FileExplorer items={files} title="Project files" height={360}\n  defaultExpandedKeys={['src']} selectedKeys={selected}\n  onSelectionChange={setSelected} onOpen={openFile}\n  toolbar={<NewFileButton />} />`,
  },
} as const;
export type TreeSlug = keyof typeof treePages;
export function isTreeSlug(slug: string): slug is TreeSlug { return Object.hasOwn(treePages, slug); }
