import {sha256,validateBundle} from './registry.mjs';

export function mergeStyleRequirements(bundles) {
 const classes=new Set(),prefixes=new Set();
 for(const bundle of bundles){for(const name of bundle.styleRequirements?.classes??[])classes.add(name);for(const name of bundle.styleRequirements?.prefixes??[])prefixes.add(name);}
 return {classes:[...classes].sort(),prefixes:[...prefixes].sort()};
}

/** Select whole rules in their original order and shift recorded URL positions. */
export function compileStylesheet(blocks,requirements) {
 const classes=new Set(requirements.classes),prefixes=requirements.prefixes;
 function join(parts,header='',footer='') {
  let content=header,hasRules=false;const references=[];
  for(const part of parts){if(!part.content)continue;if(content!==header)content+='\n';const shift=content.length;content+=part.content;hasRules||=part.hasRules;for(const reference of part.references)references.push({...reference,start:reference.start+shift,end:reference.end+shift});}
  content+=footer;return {content,references,hasRules};
 }
 function select(block){
  if(block.type==='group') {
   const child=join(block.children.map(select));
   if(!child.hasRules)return {content:'',references:[],hasRules:false};
   return join([child],`@${block.name}${block.params?' '+block.params:''} {\n`,'\n}');
  }
  if(block.type==='rule'&&block.classes.length&&!block.classes.some(name=>classes.has(name)||prefixes.some(prefix=>name.startsWith(prefix))))return {content:'',references:[],hasRules:false};
  return {content:block.css,references:block.references??[],hasRules:block.type!=='comment'};
 }
 const result=join(blocks.map(select));
 if(!result.hasRules)return {content:'',references:[]};
 return {content:result.content+'\n',references:result.references};
}

export function assembleStyleFiles(catalog,requirements) {
 const files=[],imports=[],assets=new Set();
 for(const stylesheet of catalog.stylesheets){
  const source=compileStylesheet(stylesheet.blocks,requirements);if(!source.content)continue;
  for(const reference of source.references)assets.add(reference.target);
  files.push({path:stylesheet.path,encoding:'utf8',...source,sha256:sha256(source.content)});
  imports.push(`@import "./${stylesheet.path.slice('styles/'.length)}";`);
 }
 const content=[catalog.global.before,...imports,catalog.global.after].join('\n');
 files.push({path:'styles/globals.css',encoding:'utf8',content,sha256:sha256(content)});
 const assetFiles=new Map(catalog.assets.map(file=>[file.path,file]));
 for(const name of assets){const file=assetFiles.get(name);if(!file)throw new Error(`Missing style asset: ${name}`);files.push(file);}
 return validateBundle({files,dependencies:{}}).files;
}
