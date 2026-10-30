export const stepperPage = {
  stepper: {
    title: 'Stepper', group: 'Base',
    description: 'An ordered journey with numbered or label-only steps, optional descriptions, explicit completion and error states, and keyboard navigation. Narrow containers stack numbered steps without shrinking the text.',
    sections: ['Preview', 'Labels', 'Vertical', 'Read only', 'In Questionnaire'],
    snippet: `const [current, setCurrent] = useState('workspace');\nconst panelId = useId();\n\n<Stepper selectedKey={current} onSelectionChange={setCurrent}\n  steps={[\n    {id: 'workspace', label: 'Workspace', controls: panelId, status: saved ? 'complete' : 'pending'},\n    {id: 'team', label: 'Team', controls: panelId, isOptional: true},\n    {id: 'review', label: 'Review', controls: panelId, isDisabled: !saved},\n  ]}\n/>\n<section id={panelId} aria-label={current}>\n  <StepContent step={current} />\n</section>`,
  },
} as const;
