'use client';

import Link from 'next/link';
import { RiClaudeLine, RiCodeSSlashLine, RiCursorAiFill, RiFileCopyLine, RiOpenaiLine, RiTerminalBoxLine } from '@remixicon/react';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { Button } from '@/components/base/buttons/button';
import { LinkButton } from '@/components/base/buttons/link-button';
import { Table, TableHeader, Column, TableBody, Row, Cell } from '@/components/base/table/table';
import { InstallCommand } from '@/components/installation/install-command';
import { product } from '@/config/product';
import { GuideCode, GuideReleaseNote, GuideSection, GuideTabs, cliCommand } from './guide-parts';

const toolPlan = [
  ['get_started', 'Read the local release setup and stack.'],
  ['list_components', 'Find exact component names, groups and dependencies.'],
  ['get_component', 'Read component props and editable source.'],
  ['get_usage_examples', 'Read examples from the component documentation.'],
  ['plan_installation', 'Review source and dependency changes without writes.'],
  ['get_project_status', 'Check the server-bound destination and managed source.'],
  ['get_theme', 'Inspect semantic colors and complete typography roles.'],
  ['get_design_rules', 'Read the maintained composition and motion guidance.'],
];
const prompts = [
  'Build a sign-in screen with the auth card and social buttons.',
  'Compose a sales dashboard from stat cards, an area chart and a data table.',
  'Add a project board with shared search, menus and notifications.',
  'Show the Button props and compose an action with a leading icon.',
  'Use the shared color tokens and typography roles for this settings screen.',
  'Check this page at desktop, tablet and mobile widths in both themes.',
];

export function McpGuide({ onNotify }: { onNotify: (message: string) => void }) {
  const name = product.integrations.name;
  const launch = { command: 'node', args: ['/absolute/path/to/appUI/packages/cli/bin/appui.mjs', 'mcp', '--cwd', '/absolute/path/to/your-app'] };
  const launchCommand = 'node /absolute/path/to/appUI/packages/cli/bin/appui.mjs mcp --cwd /absolute/path/to/your-app';
  async function copyPrompt(prompt: string) {
    try { await navigator.clipboard.writeText(prompt); onNotify('Agent prompt copied.'); }
    catch { onNotify('Could not copy the prompt.'); }
  }
  return <>
    <div className="docs-guide__preamble"><GuideReleaseNote feature="MCP" />
    <p className="docs-guide__intro-link docs-guide__intro-link--lead">The local server connects your coding assistant to the component source, examples and design foundations over standard input and output. Its tools are read-only; the CLI applies reviewed installation plans.</p></div>
    <GuideSection title="Setup">
      <p>Install the checkout dependencies and build its registry first. Replace the absolute paths below with your checkout and destination application. A locally installed tarball can use its node_modules/appui/bin/appui.mjs entry instead.</p>
      <GuideCode code="npm install\nnpm install --prefix packages/cli\nnpm run registry:build" onNotify={onNotify}/>
      <GuideTabs label="MCP client" options={[
        { id: 'claude', label: 'Claude Code', icon: <RiClaudeLine aria-hidden />, content: <><p>Register the local command from your project directory.</p><GuideCode code={`claude mcp add --transport stdio ${name} -- ${launchCommand}`} onNotify={onNotify}/></> },
        { id: 'cursor', label: 'Cursor', icon: <RiCursorAiFill aria-hidden />, content: <><p>Merge this server entry into your project’s MCP configuration. Keep any other configured servers.</p><GuideCode label=".cursor/mcp.json" code={JSON.stringify({mcpServers:{[name]:launch}},null,2)} onNotify={onNotify}/></> },
        { id: 'vscode', label: 'VS Code', icon: <RiCodeSSlashLine aria-hidden />, content: <><p>Add a local stdio server to your workspace MCP configuration, then start it from the editor.</p><GuideCode label=".vscode/mcp.json" code={JSON.stringify({servers:{[name]:{type:'stdio',...launch}}},null,2)} onNotify={onNotify}/></> },
        { id: 'codex', label: 'Codex', icon: <RiOpenaiLine aria-hidden />, content: <><p>Register the local command and check it with codex mcp list.</p><CodeBlock label="Codex MCP setup" onCopy={onNotify} examples={[{value:"command",label:"terminal",code:`codex mcp add ${name} -- ${launchCommand}\ncodex mcp list`},{value:"config",label:"config.toml",code:`[mcp_servers.${JSON.stringify(name)}]\ncommand = "node"\nargs = ${JSON.stringify(launch.args)}`}]} /></> },
        { id: 'other', label: 'Other clients', icon: <RiTerminalBoxLine aria-hidden />, content: <><p>Use your client’s stdio configuration with Node and the entry/action as separate arguments.</p><GuideCode label="MCP configuration" code={JSON.stringify({mcpServers:{[name]:launch}},null,2)} onNotify={onNotify}/></> },
      ]} />
    </GuideSection>
    <GuideSection title="Monorepos and custom aliases">
      <p>Bind --cwd to the destination UI package. Source queries, examples and installation plans use its <code>{product.integrations.configFile}</code> paths and aliases.</p>
      <p>Keep full-page templates in their consuming application. Its routes, public assets and global stylesheet belong together.</p>
      <LinkButton as={Link} href="/installation#monorepos-and-custom-aliases">Configure a shared UI package</LinkButton>
    </GuideSection>
    <GuideSection title="Try asking your agent">
      <p>Ask your connected assistant to discover the relevant components, read their examples and compose the screen. The server also provides a compose_screen prompt.</p>
      <ul className="docs-guide__prompts">{prompts.map(prompt => <li key={prompt}><p>{prompt}</p><Button variant="ghost" size="small" leadingIcon={RiFileCopyLine} aria-label={`Copy prompt: ${prompt}`} onClick={() => copyPrompt(prompt)}>Copy</Button></li>)}</ul>
    </GuideSection>
    <GuideSection title="Tools">
      <p>These tools are available in the local release. They read the packaged registry and the bound project; plan_installation performs no writes. Resources include the catalog, design-rule overview, and complete component, theme, composition and motion references. Call get_design_rules with a section, or with “all” to read them together.</p>
      <div className="docs-guide__table"><Table aria-label="Available MCP tools" size="sm"><TableHeader><Column isRowHeader>Tool</Column><Column>Purpose</Column></TableHeader><TableBody>{toolPlan.map(([tool,purpose]) => <Row key={tool}><Cell><code>{tool}</code></Cell><Cell>{purpose}</Cell></Row>)}</TableBody></Table></div>
    </GuideSection>
    <GuideSection title="Always-on design rules">
      <p>Keep the project’s design guidance close to the code. Use existing components, complete type roles and semantic tokens, and verify real consumer layouts when a shared component changes.</p>
      <GuideCode label="Project design guidance" code={`# ${product.name} design guidance\n\n- Compose existing base, block, chart and template components.\n- Use semantic surface, text, border and chart colors.\n- Apply complete typography roles, including weight and line height.\n- Keep source and installation names from the component catalog.\n- Check intermediate motion and respect reduced motion.\n- Verify narrow and short layouts in both appearances.\n- Preserve established local artwork and its crop coordinates.`} onNotify={onNotify}/>
      <LinkButton as={Link} href="/skill">Agent Skills and composition guidance</LinkButton>
    </GuideSection>
    <GuideSection title="Templates over MCP">
      <p>Only templates use PRO access. Base controls, blocks and charts remain free. A template license will also be available with a $0 contribution after registration opens.</p>
      <p>Template source and license activation are not distributed by this local MCP server. Use the owner checkout for template development.</p>
      <InstallCommand action="login" onNotify={onNotify}/>
      <LinkButton as={Link} href="/template-access">Template access and contributions</LinkButton>
    </GuideSection>
    <GuideSection title="Under the hood">
      <p>The server uses the official MCP SDK and shares the CLI source registry. Standard output carries protocol messages; logs and errors use standard error.</p>
      <GuideCode code={`${cliCommand} mcp --cwd /absolute/path/to/your-app`} onNotify={onNotify}/>
      <p>Use get_usage_examples for the maintained recipe and get_component for props, exports and its source dependency closure.</p>
      <LinkButton as={Link} href="/components">Browse components and examples</LinkButton>
    </GuideSection>
  </>;
}
