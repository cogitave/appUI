'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CodeBlock } from '@/components/base/code-block/code-block';

const tokenPattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|<\/?[A-Za-z][\w.-]*|\b(?:const|let|return|import|from|export|function|true|false)\b|\b[A-Za-z][\w-]*(?==)|[{}=])/g;

function highlight(source: string) {
  const result: React.ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  for (const match of source.matchAll(tokenPattern)) {
    const start = match.index;
    if (start > cursor) result.push(source.slice(cursor, start));
    const value = match[0];
    const kind = value.startsWith('/*') || value.startsWith('//') ? 'comment'
      : value.startsWith('"') || value.startsWith("'") ? 'string'
      : value.startsWith('<') ? 'tag'
      : /^(const|let|return|import|from|export|function|true|false)$/.test(value) ? 'keyword'
      : /^[A-Za-z]/.test(value) ? 'attribute' : 'punctuation';
    result.push(<span className={`code-token code-token--${kind}`} key={`${start}-${index++}`}>{value}</span>);
    cursor = start + value.length;
  }
  if (cursor < source.length) result.push(source.slice(cursor));
  return result;
}

export function CodePreview({ source }: { source: string }) {
  const reducedMotion = useReducedMotion();
  const normalized = source.replaceAll('\\n', '\n');
  return <motion.div className="docs-code-panel" initial={reducedMotion ? false : { opacity: 0, y: 6, filter: 'blur(3px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={reducedMotion ? undefined : { opacity: 0, y: -4, filter: 'blur(2px)' }} transition={{ duration: reducedMotion ? 0 : .18, ease: [0.2, 0.75, 0.25, 1] }}>
    <CodeBlock code={normalized} label="Component source" showHeader={false} variant="plain" density="compact" maxHeight={326} renderLine={line => highlight(line || ' ')} />
  </motion.div>;
}
