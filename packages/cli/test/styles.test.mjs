import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import postcss from 'postcss';
import ts from 'typescript';
import {describeStylesheet,sourceStyleRequirements} from '../../../scripts/build-style-catalog.mjs';
import {compileStylesheet} from '../src/styles.mjs';
import {defaultConfig,planInstallation,applyInstallation} from '../src/project.mjs';
import {loadStyleCatalog,validateStyleCatalog} from '../src/registry.mjs';

test('selected CSS retains the original cascade, wrappers, keyframes and exact URL ranges',()=>{
 const source=`@layer controls;
.ui-unused {color:red;}
.ui-cover {color:blue;background:url('/carousel/coral-arch.webp');}
@media (max-width:600px){.ui-unused {color:orange;} @supports(display:grid){.ui-cover {color:green;}}}
.ui-container:not(.ui-container--ghost) .ui-cover {color:purple;}
@keyframes travel {to {transform:translateX(10px);}}
@media(prefers-reduced-motion:reduce){.ui-cover {animation:none;}}
.ui-cover {color:black;}`;
 const selected=compileStylesheet(describeStylesheet(source),{classes:['ui-cover'],prefixes:[]});
 const tree=postcss.parse(selected.content);
 const colors=[];tree.walkDecls('color',declaration=>colors.push(declaration.value));
 assert.deepEqual(colors,['blue','green','purple','black']);
 assert.ok(selected.content.includes('@layer controls;'));
 assert.ok(selected.content.includes('@supports'));
 assert.ok(selected.content.includes('@keyframes travel'));
 assert.ok(selected.content.includes('prefers-reduced-motion'));
 assert.ok(!selected.content.includes('.ui-unused'));
 assert.equal(selected.references.length,1);
 for(const reference of selected.references)assert.equal(selected.content.slice(reference.start,reference.end),reference.value);
});

test('source AST keeps dynamic class families while unrelated UI rules are omitted',()=>{
 const source=ts.createSourceFile('test.tsx','const x = <div className={`ui-collection ui-density-${density}`}><span className="ui-title"/></div>;',ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const requirements=sourceStyleRequirements(source,ts);
 assert.ok(requirements.classes.includes('ui-title'));
 assert.ok(requirements.prefixes.includes('ui-density-'));
 const selected=compileStylesheet(describeStylesheet('.ui-density-small {padding:4px}.ui-density-large {padding:8px}.ui-unrelated {padding:0}'),requirements);
 assert.ok(selected.content.includes('.ui-density-small'));
 assert.ok(selected.content.includes('.ui-density-large'));
 assert.ok(!selected.content.includes('.ui-unrelated'));
});

async function fixture(t){const root=await fs.mkdtemp(path.join(os.tmpdir(),'appui-style-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.mkdir(path.join(root,'src'));await fs.writeFile(path.join(root,'package.json'),'{}');await applyInstallation(await planInstallation(root,[],{config:await defaultConfig(root),initialize:true}));return root;}

test('incremental install order produces the same styles and retains earlier controls',async t=>{
 const a=await fixture(t),b=await fixture(t);
 for(const name of ['toggle','input-group'])await applyInstallation(await planInstallation(a,[name]));
 for(const name of ['input-group','toggle'])await applyInstallation(await planInstallation(b,[name]));
 const folder='src/styles/appui';
 const names=(await fs.readdir(path.join(a,folder))).sort();
 assert.deepEqual(names,(await fs.readdir(path.join(b,folder))).sort());
 for(const name of names)assert.equal(await fs.readFile(path.join(a,folder,name),'utf8'),await fs.readFile(path.join(b,folder,name),'utf8'));
 const controls=await fs.readFile(path.join(a,folder,'composition-controls.css'),'utf8');
 assert.ok(controls.includes('.ui-toggle'));
 assert.ok(controls.includes('.ui-input-group'));
 assert.ok(!controls.includes('.ui-aspect-ratio'));
});

test('customized shared styles abort an incremental install before new source is written',async t=>{
 const root=await fixture(t);await applyInstallation(await planInstallation(root,['toggle']));
 const stylesheet=path.join(root,'src/styles/appui/composition-controls.css');
 const custom=(await fs.readFile(stylesheet,'utf8'))+'\n/* Product customization */\n';await fs.writeFile(stylesheet,custom);
 const plan=await planInstallation(root,['input-group']);
 assert.ok(plan.conflicts.some(file=>file.path.endsWith('composition-controls.css')));
 await assert.rejects(applyInstallation(plan),/before writing/);
 await assert.rejects(fs.access(path.join(root,'src/components/appui/base/input-group/input-group.tsx')));
 assert.equal(await fs.readFile(stylesheet,'utf8'),custom);
});

test('style catalogs reject unsafe paths, asset metadata and excessive nesting',async()=>{
 const catalog=await loadStyleCatalog();
 const unsafe=structuredClone(catalog);unsafe.stylesheets[0].path='styles/../private.css';assert.throws(()=>validateStyleCatalog(unsafe),/stylesheet path/);
 const reference=structuredClone(catalog),walk=nodes=>{for(const node of nodes){if(node.type==='group'){const result=walk(node.children);if(result)return result;}else if(node.references.length)return node.references[0];}};
 walk(reference.stylesheets.find(file=>file.path==='styles/template-audit.css').blocks).target='public/../private';assert.throws(()=>validateStyleCatalog(reference),/asset reference/);
 const deep=structuredClone(catalog);let group={type:'always',css:'body{margin:0}',references:[]};for(let i=0;i<34;i++)group={type:'group',name:'media',params:'all',children:[group]};deep.stylesheets[0].blocks=[group];assert.throws(()=>validateStyleCatalog(deep),/style tree/);
});
