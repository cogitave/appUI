import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import postcss from 'postcss';
import { readDocMetadata } from './read-doc-metadata.mjs';
import { describeStylesheet, sourceStyleRequirements, stylesheetAssetReferences } from './build-style-catalog.mjs';
import {mergeStyleRequirements} from '../packages/cli/src/styles.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJSON = async name => JSON.parse(await fs.readFile(path.join(root, name), 'utf8'));
const [catalog, specification, manifest, families] = await Promise.all([
  readJSON('components/application/docs/catalog.json'), readJSON('registry/entries.json'), readJSON('package.json'), readJSON('config/component-families.json'),
]);
const output = path.join(root, 'packages/cli/registry');
const documentation = readDocMetadata(root);
const sha = content => crypto.createHash('sha256').update(content).digest('hex');
const sourceCache = new Map();
const slash = name => name.split(path.sep).join('/');

async function walk(folder) {
  const entries = await fs.readdir(path.join(root,folder),{withFileTypes:true});
  const result = [];
  for(const entry of entries) {
    const name = `${folder}/${entry.name}`;
    if(entry.isDirectory())result.push(...await walk(name));else result.push(name);
  }
  return result;
}
const componentFiles = await walk('components');

async function resolveImport(from, specifier) {
  const base = specifier.startsWith('@/') ? specifier.slice(2) : slash(path.join(path.dirname(from),specifier));
  if(base.startsWith('../') || path.isAbsolute(base))throw new Error(`Import leaves the source root: ${from} → ${specifier}`);
  for(const suffix of ['', '.ts','.tsx','.json','.css','/index.ts','/index.tsx']) {
    try {if((await fs.stat(path.join(root,base+suffix))).isFile())return base+suffix;}catch{}
  }
  throw new Error(`Unresolved import: ${from} → ${specifier}`);
}

async function inspect(name) {
  if(sourceCache.has(name))return sourceCache.get(name);
  if(!/^(components\/(base|blocks|charts|templates|foundations)|hooks|utils|config|styles)\//.test(name))throw new Error(`Undistributable source dependency: ${name}`);
  const content = await fs.readFile(path.join(root,name),'utf8');
  const local = new Set(), packages = new Set(), assets = new Set(), exports = new Set(), references = [];
  const syntax = ts.createSourceFile(name,content,ts.ScriptTarget.Latest,true,name.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const imports = [];
  function visit(node) {
    if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))imports.push(node.moduleSpecifier);
    if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))imports.push(node.arguments[0]);
    if(ts.isStringLiteral(node)&&node.text.startsWith('/')&&!node.text.startsWith('//')&&!node.text.includes('..'))assets.add({path:node.text.slice(1),start:node.getStart(syntax)+1,end:node.getEnd()-1});
    const exported = node.modifiers?.some(modifier=>modifier.kind===ts.SyntaxKind.ExportKeyword);
    if(exported&&node.name&&ts.isIdentifier(node.name))exports.add(node.name.text);
    if(exported&&ts.isVariableStatement(node))for(const declaration of node.declarationList.declarations)if(ts.isIdentifier(declaration.name))exports.add(declaration.name.text);
    if(ts.isExportDeclaration(node)&&node.exportClause&&ts.isNamedExports(node.exportClause))for(const element of node.exportClause.elements)exports.add(element.name.text);
    ts.forEachChild(node,visit);
  }
  if(!name.endsWith('.json')&&!name.endsWith('.css'))visit(syntax);
  if(name.endsWith('.css'))for(const reference of stylesheetAssetReferences(content))assets.add({path:reference.value.slice(1),start:reference.start,end:reference.end});
  for(const node of imports) {
    const specifier = node.text;
    if(specifier.startsWith('@/')||specifier.startsWith('.')) {
      const target = await resolveImport(name,specifier);local.add(target);
      references.push({kind:'module',value:specifier,target,start:node.getStart(syntax)+1,end:node.getEnd()-1});
    }
    else if(!specifier.startsWith('node:'))packages.add(specifier.startsWith('@')?specifier.split('/').slice(0,2).join('/'):specifier.split('/')[0]);
  }
  const validAssets=[];
  for(const asset of assets){try{if((await fs.stat(path.join(root,'public',asset.path))).isFile()){validAssets.push(`public/${asset.path}`);references.push({kind:'asset',value:`/${asset.path}`,target:`public/${asset.path}`,start:asset.start,end:asset.end});}}catch{}}
  const styleRequirements=name.endsWith('.tsx')||name.endsWith('.ts')?sourceStyleRequirements(syntax,ts):{classes:[],prefixes:[]};
  const result = {path:name, content,sha256:sha(content), references, imports:[...local], packages:[...packages], assets:validAssets,exports:[...exports].sort(),styleRequirements};
  sourceCache.set(name,result);return result;
}

async function closure(entries) {
  const files = new Map(), packages = new Set(),assets = new Set();
  async function add(name) {
    if(files.has(name))return;
    const source = await inspect(name);files.set(name,source);
    source.packages.forEach(value=>packages.add(value));source.assets.forEach(value=>assets.add(value));
    for(const dependency of source.imports)await add(dependency);
  }
  for(const entry of entries)await add(entry);
  const dependencies={};
  for(const name of [...packages].sort()) {
    const version = manifest.dependencies[name]??manifest.devDependencies[name];
    if(!version)throw new Error(`Missing dependency version: ${name}`);
    dependencies[name]=version;
    for(const typePackage of specification.typeDependencies?.[name]??[]) {
      const typeVersion=manifest.dependencies[typePackage]??manifest.devDependencies[typePackage];
      if(!typeVersion)throw new Error(`Missing type dependency: ${name} → ${typePackage}`);
      dependencies[typePackage]=typeVersion;
    }
  }
  const sourceFiles=[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)).map(({path,content,sha256,references})=>({path,content,sha256,references,encoding:'utf8'}));
  for(const name of [...assets].sort()) {
    const bytes = await fs.readFile(path.join(root,name));
    sourceFiles.push({path:name,content:bytes.toString('base64'),sha256:sha(bytes),encoding:'base64'});
  }
  return {files:sourceFiles,dependencies,styleRequirements:mergeStyleRequirements([...files.values()])};
}

const cssSource = await fs.readFile(path.join(root,'styles/globals.css'),'utf8');
const libraryCSS = cssSource.split('\n').filter(line=>!specification.excludedStyles.some(name=>line.includes(`"./${name}"`))).join('\n')
  .replace('@import "tailwindcss";', '@import "tailwindcss";\n@import "@fontsource-variable/inter/standard.css";\n@import "@fontsource-variable/inter/standard-italic.css";\n@import "@fontsource-variable/jetbrains-mono";')
  + '\n:root { --font-inter: "Inter Variable"; --font-mono-source: "JetBrains Mono Variable"; }\n';
const styleNames = [...libraryCSS.matchAll(/@import "\.\/(.+?)";/g)].map(match=>`styles/${match[1]}`);
const core = await closure(specification.foundations);
const globalTree=postcss.parse(libraryCSS),before=[],after=[];
for(const node of globalTree.nodes){const css=node.toString()+((node.type==='atrule'&&!node.nodes)||node.type==='decl'?';':'');if(node.type==='atrule'&&node.name==='import'){if(!node.params.startsWith('"./'))before.push(css);}else after.push(css);}
const styleAssets=new Map(),stylesheets=[];
async function verifyStyleAssets(blocks){
  for(const block of blocks){if(block.type==='group'){await verifyStyleAssets(block.children);continue;}
    const valid=[];
    for(const reference of block.references){
      if(reference.target.split('/').some(part=>part==='..'||part==='.'||!part))throw new Error('Unsafe stylesheet asset path.');
      let bytes;try{bytes=await fs.readFile(path.join(root,reference.target));}catch(error){if(error.code==='ENOENT')continue;throw error;}
      styleAssets.set(reference.target,{path:reference.target,encoding:'base64',content:bytes.toString('base64'),sha256:sha(bytes)});valid.push(reference);
    }
    block.references=valid;
  }
}
for(const name of styleNames){const blocks=describeStylesheet(await fs.readFile(path.join(root,name),'utf8'));await verifyStyleAssets(blocks);stylesheets.push({path:name,blocks});}
const styleCatalog={schemaVersion:1,global:{before:before.join('\n'),after:after.join('\n')},stylesheets,assets:[...styleAssets.values()].sort((a,b)=>a.path.localeCompare(b.path))};
const styleContent=JSON.stringify(styleCatalog,null,2)+'\n';
core.dependencies.tailwindcss = manifest.devDependencies.tailwindcss;
Object.assign(core.dependencies,specification.fontDependencies);
const assetsNote = await fs.readFile(path.join(root,'docs/asset-provenance.md'),'utf8');

const index = {schemaVersion:1,name:'appUI',version:manifest.version,stylesSha256:sha(styleContent),items:[]};
await fs.mkdir(path.join(output,'items'),{recursive:true});
await fs.writeFile(path.join(output,'foundations.json'),JSON.stringify({name:'foundations',...core},null,2)+'\n');
await fs.writeFile(path.join(output,'styles.json'),styleContent);
await fs.writeFile(path.join(output,'asset-provenance.md'),assetsNote);
for(const entry of catalog.entries.filter(item=>['Base','Blocks','Charts'].includes(item.group))) {
  let entries=specification.overrides[entry.slug];
  if(!entries)entries=entry.group==='Charts'?['components/charts/chart-cards.tsx']:componentFiles.filter(name=>path.basename(name)===`${entry.slug}.tsx`&&name.startsWith(entry.group==='Base'?'components/base/':'components/blocks/'));
  if(!entries?.length)throw new Error(`No source entry for ${entry.slug}`);
  const sources=await closure(entries);
  const page=documentation[entry.slug];
  if(!page)throw new Error(`No documentation for ${entry.slug}`);
  const item={name:entry.slug,title:entry.label,group:entry.group,type:entry.group==='Base'?'component':entry.group==='Blocks'?'block':'chart',description:page.description,sections:page.sections,example:page.snippet.replaceAll('\\n','\n'),entryFiles:entries,exports:await Promise.all(entries.map(async name=>({path:name,names:(await inspect(name)).exports}))),...sources};
  const content=JSON.stringify(item,null,2)+'\n';
  await fs.writeFile(path.join(output,'items',`${entry.slug}.json`),content);
  index.items.push({name:item.name,title:item.title,description:item.description,group:item.group,type:item.type,entryFiles:entries,fileCount:item.files.length,dependencies:item.dependencies,sha256:sha(content)});
}
index.items.sort((a,b)=>a.title.localeCompare(b.title,'en'));
// Only expose families whose complete source is available in this release.
const available = new Set(index.items.map(item => item.name));
index.families = families.families.filter(family => family.members.every(member => available.has(member.slug)));
await fs.writeFile(path.join(output,'index.json'),JSON.stringify(index,null,2)+'\n');
console.log(`Built ${index.items.length} appUI registry items and ${core.files.length} shared foundation files.`);
