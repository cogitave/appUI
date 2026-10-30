'use client';

import { useState } from 'react';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { DocExampleSection as Section } from './doc-example-section';

const examples = [
  {value:'npm',label:'npm',code:'npm install react-aria-components motion @remixicon/react',language:'Shell'},
  {value:'pnpm',label:'pnpm',code:'pnpm add react-aria-components motion @remixicon/react\n\n# Start the workspace\npnpm dev',language:'Shell'},
  {value:'yarn',label:'yarn',code:'yarn add react-aria-components motion @remixicon/react\nyarn dev',language:'Shell'},
];
const themeCode = ':root {\n  --surface-base: #ffffff;\n  --text-strong: #17191f;\n}\n\n.dark {\n  --surface-base: #1c2026;\n  --text-strong: #f6f7f8;\n}';
const wideCode = '// The same source stays available when long lines wrap.\nconst workspace = { name: "Studio workspace", description: "A shared place to plan, build, review and publish useful interfaces without losing the thread." };\n\nexport function openWorkspace() {\n  return workspace;\n}';
const longCode = Array.from({length:80},(_,index)=>`const task${String(index+1).padStart(2,'0')} = { title: "Workspace task ${index+1}", complete: false };`).join('\n');
export function CodeBlockPreview() {
  const [format,setFormat] = useState('npm'),[notice,setNotice] = useState('');
  return <div className="docs-code-demo" data-demo="code-main"><CodeBlock examples={examples} label="Install dependencies" value={format} onValueChange={setFormat} onCopy={setNotice}/>{notice && <p role="status" className="docs-extended-note">{notice}</p>}</div>;
}
function Lines() {
  const [wrap,setWrap] = useState('wrap');
  return <div className="docs-code-demo" data-demo="code-lines"><SegmentedControl aria-label="Code wrapping" value={wrap} onValueChange={setWrap} options={[{value:'wrap',label:'Wrap'},{value:'scroll',label:'Scroll'}]}/><CodeBlock code={wideCode} label="workspace.ts" language="TypeScript" lineNumbers startLine={24} highlightedLines={[25]} wrap={wrap==='wrap'} maxHeight={260}/></div>;
}
function Surfaces() {
  const [density,setDensity] = useState('normal'),[variant,setVariant] = useState('soft');
  return <div className="docs-code-demo" data-demo="code-surfaces"><div className="docs-code-options"><SegmentedControl aria-label="Code density" value={density} onValueChange={setDensity} options={[{value:'normal',label:'Normal'},{value:'compact',label:'Compact'}]}/><SegmentedControl aria-label="Code surface" value={variant} onValueChange={setVariant} options={[{value:'soft',label:'Soft'},{value:'bordered',label:'Bordered'},{value:'plain',label:'Plain'}]}/></div><CodeBlock label="theme.css" code={themeCode} language="CSS" lineNumbers wrap density={density as 'normal'|'compact'} variant={variant as 'soft'|'bordered'|'plain'}/></div>;
}
export function CodeBlockExamples() { return <>
  <Section title="Lines and wrapping" description="Line numbers stay outside the accessible code text. Highlighted line numbers refer to the displayed start line; wrapping preserves the exact clipboard source."><Lines/></Section>
  <Section title="Long code" description="A bounded code viewport keeps native wheel, touch and keyboard scrolling with directional controls."><div className="docs-code-demo" data-demo="code-long"><CodeBlock label="tasks.ts" language="TypeScript" code={longCode} lineNumbers maxHeight={240}/></div></Section>
  <Section title="Surfaces and density" description="Regular code uses the shared monospace family at 14/400/20. Compact panels retain a readable 12/400/20 code role."><Surfaces/></Section>
  <Section title="Empty and disabled" description="Copy is unavailable for an empty source or when disabled. Code remains readable and selectable."><div className="docs-code-demo" data-demo="code-empty"><CodeBlock code="" label="Empty file"/><CodeBlock code="npm run build" label="Read only command" disabled/></div></Section>
</>; }
