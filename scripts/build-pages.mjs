import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
  stdio: 'inherit',
  env: { ...process.env, APPUI_STATIC_EXPORT: 'true' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
await fs.writeFile('out/.nojekyll', '');
