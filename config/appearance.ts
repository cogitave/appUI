import colors from './colors.json';

export type Accent = keyof typeof colors.accents;
export const accentNames = Object.keys(colors.accents) as Accent[];
export const accentPalettes = colors.accents;
export const accents = accentNames.map(id => ({ id, label: colors.accents[id].label, swatch: colors.accents[id].ramp['500'] }));

export function isAccent(value: string | null | undefined): value is Accent {
  return value != null && Object.hasOwn(colors.accents, value);
}
