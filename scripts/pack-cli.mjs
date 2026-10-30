import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=path.join(root,'artifacts/distribution');
await fs.mkdir(destination,{recursive:true});
for(const [command,args] of [[process.execPath,['scripts/build-registry.mjs']],['npm',['pack','./packages/cli','--pack-destination',destination]]]) {
  const result=spawnSync(command,args,{cwd:root,stdio:'inherit',shell:false});
  if(result.error||result.status!==0)process.exit(result.status||1);
}
