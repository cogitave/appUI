export const splitPanePage = {
  'split-pane': {
    title: 'Split Pane', group: 'Base',
    description: 'Two panels with a shared, accessible resize handle. Dragging follows the pointer; keyboard resizing, collapse and restore use the library motion tokens. Content stays mounted when the layout changes direction.',
    sections: ['Preview', 'Vertical layout', 'Direction and limits', 'Disabled'],
    snippet: `<SplitPane primary={<ProjectFiles />} secondary={<CodePreview />}\n  primaryLabel="Project files" secondaryLabel="Code preview"\n  value={size} onValueChange={setSize} minValue={22} maxValue={65}\n  collapsible stackAt={520} height={340} />`,
  },
} as const;
