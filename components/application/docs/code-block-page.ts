export const codeBlockPage = {
  'code-block': {
    title: 'Code Block', group: 'Base',
    description: 'A shared code surface with exact-source copying, animated format changes, optional line numbers, highlighted lines, wrapping and native scrolling. Code remains selectable and the surrounding layout follows content height.',
    sections: ['Preview', 'Lines and wrapping', 'Long code', 'Surfaces and density', 'Empty and disabled'],
    snippet: `<CodeBlock code={source} label="theme.css" language="CSS"\n  lineNumbers highlightedLines={[2, 3]} wrap maxHeight={280}\n  onCopy={notify} />\n\n<CodeBlock examples={commands} label="Install"\n  value={format} onValueChange={setFormat} />`,
  },
} as const;
