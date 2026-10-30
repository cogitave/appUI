import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadItem, loadIndex, loadStyleCatalog, validateBundle } from '../src/registry.mjs';
import {assembleStyleFiles} from '../src/styles.mjs';
import {transformSource} from '../src/project.mjs';
import { defaultConfig, loadConfig, planInstallation, applyInstallation, validateConfig } from '../src/project.mjs';

const cli = fileURLToPath(new URL('../bin/appui.mjs',import.meta.url));
async function fixture(t) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'appui-cli-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(path.join(root,'src'));
  await fs.writeFile(path.join(root,'package.json'),JSON.stringify({name:'fixture',private:true,dependencies:{react:'19.2.4','react-dom':'19.2.4',tailwindcss:'^4.0.0'}}));
  return root;
}
async function init(root) {
  const config=await defaultConfig(root);
  await applyInstallation(await planInstallation(root,[],{config,initialize:true}));
  return config;
}

test('dry run does not write source, config, lock or dependencies',async t=>{
  const root=await fixture(t),config=await defaultConfig(root);
  const plan=await planInstallation(root,['input-group','toggle'],{config,initialize:true});
  assert.ok(plan.changes.length>50);
  await applyInstallation(plan,{dryRun:true});
  assert.deepEqual((await fs.readdir(root)).sort(),['package.json','src']);
  assert.deepEqual(await fs.readdir(path.join(root,'src')),[]);
});

test('complete source closure, shared font styles and idempotent installs',async t=>{
  const root=await fixture(t),config=await init(root);
  const first=await planInstallation(root,['input-group','toggle-group']);
  assert.equal(first.conflicts.length,0);await applyInstallation(first);
  const input=await fs.readFile(path.join(root,config.paths.components,'base/input/input.tsx'),'utf8');
  assert.ok(input.includes("@/utils/appui/cx"));
  assert.ok(input.includes("@/components/appui/base/input/field-feedback"));
  const global=await fs.readFile(path.join(root,config.paths.styles,'globals.css'),'utf8');
  assert.ok(global.includes('@fontsource-variable/inter/standard.css'));
  assert.ok(global.includes('@source "../../components/appui";'));
  assert.ok(!global.includes('@import "./docs.css"'));
  const second=await planInstallation(root,['input-group','toggle-group']);
  assert.ok(second.changes.every(change=>change.status==='unchanged'));
  const result=await applyInstallation(second);assert.equal(result.written,0);
  const lock=JSON.parse(await fs.readFile(path.join(root,'.appui/installed.json'),'utf8'));
  assert.deepEqual(lock.components,['input-group','toggle-group']);
});

test('a customized file aborts all writes; explicit overwrite keeps a backup',async t=>{
  const root=await fixture(t),config=await init(root);
  await applyInstallation(await planInstallation(root,['button']));
  const button=path.join(root,config.paths.components,'base/buttons/button.tsx');
  const custom=(await fs.readFile(button,'utf8'))+'\n// Product customization\n';
  await fs.writeFile(button,custom);
  const previousLock=await fs.readFile(path.join(root,'.appui/installed.json'),'utf8');
  const plan=await planInstallation(root,['button','textarea']);
  assert.equal(plan.conflicts.length,1);
  await assert.rejects(applyInstallation(plan),/before writing/);
  await assert.rejects(fs.access(path.join(root,config.paths.components,'base/textarea/textarea.tsx')));
  assert.equal(await fs.readFile(button,'utf8'),custom);
  assert.equal(await fs.readFile(path.join(root,'.appui/installed.json'),'utf8'),previousLock);
  await applyInstallation(await planInstallation(root,['button','textarea'],{overwrite:true}));
  const stamps=await fs.readdir(path.join(root,'.appui/backups'));
  const backups=await Promise.allSettled(stamps.map(stamp=>fs.readFile(path.join(root,'.appui/backups',stamp,config.paths.components,'base/buttons/button.tsx'),'utf8')));
  assert.ok(backups.some(result=>result.status==='fulfilled'&&result.value===custom));
});

test('monorepo aliases and local asset URLs transform only recorded source ranges',async t=>{
  const root=await fixture(t),config=await defaultConfig(root);
  config.aliases.components='@workspace/ui/components';config.aliases.utils='@workspace/ui/utils';config.aliases.hooks='@workspace/ui/hooks';config.aliases.config='@workspace/ui/config';config.aliases.styles='@workspace/ui/styles';
  config.assetBaseURL='/assets/ui';
  const plan=await planInstallation(root,['activity-feed'],{config,initialize:true});
  await applyInstallation(plan);
  const component=await fs.readFile(path.join(root,config.paths.components,'blocks/activity-feed/activity-feed.tsx'),'utf8');
  assert.ok(component.includes('@workspace/ui/components/base/avatar/avatar'));
  const item=await loadItem('activity-feed');
  assert.equal(item.files.some(file=>file.path.includes('application/docs')),false);
  assert.equal(item.files.some(file=>file.path.startsWith('docs/')||file.path.startsWith('artifacts/')),false);
  assert.equal((await loadConfig(root)).aliases.utils,'@workspace/ui/utils');
  const cover=await fs.readFile(path.join(root,config.paths.styles,'template-audit.css'),'utf8');
  assert.ok(!cover.includes('coral-arch.webp'));
  await assert.rejects(fs.access(path.join(root,config.paths.assets,'carousel/coral-arch.webp')));
  // The existing local cover is selected only when its own class is required.
  // Validate its actual retained URL positions and binary bytes after pruning.
  const selected=assembleStyleFiles(await loadStyleCatalog(),{classes:['ui-profile-card__cover'],prefixes:[]});
  const selectedCover=selected.find(file=>file.path==='styles/template-audit.css');
  assert.ok(transformSource(selectedCover,config).toString().includes("url('/assets/ui/carousel/coral-arch.webp')"));
  const artwork=selected.find(file=>file.path==='public/carousel/coral-arch.webp');
  assert.ok(Buffer.from(artwork.content,'base64').length>0);
  assert.equal(Buffer.from(artwork.content,'base64').equals(await fs.readFile(new URL('../../../public/carousel/coral-arch.webp',import.meta.url))),true);
});

test('unsafe paths, symlink destinations and invalid config fail before writes',async t=>{
  const root=await fixture(t),config=await defaultConfig(root);
  assert.throws(()=>validateConfig({...config,paths:{...config.paths,components:'../outside'}}),/Unsafe/);
  await fs.mkdir(path.join(root,'elsewhere'));await fs.symlink(path.join(root,'elsewhere'),path.join(root,'src/components'));
  await assert.rejects(planInstallation(root,['button'],{config,initialize:true}),/symlink/);
  await fs.writeFile(path.join(root,'appui.json'),'{"schemaVersion":99}');
  const result=spawnSync(process.execPath,[cli,'init','--cwd',root],{encoding:'utf8'});
  assert.equal(result.status,1);assert.match(result.stderr,/schemaVersion/);
  assert.equal(await fs.readFile(path.join(root,'appui.json'),'utf8'),'{"schemaVersion":99}');
});

test('unknown components, corrupt bytes and inconsistent reference ranges are rejected',async()=>{
  await assert.rejects(loadItem('../../etc/passwd'),/Invalid component/);
  await assert.rejects(loadItem('template-ai-chat'),/not activated/);
  const item=await loadItem('button');
  const corrupt=structuredClone(item);corrupt.files[0].content+='x';
  assert.throws(()=>validateBundle(corrupt),/integrity/);
  const range=structuredClone(item);range.files.find(file=>file.references?.length).references[0].start=0;
  assert.throws(()=>validateBundle(range),/reference/);
  const index=await loadIndex();assert.ok(index.items.length>=106);
});
