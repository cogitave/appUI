import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = JSON.parse(readFileSync(new URL('config/colors.json', root), 'utf8'));
let output = '/* Generated from config/colors.json. Run npm run colors:generate. */\n\n@theme static {\n';
for (const [step, color] of Object.entries(source.accents.blue.ramp)) output += `  --color-accent-${step}: ${color};\n`;
output += '}\n';
for (const [id, palette] of Object.entries(source.accents)) {
  if (id === 'blue') continue;
  output += `\n:root[data-accent='${id}'] {\n`;
  for (const [step, color] of Object.entries(palette.ramp)) output += `  --color-accent-${step}: ${color};\n`;
  // The additional palettes keep small white button labels readable on hover.
  if (!['blue', 'violet', 'copper'].includes(id)) {
    output += '  --gradient-action-hover: linear-gradient(180deg, var(--color-accent-500) 0%, var(--color-accent-600) 100%);\n';
  }
  output += '}\n';
}
const destination = new URL('styles/accent-palettes.css', root);
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) { console.error('Accent CSS needs regeneration.'); process.exitCode = 1; }
} else writeFileSync(fileURLToPath(destination), output);
