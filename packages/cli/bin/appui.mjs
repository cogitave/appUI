#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs/promises';
import { loadIndex, loadItem } from '../src/registry.mjs';
import { defaultConfig, loadConfig, planInstallation, applyInstallation, installDependencies, doctor } from '../src/project.mjs';

const help=`appUI local source installer

  appui init                     Add appui.json and shared styles/theme foundations
  appui add button select        Install components and their source dependencies
  appui list [search]            Browse available components, blocks and charts
  appui info button              Show source entries, exports and dependencies
  appui diff button              Preview changed/customized source files
  appui doctor                   Check the destination and managed source
  appui mcp                      Start the read-only local MCP server over stdio
  appui skill                    Install the appUI skill inside the selected project

  --cwd <directory>              Destination application or workspace package
  --dry-run                      Show the plan without writing
  --overwrite                    Back up and replace conflicting files
  --install                      Install missing npm dependencies after writing
  --package-manager npm|pnpm|yarn|bun
  --json                         Return structured read-only results
  --client agents|codex|claude    Project skill convention (default: agents)
  --path <folder>                Custom project-relative skill destination

The local release is not published to npm. Templates are not activated by this CLI.
`;

function parse(args) {
  const result={positional:[],options:{}};
  const values=new Set(['cwd','package-manager','client','path']);
  const flags=new Set(['dry-run','overwrite','install','json','help','version']);
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='-h'){result.options.help=true;continue;}
    if(!arg.startsWith('--')){result.positional.push(arg);continue;}
    const [name,...inline]=arg.slice(2).split('=');
    if(values.has(name)) {
      const value=inline.length?inline.join('='):args[++i];
      if(!value||value.startsWith('--'))throw new Error(`Missing value for --${name}`);
      result.options[name]=value;
    }else if(flags.has(name)&&!inline.length)result.options[name]=true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return result;
}

function planSummary(plan) {
  return {components:plan.names,files:plan.changes.map(({source,path,status})=>({source,path,status})),dependencies:plan.missingDependencies,conflicts:plan.conflicts.map(file=>file.path),stylesheet:`${plan.config.aliases.styles}/globals.css`};
}

async function main() {
  const {positional,options}=parse(process.argv.slice(2));
  if(options.version){console.log('appUI 0.1.0 (local)');return;}
  const [command,...names]=positional;
  if(!command||options.help){console.log(help);return;}
  const root=path.resolve(options.cwd??process.cwd());
  if(command==='mcp') {const {startMCP}=await import('../src/mcp.mjs');await startMCP({cwd:root});return;}
  if(command==='skill') {
    const {planSkill}=await import('../src/instructions.mjs');
    const plan=await planSkill(root,{client:options.client,destination:options.path,overwrite:!!options.overwrite});
    const summary={folder:plan.folder,files:plan.changes.map(({path,status})=>({path,status})),conflicts:plan.conflicts.map(file=>file.path)};
    if(options.json)console.log(JSON.stringify(summary,null,2));else console.log(summary.files.map(file=>`${file.status.padEnd(10)} ${file.path}`).join('\n'));
    const applied=await applyInstallation(plan,{dryRun:!!options['dry-run']});
    if(!options.json)console.log(options['dry-run']?'Dry run: no files changed.':`Installed ${applied.written} skill files. Start a new client session to discover the skill.`);
    return;
  }
  if(command==='list') {
    const index=await loadIndex(),search=names.join(' ').toLowerCase(),items=index.items.filter(item=>`${item.name} ${item.title} ${item.group}`.toLowerCase().includes(search));
    if(options.json)console.log(JSON.stringify(items,null,2));else console.log(items.map(item=>`${item.name.padEnd(27)} ${item.group}`).join('\n'));
    return;
  }
  if(command==='info') {
    if(names.length!==1)throw new Error('Use appui info <component>.');
    const {name,title,description,group,entryFiles,exports,example,sections,dependencies,files}=await loadItem(names[0]);
    console.log(JSON.stringify({name,title,description,group,entryFiles,exports,example,sections,dependencies,files:files.map(({path,sha256})=>({path,sha256}))},null,2));return;
  }
  if(command==='doctor') {
    const result=await doctor(root);
    if(options.json)console.log(JSON.stringify(result,null,2));else console.log([...result.checks.map(check=>`OK  ${check}`),...result.issues.map(issue=>`FIX ${issue}`),`Stylesheet: ${result.config.aliases.styles}/globals.css`,'Map the aliases in appui.json in TypeScript and your bundler; load Inter and JetBrains Mono.'].join('\n'));
    if(result.issues.length)process.exitCode=1;return;
  }
  if(!['init','add','diff'].includes(command))throw new Error(`Unknown command: ${command}. Run appui --help.`);
  if(command!=='init'&&!names.length)throw new Error(`Use appui ${command} <component...>.`);
  await fs.access(path.join(root,'package.json'));
  let config;
  if(command==='init') {
    let initialized=true;
    try {await fs.access(path.join(root,'appui.json'));}catch(error){if(error.code!=='ENOENT')throw error;initialized=false;}
    config=initialized?await loadConfig(root):await defaultConfig(root);
  }else config=await loadConfig(root);
  const plan=await planInstallation(root,names,{config,initialize:command==='init',overwrite:!!options.overwrite});
  const summary=planSummary(plan);
  if(options.json)console.log(JSON.stringify(summary,null,2));else {
    console.log(plan.changes.map(file=>`${file.status.padEnd(10)} ${file.path}`).join('\n'));
    console.log(`\nImport once: ${summary.stylesheet}`);
    if(Object.keys(plan.missingDependencies).length)console.log(`Dependencies: ${Object.entries(plan.missingDependencies).map(([name,version])=>`${name}@${version}`).join(' ')}`);
  }
  if(command==='diff'){if(plan.conflicts.length)process.exitCode=1;return;}
  const result=await applyInstallation(plan,{dryRun:!!options['dry-run']});
  if(!options.json)console.log(options['dry-run']?'Dry run: no files changed.':`Installed ${result.written} files; ${result.skipped} identical files kept.`);
  if(options.install&&!options['dry-run'])installDependencies(root,plan.missingDependencies,options['package-manager']??'npm',{json:!!options.json});
  else if(!options['dry-run']&&Object.keys(plan.missingDependencies).length&&!options.json)console.log('Use --install to install the missing packages, or add them with your package manager.');
}

main().catch(error=>{console.error(`appUI: ${error.message}`);process.exitCode=1;});
