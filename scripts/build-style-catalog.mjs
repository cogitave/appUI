import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import valueParser from 'postcss-value-parser';

/** URL positions are relative to the serialized leaf, so selection can shift them. */
export function stylesheetAssetReferences(content) {
  const references=[];
  postcss.parse(content).walkDecls(declaration=>{
    const rawValue=declaration.raws.value?.raw??declaration.value;
    const valueOffset=declaration.source.start.offset+declaration.prop.length+declaration.raws.between.length;
    valueParser(rawValue).walk(node=>{
      if(node.type!=='function'||node.value.toLowerCase()!=='url')return;
      const argument=node.nodes.find(child=>child.type==='word'||child.type==='string');
      if(!argument||!argument.value.startsWith('/')||argument.value.startsWith('//'))return false;
      const start=valueOffset+argument.sourceIndex+(argument.type==='string'?1:0),end=start+argument.value.length;
      if(content.slice(start,end)!==argument.value)throw new Error('Stylesheet asset position mismatch.');
      references.push({kind:'asset',value:argument.value,target:`public${argument.value}`,start,end});
      return false;
    });
  });
  return references;
}

/** Serialize the project's own stylesheet tree without changing rule order. */
export function describeStylesheet(content) {
  const tree=postcss.parse(content);
  const leaf=(node,props)=>{const css=node.toString()+((node.type==='atrule'&&!node.nodes)||node.type==='decl'?';':'');return {...props,css,references:stylesheetAssetReferences(css)};};
  function describe(node) {
    if(node.type==='rule') {
      const classes=new Set();
      selectorParser(selectors=>selectors.walkClasses(token=>{if(token.value.startsWith('ui-'))classes.add(token.value);})).processSync(node.selector);
      // Keep the complete rule, including nested selectors/declarations. A match
      // is deliberately conservative for optional composed descendants.
      return leaf(node,{type:'rule',classes:[...classes].sort()});
    }
    if(node.type==='atrule'&&node.nodes&&['media','supports','container','layer','scope','starting-style'].includes(node.name)) {
      return {type:'group',name:node.name,params:node.params,children:node.nodes.map(describe)};
    }
    // Keyframes, custom properties, comments and unknown future constructs stay
    // whole. Never infer animation names or variable dependencies from a regex.
    return leaf(node,{type:node.type==='comment'?'comment':'always'});
  }
  return tree.nodes.map(describe);
}

export function sourceStyleRequirements(syntax,ts) {
  const classes=new Set(),prefixes=new Set();
  function record(text,dynamic=false) {
    for(const match of text.matchAll(/\bui-[A-Za-z0-9_-]+/g)) {
      const name=match[0];classes.add(name);
      if(dynamic&&match.index+name.length===text.length)prefixes.add(name);
    }
  }
  function visit(node) {
    if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))record(node.text);
    if(ts.isTemplateExpression(node)){record(node.head.text,true);for(const span of node.templateSpans)record(span.literal.text,span.literal.kind===ts.SyntaxKind.TemplateMiddle);}
    ts.forEachChild(node,visit);
  }
  visit(syntax);
  return {classes:[...classes].sort(),prefixes:[...prefixes].sort()};
}
