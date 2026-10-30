import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/** Build-only evaluation of the project's own static documentation metadata. */
export function readDocMetadata(root) {
  const allowed=path.join(root,'components/application/docs'),cache=new Map();
  function load(file) {
    file=path.resolve(file);
    if(!file.startsWith(allowed+path.sep))throw new Error(`Documentation metadata import leaves its directory: ${file}`);
    if(cache.has(file))return cache.get(file).exports;
    const module={exports:{}};cache.set(file,module);
    if(file.endsWith('.json')){module.exports=JSON.parse(fs.readFileSync(file,'utf8'));return module.exports;}
    const content=fs.readFileSync(file,'utf8');
    const compiled=ts.transpileModule(content,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
    const requireLocal=specifier=>{
      if(!specifier.startsWith('.'))throw new Error(`Unsupported metadata dependency: ${specifier}`);
      const base=path.resolve(path.dirname(file),specifier);
      for(const suffix of ['', '.ts','.json'])if(fs.existsSync(base+suffix)&&fs.statSync(base+suffix).isFile())return load(base+suffix);
      throw new Error(`Missing metadata module: ${specifier}`);
    };
    new Function('require','module','exports',compiled.outputText)(requireLocal,module,module.exports);
    return module.exports;
  }
  return load(path.join(allowed,'docs-data.ts')).docsPages;
}
