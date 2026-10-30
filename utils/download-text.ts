/** Start a local browser download from a captured text value. */
export function downloadText(content:string,filename:string,type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([content],{type}));
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=filename;
  anchor.hidden=true;
  document.body.append(anchor);
  try { anchor.click(); }
  finally { anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000); }
}
