import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadFoundations, loadItem, loadStyleCatalog, sha256 } from './registry.mjs';
import {assembleStyleFiles,mergeStyleRequirements} from './styles.mjs';

const groups = ['components','hooks','utils','config','styles','assets'];
const slash = name=>name.split(path.sep).join('/');
const exists = async name=>{try{await fs.access(name);return true;}catch{return false;}};
const readJSON = async name=>JSON.parse(await fs.readFile(name,'utf8'));

export async function defaultConfig(root) {
  const prefix = await exists(path.join(root,'src'))?'src/':'';
  return {schemaVersion:1,paths:{components:`${prefix}components/appui`,hooks:`${prefix}hooks/appui`,utils:`${prefix}utils/appui`,config:`${prefix}config/appui`,styles:`${prefix}styles/appui`,assets:'public/appui'},aliases:{components:'@/components/appui',hooks:'@/hooks/appui',utils:'@/utils/appui',config:'@/config/appui',styles:'@/styles/appui'},assetBaseURL:'/appui'};
}

export function validateConfig(config) {
  if(config.schemaVersion!==1)throw new Error('appui.json requires schemaVersion: 1.');
  for(const group of groups) {
    const destination = config.paths?.[group];
    if(typeof destination!=='string'||!destination||destination.includes('\\')||path.posix.isAbsolute(destination)||destination.split('/').some(part=>!part||part==='.'||part==='..')||destination.startsWith('.appui'))throw new Error(`Unsafe destination path for ${group}. Use a relative folder inside this project.`);
    if(group!=='assets') {
      const alias=config.aliases?.[group];
      if(typeof alias!=='string'||!alias||/[\s'"`\\]/.test(alias)||alias.startsWith('.')||alias.endsWith('/'))throw new Error(`Invalid import alias for ${group}.`);
    }
  }
  if(typeof config.assetBaseURL!=='string'||!config.assetBaseURL.startsWith('/')||config.assetBaseURL.startsWith('//')||/[\s'"`\\]/.test(config.assetBaseURL)||config.assetBaseURL.includes('..'))throw new Error('assetBaseURL must be a local absolute URL path.');
  return config;
}

export async function loadConfig(root) {
  const file=path.join(root,'appui.json');
  if(!await exists(file))throw new Error('No appui.json found. Run appui init in the destination application first.');
  return validateConfig(await readJSON(file));
}

export function destinationFor(source,config) {
  const [folder,...rest]=source.split('/');
  const group=folder==='public'?'assets':folder;
  if(!groups.includes(group))throw new Error(`Unknown registry source group: ${source}`);
  return `${config.paths[group]}/${rest.join('/')}`;
}

function moduleAlias(source,config) {
  const [group,...rest]=source.split('/');
  if(!config.aliases[group])throw new Error(`No alias configured for ${source}`);
  const suffix=rest.join('/').replace(/\.(tsx?|jsx?)$/,'');
  return `${config.aliases[group]}/${suffix}`;
}

export function transformSource(file,config) {
  if(file.encoding==='base64')return Buffer.from(file.content,'base64');
  let content=file.content;
  for(const reference of [...(file.references??[])].sort((a,b)=>b.start-a.start)) {
    const replacement=reference.kind==='asset'?`${config.assetBaseURL.replace(/\/$/,'')}/${reference.target.slice('public/'.length)}`:reference.value.startsWith('.')?reference.value:moduleAlias(reference.target,config);
    content=content.slice(0,reference.start)+replacement+content.slice(reference.end);
  }
  if(file.path==='styles/globals.css') {
    const relative=slash(path.relative(config.paths.styles,config.paths.components));
    content=content.replace('@import "tailwindcss";','@import "tailwindcss";\n'+`@source "${relative}";`);
  }
  return Buffer.from(content,'utf8');
}

/** Reject a symlink at every existing destination segment before planning writes. */
export async function safeDestination(root,relative) {
  const target=path.resolve(root,relative),base=path.resolve(root);
  if(target===base||!target.startsWith(base+path.sep))throw new Error(`Destination leaves the project: ${relative}`);
  let current=base;
  for(const segment of path.relative(base,target).split(path.sep)) {
    current=path.join(current,segment);
    try {if((await fs.lstat(current)).isSymbolicLink())throw new Error(`Destination uses a symlink: ${relative}`);}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return target;
}

export async function installedState(root) {
  const file=await safeDestination(root,'.appui/installed.json');
  if(!await exists(file))return {schemaVersion:1,components:[],files:{}};
  const state=await readJSON(file);
  if(state.schemaVersion!==1||!state.files||!Array.isArray(state.components))throw new Error('Unsupported .appui/installed.json state.');
  return state;
}

export async function planInstallation(root,names,{config,initialize=false,overwrite=false}={}) {
  const projectConfig=config??await loadConfig(root),state=await installedState(root);
  validateConfig(projectConfig);
  const bundles=[await loadFoundations(),...await Promise.all([...new Set(names)].map(loadItem))];
  const files=new Map(),dependencies={};
  for(const bundle of bundles) {
    Object.assign(dependencies,bundle.dependencies);
    for(const file of bundle.files) {
      const previous=files.get(file.path);
      if(previous&&previous.sha256!==file.sha256)throw new Error(`Registry dependency mismatch: ${file.path}`);
      files.set(file.path,file);
    }
  }
  // Include all previously installed controls' styles without replacing their
  // customized component source when adding a different entry.
  const previousBundles=await Promise.all(state.components.filter(name=>!names.includes(name)).map(loadItem));
  const styleFiles=assembleStyleFiles(await loadStyleCatalog(),mergeStyleRequirements([...bundles,...previousBundles]));
  for(const file of styleFiles)files.set(file.path,file);
  const changes=[];
  for(const file of files.values()) {
    const relative=destinationFor(file.path,projectConfig),target=await safeDestination(root,relative),bytes=transformSource(file,projectConfig),hash=sha256(bytes);
    const existing=await exists(target)?await fs.readFile(target):null;
    const currentHash=existing?sha256(existing):null;
    const managed=state.files[relative];
    const status=currentHash===hash?'unchanged':!existing?'create':managed?.installedSha256===currentHash?'update':overwrite?'overwrite':'conflict';
    changes.push({source:file.path,path:relative,target,bytes,sha256:hash,sourceSha256:file.sha256,status,previous:existing});
  }
  if(initialize) {
    const bytes=Buffer.from(JSON.stringify(projectConfig,null,2)+'\n'),target=await safeDestination(root,'appui.json');
    const existing=await exists(target)?await fs.readFile(target):null;
    if(!existing)changes.push({source:'appui.json',path:'appui.json',target,bytes,sha256:sha256(bytes),status:'create',previous:null});
  }
  const destinations=new Set();
  for(const change of changes) {
    if(destinations.has(change.path))throw new Error(`Configured paths collide: ${change.path}`);
    destinations.add(change.path);
  }
  const packageFile=path.join(root,'package.json');
  const manifest=await exists(packageFile)?await readJSON(packageFile):{};
  const installed={...manifest.devDependencies,...manifest.dependencies};
  const missingDependencies=Object.fromEntries(Object.entries(dependencies).filter(([name])=>!installed[name]));
  return {root,config:projectConfig,state,names:[...new Set(names)],changes,dependencies,missingDependencies,conflicts:changes.filter(change=>change.status==='conflict')};
}

async function atomicWrite(target,bytes) {
  await fs.mkdir(path.dirname(target),{recursive:true});
  const temporary=`${target}.appui-${process.pid}-${Math.random().toString(16).slice(2)}.tmp`;
  try {await fs.writeFile(temporary,bytes,{flag:'wx'});await fs.rename(temporary,target);}finally{await fs.rm(temporary,{force:true});}
}

export async function applyInstallation(plan,{dryRun=false}={}) {
  if(plan.conflicts.length)throw new Error(`Installation stopped before writing. Customized files conflict:\n${plan.conflicts.map(file=>`  ${file.path}`).join('\n')}\nReview with appui diff. Use --overwrite to back up and replace the listed files.`);
  if(dryRun)return {written:0,skipped:plan.changes.filter(change=>change.status==='unchanged').length};
  const rollback=[],backupStamp=new Date().toISOString().replaceAll(/[:.]/g,'-');
  try {
    for(const change of plan.changes.filter(change=>change.status!=='unchanged')) {
      await safeDestination(plan.root,change.path);
      // Confirm the file still matches the plan in case the project changed while planning.
      const current=await exists(change.target)?await fs.readFile(change.target):null;
      if((current&&sha256(current))!==(change.previous&&sha256(change.previous)))throw new Error(`File changed during installation: ${change.path}`);
      if(change.previous)await atomicWrite(await safeDestination(plan.root,`.appui/backups/${backupStamp}/${change.path}`),change.previous);
      await atomicWrite(change.target,change.bytes);rollback.push(change);
    }
    const state={schemaVersion:1,components:[...new Set([...plan.state.components,...plan.names])].sort(),files:{...plan.state.files}};
    for(const change of plan.changes.filter(change=>change.path!=='appui.json'))state.files[change.path]={source:change.source,sourceSha256:change.sourceSha256,installedSha256:change.sha256};
    await atomicWrite(await safeDestination(plan.root,'.appui/installed.json'),Buffer.from(JSON.stringify(state,null,2)+'\n'));
  }catch(error) {
    for(const change of rollback.reverse()) {if(change.previous)await atomicWrite(change.target,change.previous);else await fs.rm(change.target,{force:true});}
    throw error;
  }
  return {written:rollback.length,skipped:plan.changes.filter(change=>change.status==='unchanged').length};
}

export function installDependencies(root,dependencies,manager='npm',{json=false}={}) {
  if(!['npm','pnpm','yarn','bun'].includes(manager))throw new Error('Choose npm, pnpm, yarn or bun as the package manager.');
  const packages=Object.entries(dependencies).map(([name,version])=>`${name}@${version}`);
  if(!packages.length)return;
  const args=[manager==='npm'?'install':'add',...packages];
  const result=spawnSync(manager,args,{cwd:root,stdio:json?['inherit','pipe','inherit']:'inherit',shell:false});
  if(json&&result.stdout)process.stderr.write(result.stdout);
  if(result.error||result.status!==0)throw new Error(`Dependency installation failed. Source files are installed; rerun ${manager} ${args.join(' ')}.`);
}

export async function doctor(root) {
  const config=await loadConfig(root),state=await installedState(root),manifest=await readJSON(path.join(root,'package.json'));
  const issues=[],checks=[];
  const dependencies={...manifest.devDependencies,...manifest.dependencies};
  const react=dependencies.react;
  if(!react||!/(^|[^0-9])19[.x]/.test(react))issues.push('Use React 19 and React DOM 19.');else checks.push(`React ${react}`);
  if(!dependencies['react-dom']||!/(^|[^0-9])19[.x]/.test(dependencies['react-dom']))issues.push('Use React DOM 19.');
  if(!dependencies.tailwindcss||!/(^|[^0-9])4[.x]/.test(dependencies.tailwindcss))issues.push('Use Tailwind CSS 4.');else checks.push(`Tailwind CSS ${dependencies.tailwindcss}`);
  for(const [relative,record] of Object.entries(state.files)) {
    const target=await safeDestination(root,relative);
    if(!await exists(target))issues.push(`Installed file is missing: ${relative}`);
    else if(sha256(await fs.readFile(target))!==record.installedSha256)checks.push(`Customized: ${relative}`);
  }
  checks.push(`${state.components.length} installed components`,`${Object.keys(state.files).length} managed source/style files`);
  return {config,checks,issues};
}
