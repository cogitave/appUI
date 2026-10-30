import source from '@/config/component-families.json';
import catalogSource from './catalog.json';

export const componentFamilies = source.families;
export type ComponentFamily = typeof componentFamilies[number];
export type FamilyMember = ComponentFamily['members'][number];
export type CatalogEntry = typeof catalogSource.entries[number];
const bySlug = new Map(componentFamilies.flatMap(family => family.members.map(member => [member.slug, family] as const)));

export function familyForSlug(slug: string) { return bySlug.get(slug); }
export function memberForSlug(slug: string) { return familyForSlug(slug)?.members.find(member => member.slug === slug); }
export function catalogTitle(slug: string, fallback: string) { return familyForSlug(slug)?.label ?? fallback; }

/** Original entries remain the addressable catalog; presentation has one root per family. */
export const catalogRoots = catalogSource.entries.filter(item => {
  const family = familyForSlug(item.slug);
  return !family || family.rootSlug === item.slug;
}).map(item => {
  const family = familyForSlug(item.slug);
  return { ...item, label: family?.label ?? item.label, isNew: item.isNew || Boolean(family?.members.some(member => catalogSource.entries.find(entry => entry.slug === member.slug)?.isNew)) };
});

/** Template categories already supply the hierarchy; show their actual screens directly. */
export const catalogNavigationEntries = catalogRoots.flatMap(item => {
  const family = familyForSlug(item.slug);
  if (item.group !== 'Templates' || !family) return [item];
  return family.members.map(member => {
    const original = catalogSource.entries.find(entry => entry.slug === member.slug)!;
    const label = 'navigationLabel' in member && typeof member.navigationLabel === 'string' ? member.navigationLabel : member.label;
    return { ...original, label };
  });
});

export function catalogNavigationMatches(item: CatalogEntry, query: string) {
  if (item.group !== 'Templates') return catalogEntryMatches(item, query);
  const family = familyForSlug(item.slug);
  const member = memberForSlug(item.slug);
  const original = catalogSource.entries.find(entry => entry.slug === item.slug);
  const words = `${item.label} ${original?.label ?? ''} ${item.slug} ${item.group} ${item.category ?? ''} ${family?.label ?? ''} ${member?.value ?? ''}`.toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean).every(term => words.includes(term));
}

export function catalogEntryMatches(item: CatalogEntry, query: string) {
  const family = familyForSlug(item.slug);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const aliases = family?.members.flatMap(member => {
    const original = catalogSource.entries.find(entry => entry.slug === member.slug);
    return [member.label, member.value, member.slug, original?.label ?? ''];
  }) ?? [];
  return terms.every(term => `${item.label} ${item.slug} ${item.group} ${item.category ?? ''} ${family?.label ?? ''} ${aliases.join(' ')}`.toLowerCase().includes(term));
}
