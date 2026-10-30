import fs from 'node:fs/promises';
import path from 'node:path';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
import {loadIndex,loadItem,loadFoundations,loadStyleCatalog} from './registry.mjs';
import {assembleStyleFiles,mergeStyleRequirements} from './styles.mjs';
import {defaultConfig,loadConfig,planInstallation,transformSource,doctor} from './project.mjs';

const readOnly={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};
const skillURL=new URL('../skill/appui/SKILL.md',import.meta.url);
const ruleSections={overview:skillURL,components:new URL('../skill/appui/references/components.md',import.meta.url),theming:new URL('../skill/appui/references/theming.md',import.meta.url),patterns:new URL('../skill/appui/references/patterns.md',import.meta.url),motion:new URL('../skill/appui/references/motion.md',import.meta.url)};
const readRules=section=>fs.readFile(ruleSections[section],'utf8');
const result=value=>({content:[{type:'text',text:typeof value==='string'?value:JSON.stringify(value,null,2)}]});
const safeTool=callback=>async args=>{try{return result(await callback(args));}catch(error){return {...result(error.message),isError:true};}};
const moduleImport=(source,config)=>{
 const[group,...rest]=source.split('/');
 return `${config.aliases[group]}/${rest.join('/').replace(/\.tsx?$/,'')}`;
};

async function projectConfig(root) {
 try {await fs.access(path.join(root,'appui.json'));}catch(error){if(error.code==='ENOENT')return defaultConfig(root);throw error;}
 return loadConfig(root);
}

export async function createAppUIServer({cwd=process.cwd()}={}) {
 const root=path.resolve(cwd),index=await loadIndex();
 const server=new McpServer({name:'appUI',version:index.version},{instructions:'Use the appUI catalog and existing source. Tools are read-only. Installation plans do not write files; use the local CLI for installation. Preserve shared typography, motion and established artwork.'});
 const register=(name,title,description,inputSchema,callback)=>server.registerTool(name,{title,description,inputSchema,annotations:readOnly},safeTool(callback));

 register('get_started','appUI setup','Read local release setup, stack and source ownership.',{},async()=>({release:'local',published:false,version:index.version,stack:['React 19','TypeScript','Tailwind CSS 4','React Aria','Motion','Remix Icon'],componentCount:index.items.length,commands:{list:'appui list',initialize:'appui init --dry-run',install:'appui init --install\nappui add button select --install',review:'appui diff button',health:'appui doctor',skill:'appui skill'},source:'Install the local tarball or run packages/cli/bin/appui.mjs from the checkout.',templates:'Template source and activation are not distributed in the local release.',designRules:'Read appui://design-rules or call get_design_rules.'}));

 register('list_components','Find appUI components','Search exact names, descriptions and groups, with bounded pagination.',{query:z.string().max(200).optional(),group:z.enum(['Base','Blocks','Charts']).optional(),offset:z.number().int().min(0).default(0),limit:z.number().int().min(1).max(100).default(30)},async({query='',group,offset,limit})=>{
  const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const items=index.items.filter(item=>{
   const family=(index.families??[]).find(family=>family.members.some(member=>member.slug===item.name));
   const member=family?.members.find(member=>member.slug===item.name);
   return (!group||item.group===group)&&terms.every(term=>`${item.name} ${item.title} ${item.description} ${family?.label??''} ${member?.label??''} ${member?.value??''}`.toLowerCase().includes(term));
  });
  const families=(index.families??[]).filter(family=>family.members.some(member=>items.some(item=>item.name===member.slug)));
  return {total:items.length,offset,limit,families,items:items.slice(offset,offset+limit).map(({name,title,description,group,type,dependencies})=>({name,title,description,group,type,dependencies}))};
 });

 register('get_component','Read appUI source','Read a component entry, props and complete source closure using the destination aliases. Binary artwork is described without embedding it.',{name:z.string().min(1).max(80),includeSource:z.boolean().default(true)},async({name,includeSource})=>{
  const item=await loadItem(name),config=await projectConfig(root);
  const foundations=await loadFoundations(),styles=assembleStyleFiles(await loadStyleCatalog(),mergeStyleRequirements([foundations,item]));
  return {name:item.name,title:item.title,description:item.description,entryFiles:item.entryFiles,exports:item.exports.map(entry=>({...entry,importPath:moduleImport(entry.path,config)})),dependencies:{...foundations.dependencies,...item.dependencies},files:[...item.files,...styles].map(file=>({path:file.path,sha256:file.sha256,encoding:file.encoding,...(includeSource&&file.encoding==='utf8'?{content:transformSource(file,config).toString('utf8')}:{} )})),stylesheet:`${config.aliases.styles}/globals.css`};
 });

 register('get_usage_examples','Read usage examples','Read the maintained documentation recipe and entry imports. The consuming application defines its sample data and event handlers.',{name:z.string().min(1).max(80)},async({name})=>{
  const item=await loadItem(name),config=await projectConfig(root),used=new Set([...item.example.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map(match=>match[1]));
  const imports=item.exports.flatMap(entry=>{const names=entry.names.filter(name=>used.has(name));return names.length?[`import { ${names.join(', ')} } from '${moduleImport(entry.path,config)}';`]:[];});
  const icons=[...new Set([...item.example.matchAll(/\bRi[A-Z][A-Za-z0-9]+\b/g)].map(match=>match[0]))];
  if(icons.length)imports.push(`import { ${icons.join(', ')} } from '@remixicon/react';`);
  return {name:item.name,description:item.description,sections:item.sections,imports,code:item.example,note:'Define the example data, handlers and any additional composed components in your application. Use get_component to inspect the public props.'};
 });

 register('get_theme','Read design foundations','Read semantic color and complete typography source, or the available accent names.',{section:z.enum(['semantic','typography','accents','all']).default('all')},async({section})=>{
  const foundations=await loadFoundations(),files=[...foundations.files,...assembleStyleFiles(await loadStyleCatalog(),mergeStyleRequirements([foundations]))];
  const find=name=>files.find(file=>file.path===name)?.content;
  const output={};
  if(section==='semantic'||section==='all')output.semantic=find('styles/theme.css');
  if(section==='typography'||section==='all')output.typography=find('styles/typography.css');
  if(section==='accents'||section==='all'){output.appearance=find('config/appearance.ts');output.accentStyles=find('styles/accent-palettes.css');}
  return output;
 });

 register('get_design_rules','Read appUI design rules','Read the overview or a focused component, theme, composition or motion reference. All sections are available without installing the skill.',{section:z.enum(['overview','components','theming','patterns','motion','all']).default('overview')},async({section})=>section==='all'?Object.fromEntries(await Promise.all(Object.keys(ruleSections).map(async name=>[name,await readRules(name)]))):readRules(section));

 register('plan_installation','Review source installation','Plan source and dependency changes in the server-bound destination. Does not write files or install packages.',{names:z.array(z.string().min(1).max(80)).max(30).default([]),initialize:z.boolean().default(false)},async({names,initialize})=>{
  const config=initialize?await projectConfig(root):await loadConfig(root);
  const plan=await planInstallation(root,names,{config,initialize});
  return {components:plan.names,files:plan.changes.map(({path,status})=>({path,status})),conflicts:plan.conflicts.map(file=>file.path),missingDependencies:plan.missingDependencies,stylesheet:`${config.aliases.styles}/globals.css`,command:{executable:'appui',args:[initialize?'init':'add',...(initialize?[]:names),'--cwd',root,'--install']},writesPerformed:false};
 });

 register('get_project_status','Check installed source','Read the server-bound project configuration and managed-source health.',{},async()=>doctor(root));

 server.registerResource('catalog','appui://catalog',{title:'appUI component catalog',description:'Exact local release component names and source entries.',mimeType:'application/json'},async uri=>({contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(index,null,2)}]}));
 server.registerResource('design-rules','appui://design-rules',{title:'appUI design rules',description:'Composition, typography, motion and verification workflow.',mimeType:'text/markdown'},async uri=>({contents:[{uri:uri.href,mimeType:'text/markdown',text:await readRules('overview')}]}));
 for(const section of ['components','theming','patterns','motion'])server.registerResource(`design-rules-${section}`,`appui://design-rules/${section}`,{title:`appUI ${section} reference`,description:`Complete ${section} guidance from the distributable skill.`,mimeType:'text/markdown'},async uri=>({contents:[{uri:uri.href,mimeType:'text/markdown',text:await readRules(section)}]}));
 server.registerPrompt('compose_screen',{title:'Compose an appUI screen',description:'Choose appUI components and verify the composed product states.',argsSchema:{goal:z.string().min(1).max(4000)}},async({goal})=>({messages:[{role:'user',content:{type:'text',text:`Build this screen with appUI: ${goal}\n\nInspect the destination configuration, search the catalog and read the relevant source/examples. Compose existing base controls and blocks using the semantic colors and complete type roles. Preserve the established artwork. Verify keyboard/focus, both appearances, narrow/short layouts, intermediate motion and reduced motion. Review the installation plan before using the local CLI.`}}]}));
 return server;
}

export async function startMCP(options) {
 const server=await createAppUIServer(options);
 await server.connect(new StdioServerTransport());
 return server;
}
