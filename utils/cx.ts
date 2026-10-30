import { extendTailwindMerge } from 'tailwind-merge';

const typeFamilies = [
  'large-title', 'display-1', 'display-2', 'display-3', 'display-4',
  'title-1', 'title-2', 'title-3', 'headline', 'body', 'body-2',
  'caption-1', 'caption-2',
] as const;
const weights = ['regular', 'medium', 'semibold', 'bold'] as const;

// Custom text styles share Tailwind's text-* namespace with colors.
// Registering them keeps both classes when they appear together.
export const cx = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: typeFamilies.flatMap((family) => weights.map((weight) => `${family}-${weight}`)) }],
    },
  },
});
