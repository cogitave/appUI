export const journeyPages = {
  'activity-feed': {
    title: 'Activity Feed', group: 'Blocks',
    description: 'A chronological history of people and system updates, with optional date groups, details and actions. The card grows with its content or keeps an explicit height with native scrolling.',
    sections: ['Preview', 'Density and surfaces', 'Constrained history', 'Empty and loading'],
    snippet: `<ActivityFeed items={updates} label="Project activity"\n  expandedKeys={expanded} onExpandedChange={setExpanded}\n  density="normal" />`,
  },
  'onboarding-checklist': {
    title: 'Onboarding Checklist', group: 'Blocks',
    description: 'A setup card with required and optional tasks, progress, actions and an animated disclosure. Completion can follow application data or direct checkbox choices, with controlled state and optional dismissal.',
    sections: ['Preview', 'Direct choices', 'Density and surfaces', 'Collapsed and dismissed', 'Optional and empty'],
    snippet: `<OnboardingChecklist items={tasks} completedKeys={completed}\n  isReadOnly onComplete={celebrateSetup}\n  dismissible onDismiss={rememberDismissal} />`,
  },
} as const;
export type JourneySlug = keyof typeof journeyPages;
export function isJourneySlug(slug: string): slug is JourneySlug { return Object.hasOwn(journeyPages, slug); }
