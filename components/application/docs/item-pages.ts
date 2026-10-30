export const itemPages = {
  item: {
    title:'Item',group:'Base',
    description:'Content rows composed from Card, with media, text and ordinary actions. Three surfaces, three sizes, native list groups and complete row links share the same typography and responsive layout.',
    sections:['Preview','Surfaces','Sizes and groups','Media','Headers and footers','Links','Long content','Right to left'],
    snippet:`<Item variant="outline">\n  <ItemMedia variant="avatar"><Avatar initials="MC" /></ItemMedia>\n  <ItemContent>\n    <ItemTitle>Maya Chen</ItemTitle>\n    <ItemDescription>Design lead</ItemDescription>\n  </ItemContent>\n  <ItemActions><Button size="small">View profile</Button></ItemActions>\n</Item>`,
  },
} as const;
export type ItemSlug=keyof typeof itemPages;
export function isItemSlug(slug:string):slug is ItemSlug{return Object.hasOwn(itemPages,slug);}
