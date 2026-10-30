export const colorSwatchPages={
 'color-swatch':{
  title:'Color Swatch',group:'Base',
  description:'Color previews and accessible named palette choices, with transparency, three sizes, circular or square shapes, flat or gloss surfaces and native keyboard selection.',
  sections:['Preview','Controlled palette','Sizes and shapes','Appearance options','Named choices','Disabled choices','Scrollable palettes','Empty palette','Right to left'],
  snippet:`<ColorSwatch color="#47bea7" colorName="Teal" />\n<ColorSwatchPicker aria-label="Accent color" options={colors}\n  value={color} onValueChange={setColor} layout="row" />`,
 },
} as const;
