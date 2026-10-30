export const meterPage = {
  meter: {
    title: 'Meter', group: 'Base',
    description: 'A quantity within a known range, for storage, capacity, quotas and usage. Optional segments show its parts while preserving the total and the accessible value.',
    sections: ['Preview', 'Tones and sizes', 'Segments', 'Units and ranges', 'Edge values'],
    snippet: `<Meter label="Storage used" value={64} maxValue={100}\n  formatOptions={{style: 'unit', unit: 'gigabyte'}}\n  tone="accent" />`,
  },
} as const;
