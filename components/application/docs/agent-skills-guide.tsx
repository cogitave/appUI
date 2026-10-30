'use client';

import Link from 'next/link';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { LinkButton } from '@/components/base/buttons/link-button';
import { InstallCommand } from '@/components/installation/install-command';
import { product } from '@/config/product';
import { GuideCode, GuideReleaseNote, GuideSection, cliCommand } from './guide-parts';

const files = [
  ['SKILL.md', 'The composition workflow: inspect the project, choose existing components, use shared foundations, compose the screen and verify its states.'],
  ['references/components.md', 'Catalog names, descriptions, installation commands and examples for base controls, blocks, charts and templates.'],
  ['references/theming.md', 'Semantic surfaces, text and border colors, the accent ramp, typography roles and saved appearance.'],
  ['references/patterns.md', 'Recipes for dashboards, commerce, forms, settings, product pages and conversational interfaces.'],
  ['references/motion.md', 'Transitions, layout height, press feedback, interruption behavior and reduced motion.'],
];

export function AgentSkillsGuide({ onNotify }: { onNotify: (message: string) => void }) {
  const name = product.integrations.name;
  return <>
    <div className="docs-guide__preamble"><GuideReleaseNote feature="Skills"/>
    <p className="docs-guide__intro-link docs-guide__intro-link--lead">An agent skill is readable project guidance in a SKILL.md file. It keeps component choices, typography, themes and motion consistent without requiring a running server.</p></div>
    <GuideSection title="Install">
      <p>The local command installs the skill and references inside your project. It uses the same file ownership, dry-run and backup behavior as component installation.</p>
      <CodeBlock label="Agent skill installation" onCopy={onNotify} examples={[
        {value:'project',label:'Project',code:`${cliCommand} skill --cwd . --dry-run\n${cliCommand} skill --cwd .`},
        {value:'codex',label:'Codex',code:`${cliCommand} skill --client codex --cwd .`},
        {value:'claude',label:'Claude Code',code:`${cliCommand} skill --client claude --cwd .`},
        {value:'custom',label:'Custom path',code:`${cliCommand} skill --path .config/skills/${name} --cwd .`},
      ]}/>
      <p>MCP exposes the same entry guidance with get_design_rules. Skill installation is applied through the CLI.</p>
      <LinkButton as={Link} href="/mcp#always-on-design-rules">Copy the project design guidance</LinkButton>
    </GuideSection>
    <GuideSection title="What's inside">
      <p>The skill keeps its entry file short and puts component, theme, pattern and motion details in references.</p>
      <dl className="docs-guide__skill-files">{files.map(([file,description])=><div key={file}><dt><code>{file}</code></dt><dd>{description}</dd></div>)}</dl>
    </GuideSection>
    <GuideSection title="Where it goes per client">
      <p>Choose the project folder your client scans. Custom destinations remain inside the selected project.</p>
      <dl className="docs-guide__requirements"><div><dt>Default / Codex</dt><dd><code>.agents/skills/{name}/</code></dd></div><div><dt>Claude Code</dt><dd><code>.claude/skills/{name}/</code></dd></div><div><dt>Custom</dt><dd>Your client’s configured project skill directory</dd></div></dl>
      <p>If the updated skill does not appear in your client, refresh or restart its session.</p>
    </GuideSection>
    <GuideSection title="Updating">
      <p>Run the command again to update unmodified managed files. Customized files produce a conflict before writing. Keep product-specific guidance in a separate file; explicitly replacing a conflict creates a backup.</p>
      <GuideCode code={`${cliCommand} skill --dry-run\n${cliCommand} skill --overwrite`} onNotify={onNotify}/>
    </GuideSection>
    <GuideSection title="Skill and MCP">
      <p>The skill supplies composition guidance. MCP reads source and examples and plans changes; the CLI installs source. They use the same catalog and foundations.</p>
      <div className="docs-guide__comparison"><article><h3>Agent skill</h3><p>Component selection, composition, typography, themes and motion guidance.</p></article><article><h3>MCP integration</h3><p>Catalog queries, source examples, project setup and installation tools.</p><LinkButton as={Link} href="/mcp">Review MCP setup</LinkButton></article></div>
    </GuideSection>
    <GuideSection title="Template access">
      <p>The catalog includes templates alongside free base components, blocks and charts. Only templates carry the PRO label. A license after registration grants template access even when the chosen contribution is $0.</p>
      <InstallCommand action="login" onNotify={onNotify}/>
      <div className="docs-guide__actions"><LinkButton as={Link} href="/template-access">Template access</LinkButton><LinkButton as={Link} href="/components" variant="neutral">Explore the catalog</LinkButton></div>
    </GuideSection>
  </>;
}
