import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './registry.mjs';
import {safeDestination,installedState} from './project.mjs';

export const skillDirectory=fileURLToPath(new URL('../skill/appui/',import.meta.url));
async function filesIn(folder,prefix='') {
 const result=[];
 for(const entry of await fs.readdir(folder,{withFileTypes:true})) {
  const name=prefix+entry.name;
  if(entry.isDirectory())result.push(...await filesIn(path.join(folder,entry.name),name+'/'));
  else if(entry.isFile())result.push(name);
 }
 return result;
}

export async function planSkill(root,{client='agents',destination,overwrite=false}={}) {
 if(!['agents','codex','claude'].includes(client))throw new Error('Skill client must be agents, codex or claude. Use --path for a custom client folder.');
 const folder=destination??`${client==='claude'?'.claude':'.agents'}/skills/appui`;
 await safeDestination(root,folder);
 const state=await installedState(root),changes=[];
 for(const name of await filesIn(skillDirectory)) {
  const relative=`${folder}/${name}`,target=await safeDestination(root,relative),bytes=await fs.readFile(path.join(skillDirectory,name)),hash=sha256(bytes);
  let previous=null;try{previous=await fs.readFile(target);}catch(error){if(error.code!=='ENOENT')throw error;}
  const currentHash=previous?sha256(previous):null;
  const status=currentHash===hash?'unchanged':!previous?'create':state.files[relative]?.installedSha256===currentHash?'update':overwrite?'overwrite':'conflict';
  changes.push({source:`skill/appui/${name}`,path:relative,target,bytes,sha256:hash,sourceSha256:hash,status,previous});
 }
 return {root,state,names:[],changes,conflicts:changes.filter(file=>file.status==='conflict'),folder};
}
