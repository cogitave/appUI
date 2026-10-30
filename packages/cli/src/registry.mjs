import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const registryDirectory = fileURLToPath(new URL('../registry/',import.meta.url));
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const json = async file => JSON.parse(await fs.readFile(file,'utf8'));
const validName = name => typeof name==='string'&&/^[a-z][a-z0-9-]*$/.test(name);

export async function loadIndex() {
  const index = await json(path.join(registryDirectory,'index.json'));
  if(index.schemaVersion!==1||!Array.isArray(index.items))throw new Error('Unsupported appUI registry schema. Rebuild the registry.');
  return index;
}

export async function loadItem(name) {
  if(!validName(name))throw new Error(`Invalid component name: ${name}`);
  const index = await loadIndex();
  const record = index.items.find(item=>item.name===name);
  if(!record)throw new Error(name.startsWith('template-')?'Template distribution is not activated. Use the owner source checkout; the license service is not published.':`Unknown component: ${name}. Run appui list.`);
  const content = await fs.readFile(path.join(registryDirectory,'items',`${name}.json`),'utf8');
  if(sha256(content)!==record.sha256)throw new Error(`Registry integrity check failed: ${name}`);
  return validateBundle(JSON.parse(content));
}

export async function loadFoundations() {
  return validateBundle(await json(path.join(registryDirectory,'foundations.json')));
}

export async function loadStyleCatalog() {
  const index=await loadIndex(),content=await fs.readFile(path.join(registryDirectory,'styles.json'),'utf8');
  if(sha256(content)!==index.stylesSha256)throw new Error('Style registry integrity check failed. Rebuild the registry.');
  return validateStyleCatalog(JSON.parse(content));
}

export function validateStyleCatalog(catalog) {
  if(catalog?.schemaVersion!==1||!Array.isArray(catalog.stylesheets)||!Array.isArray(catalog.assets)||typeof catalog.global?.before!=='string'||typeof catalog.global?.after!=='string')throw new Error('Malformed style catalog.');
  const paths=new Set();
  function blocks(nodes,depth=0){
    if(!Array.isArray(nodes)||depth>32)throw new Error('Malformed style tree.');
    for(const node of nodes){
      if(node?.type==='group'){
        if(!['media','supports','container','layer','scope','starting-style'].includes(node.name)||typeof node.params!=='string')throw new Error('Malformed style group.');
        blocks(node.children,depth+1);continue;
      }
      if(!['rule','always','comment'].includes(node?.type)||typeof node.css!=='string'||!Array.isArray(node.references))throw new Error('Malformed style leaf.');
      if(node.type==='rule'&&(!Array.isArray(node.classes)||node.classes.some(name=>typeof name!=='string'||!name.startsWith('ui-'))))throw new Error('Malformed style class requirements.');
      validateBundle({files:[{path:'styles/check.css',encoding:'utf8',content:node.css,sha256:sha256(node.css),references:node.references}],dependencies:{}});
      for(const reference of node.references)if(reference.kind!=='asset'||reference.target!==`public${reference.value}`||reference.target.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe style asset reference.');
    }
  }
  for(const stylesheet of catalog.stylesheets){
    if(typeof stylesheet.path!=='string'||!/^styles\/[a-z0-9._-]+\.css$/.test(stylesheet.path)||paths.has(stylesheet.path))throw new Error('Unsafe or duplicate stylesheet path.');
    paths.add(stylesheet.path);blocks(stylesheet.blocks);
  }
  validateBundle({files:catalog.assets,dependencies:{}});
  if(catalog.assets.some(file=>!file.path.startsWith('public/')))throw new Error('Unsafe style asset source.');
  return catalog;
}

export function validateBundle(bundle) {
  if(!bundle||!Array.isArray(bundle.files)||typeof bundle.dependencies!=='object')throw new Error('Malformed registry bundle.');
  if(bundle.styleRequirements)for(const key of ['classes','prefixes'])if(!Array.isArray(bundle.styleRequirements[key])||bundle.styleRequirements[key].some(name=>typeof name!=='string'||!/^ui-[A-Za-z0-9_-]+$/.test(name)))throw new Error('Malformed source style requirements.');
  const paths = new Set();
  for(const file of bundle.files) {
    if(typeof file.path!=='string'||!file.path||file.path.includes('\\')||path.posix.isAbsolute(file.path)||file.path.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe registry file path.');
    if(paths.has(file.path))throw new Error(`Duplicate registry file: ${file.path}`);paths.add(file.path);
    if(file.encoding!=='utf8'&&file.encoding!=='base64')throw new Error(`Unknown file encoding: ${file.path}`);
    if(typeof file.content!=='string')throw new Error(`Missing source content: ${file.path}`);
    const bytes = Buffer.from(file.content,file.encoding);
    if(sha256(bytes)!==file.sha256)throw new Error(`Source integrity check failed: ${file.path}`);
    for(const reference of file.references??[]) {
      if(!['module','asset'].includes(reference.kind)||!Number.isInteger(reference.start)||!Number.isInteger(reference.end)||reference.start<0||reference.end<reference.start||reference.end>file.content.length||file.content.slice(reference.start,reference.end)!==reference.value)throw new Error(`Invalid source reference: ${file.path}`);
    }
  }
  for(const [name,version] of Object.entries(bundle.dependencies)) {
    if(!/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(name)||typeof version!=='string'||!/^[~^]?\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i.test(version))throw new Error('Invalid registry package dependency.');
  }
  return bundle;
}
