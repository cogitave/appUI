'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { CodeBlock } from '@/components/base/code-block/code-block';
import { LinkButton } from '@/components/base/buttons/link-button';
import { InstallCommand } from '@/components/installation/install-command';
import { product } from '@/config/product';
import { GuideCode, GuideReleaseNote, GuideSection, GuideSteps, GuideTabs, cliCommand, installedRoot } from './guide-parts';

export function InstallationGuide({ onNotify }: { onNotify: (message: string) => void }) {
  const init = <InstallCommand action="init" onNotify={onNotify} />;
  const add = <InstallCommand slug="button" onNotify={onNotify} />;
  const globalImport = "import '@/styles/appui/globals.css';";
  const framework = (id: string, label: string, create: string, setup: { title: string; description: string; content: ReactNode }[], entry: string, code: string) => ({ id, label, content: <GuideSteps steps={[
    { title: 'Create a project', description: 'Skip this step if you already have a React project.', content: <GuideCode code={create} onNotify={onNotify} /> },
    ...setup,
    { title: 'Initialize the shared foundations', description: 'Run the command from the application root once the framework and Tailwind are configured.', content: init },
    { title: 'Load the global stylesheet', description: 'Import it once at the application entry point. Set up Inter and JetBrains Mono using the Theme Setup guide.', content: <GuideCode label={entry} code={code} onNotify={onNotify} /> },
    { title: 'Add a component', description: 'Use the installed source in your application.', content: add },
  ]} /> });
  const viteConfig = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport tailwindcss from '@tailwindcss/vite';\nimport { fileURLToPath, URL } from 'node:url';\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },\n});`;
  const aliasConfig = `{\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": { "@/*": ["./src/*"] }\n  }\n}`;
  const workspaceConfig = JSON.stringify({ schemaVersion:1, paths: { components: `src/components/${product.cli.sourceDirectory}`, utils: 'src/utils/appui', hooks: 'src/hooks/appui', config:'src/config/appui', styles: 'src/styles/appui', assets:'public/appui' }, aliases: { components: `@workspace/ui/components/${product.cli.sourceDirectory}`, utils: '@workspace/ui/utils/appui', hooks: '@workspace/ui/hooks/appui', config:'@workspace/ui/config/appui', styles: '@workspace/ui/styles/appui' }, assetBaseURL:'/appui' }, null, 2);

  return <>
    <div className="docs-guide__preamble"><GuideReleaseNote />
    <p className="docs-guide__intro-link">Prefer agent-assisted setup? <LinkButton as={Link} href="/mcp">Explore the MCP integration</LinkButton></p></div>
    <GuideSection title="Quick start">
      <p>Use React 19, TypeScript and Tailwind CSS 4. The local installer adds shared colors, typography, font packages, styles and utilities, then the components your application needs.</p>
      {!product.cli.published && <GuideSteps steps={[{title:'Prepare the local CLI',description:'Run this in the appUI source checkout. The package command creates artifacts/distribution/appui-0.1.0.tgz for installation in another project.',content:<GuideCode code="npm run registry:build\nnpm run cli:pack" onNotify={onNotify}/>},{title:'Review the destination',description:'Use the path to your source checkout or install the local tarball. The dry run writes no files or dependencies.',content:<GuideCode code={`${cliCommand} init --cwd . --dry-run`} onNotify={onNotify}/>}]} />}
      <p>Installing into a shared package? Configure <LinkButton as={Link} href="#monorepos-and-custom-aliases">monorepos and custom aliases</LinkButton> first.</p>
      {init}
      <p>Add several components in one command. Their shared dependencies belong in the same source tree.</p>
      <InstallCommand slug="button select date-picker" onNotify={onNotify} />
    </GuideSection>

    <GuideSection title="Framework guides">
      <p>The same components work across React frameworks. Each setup connects Tailwind, the import alias and the global stylesheet to its entry point.</p>
      <GuideTabs label="Framework" options={[
        framework('next', 'Next.js', 'npx create-next-app@latest my-app\ncd my-app', [], 'app/layout.tsx', `// Keep your existing layout and metadata.\n${globalImport}\n// For a src/ layout, map @/* to ./src/*.`),
        framework('vite', 'Vite', 'npm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install', [
          { title: 'Connect Tailwind and the import alias', description: 'Add the Tailwind Vite plugin and map @/ to src in both Vite and TypeScript. Merge these settings with your existing configuration.', content: <><GuideCode code="npm install tailwindcss @tailwindcss/vite" onNotify={onNotify} /><CodeBlock label="Vite configuration" onCopy={onNotify} examples={[{value:'vite',label:'vite.config.ts',code:viteConfig},{value:'typescript',label:'tsconfig.app.json',code:aliasConfig}]} /></> },
        ], 'src/main.tsx', globalImport),
        framework('router', 'React Router', 'npx create-react-router@latest my-app\ncd my-app\nnpm install', [
          { title: 'Keep the framework plugins and alias', description: 'The starter includes Tailwind. Keep the React Router and Tailwind Vite plugins. Map @/ to app, and use the destination configuration to keep generated files in that directory.', content: <CodeBlock label="React Router configuration" onCopy={onNotify} examples={[{value:"typescript",label:"tsconfig.json",code:JSON.stringify({compilerOptions:{baseUrl:".",paths:{"~/*":["./app/*"],"@/*":["./app/*"]}}},null,2)},{value:"destination",label:product.integrations.configFile,code:JSON.stringify({schemaVersion:1,paths:{components:`app/components/${product.cli.sourceDirectory}`,styles:"app/styles/appui",utils:"app/utils/appui",hooks:"app/hooks/appui",config:"app/config/appui",assets:"public/appui"},aliases:{components:`@/components/${product.cli.sourceDirectory}`,styles:"@/styles/appui",utils:"@/utils/appui",hooks:"@/hooks/appui",config:"@/config/appui"},assetBaseURL:"/appui"},null,2)}]} /> },
        ], 'app/root.tsx', `// Keep the generated document, links and route outlet.\n${globalImport}`),
        framework('astro', 'Astro', 'npm create astro@latest my-app\ncd my-app\nnpx astro add react\nnpm install tailwindcss @tailwindcss/vite', [
          { title: 'Enable React and Tailwind', description: 'Use the React integration for interactive components, the Tailwind Vite plugin for CSS, and map @/ to src in tsconfig.json.', content: <CodeBlock label="Astro configuration" onCopy={onNotify} examples={[{value:'astro',label:'astro.config.mjs',code:`import { defineConfig } from 'astro/config';\nimport react from '@astrojs/react';\nimport tailwindcss from '@tailwindcss/vite';\n\nexport default defineConfig({\n  integrations: [react()],\n  vite: { plugins: [tailwindcss()] },\n});`},{value:'typescript',label:'tsconfig.json',code:aliasConfig}]} /> },
        ], 'src/pages/index.astro', `---\n${globalImport}\nimport { Example } from '@/components/example';\n---\n<Example client:load />`),
      ]} />
      <LinkButton as={Link} href="/theme-setup">Fonts and appearance setup</LinkButton>
    </GuideSection>

    <GuideSection title="Monorepos and custom aliases">
      <p>Keep reusable source in one UI package. Each consuming application owns its routes and imports the shared stylesheet. Templates belong in the application that uses them.</p>
      <p>The CLI uses <code>{product.integrations.configFile}</code> beside the destination package manifest. It creates a scoped default configuration; paths point into that package, and aliases must match its exports and your bundler configuration.</p>
      <GuideSteps steps={[
        {title:'Configure the destination package',description:'Choose a source folder and an import prefix for every shared group. Merge exports into the package manifest.',content:<CodeBlock label="Workspace configuration" onCopy={onNotify} examples={[{value:'config',label:product.integrations.configFile,code:workspaceConfig},{value:'package',label:'package.json',code:JSON.stringify({name:'@workspace/ui',private:true,exports:{'./components/*':'./src/components/*','./styles/*':'./src/styles/*','./utils/*':'./src/utils/*','./hooks/*':'./src/hooks/*'}},null,2)}]} />},
        {title:'Run commands inside the UI package',description:'Dependencies and source belong to the selected package.',content:<GuideCode code={`cd packages/ui\n${cliCommand} init --install\n${cliCommand} add button --install`} onNotify={onNotify}/>},
        {title:'Connect the consuming applications',description:'Add @workspace/ui as a workspace dependency and configure the app bundler to compile its TypeScript. Repeat the stylesheet setup in each app.',content:<GuideCode label="apps/web/styles/globals.css" code={'@import "@workspace/ui/styles/appui/globals.css";\n@source "../../../packages/ui/src";'} onNotify={onNotify}/>},
      ]} />
    </GuideSection>

    <GuideSection title="Manual installation">
      <p>Working directly from the appUI source checkout? Preserve the shared foundations and every dependency named by the component imports.</p>
      <GuideSteps steps={[
        {title:'Install the shared dependencies',description:'Individual blocks may also use table, drag-and-drop or date packages. Check their imports before moving source.',content:<GuideCode code="npm install react-aria-components tailwind-merge @remixicon/react motion" onNotify={onNotify}/>},
        {title:'Keep the theme, typography and global styles together',description:'Retain the styles referenced by globals.css, along with the hooks and utilities imported by the components. Load the stylesheet once.',content:<GuideCode label="Application entry" code={globalImport} onNotify={onNotify}/>},
        {title:'Resolve the source alias',description:'Map @/ to your source root in TypeScript and your bundler. Match the actual folder location when importing a component.',content:<GuideCode label="tsconfig.json" code='{\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": { "@/*": ["./*"] }\n  }\n}' onNotify={onNotify}/>},
      ]} />
      <p><LinkButton as={Link} href="/theme-setup">Complete the font and theme setup</LinkButton> before composing your first screen.</p>
    </GuideSection>

    <GuideSection title="Add a component">
      {add}
      <GuideCode label="Button usage" code={`'use client';\n\nimport { Button } from '${installedRoot}/base/buttons/button';\n\nexport function Example() {\n  return <Button onClick={() => console.log('Started')}>Get started</Button>;\n}`} onNotify={onNotify}/>
      <LinkButton as={Link} href="/components">Explore the component catalog</LinkButton>
    </GuideSection>
    <GuideSection title="Template access">
      <p>Components, blocks and charts are available in the local registry. Template distribution and license activation are not enabled in this release; template development uses the owner source checkout.</p>
      <InstallCommand action="login" onNotify={onNotify}/><InstallCommand slug="template-project-board" onNotify={onNotify}/>
      <LinkButton as={Link} href="/template-access">Contributions and template access</LinkButton>
    </GuideSection>
    <GuideSection title="Dark mode">
      <p>Shared controls read semantic colors from the root appearance. Use the existing initializer and Theme Switch to keep the saved preference and the rendered theme in sync.</p>
      <GuideCode label="Appearance controls" code={`import { AppearanceInitializer } from '${installedRoot}/foundations/appearance-initializer';\nimport { ThemeSwitch } from '${installedRoot}/base/theme-switch/theme-switch';\n\nexport function Appearance() {\n  return <><AppearanceInitializer /><ThemeSwitch /></>;\n}`} onNotify={onNotify}/>
      <LinkButton as={Link} href="/theme-setup">Theme, fonts and reduced motion</LinkButton>
    </GuideSection>
    <GuideSection title="Accent color">
      <p>Choose a shared accent preset with the appearance hook. Controls and selection states use the accent ramp; content and chart colors retain their own semantic roles.</p>
      <GuideCode label="Brand accent" code={`'use client';\n\nimport { useAppearance } from '@/hooks/appui/use-appearance';\nimport { Button } from '${installedRoot}/base/buttons/button';\n\nexport function BrandAccent() {\n  const { setAccent } = useAppearance();\n  return <Button onClick={() => setAccent('violet')}>Use violet</Button>;\n}`} onNotify={onNotify}/>
      <LinkButton as={Link} href="/components/color">The full color system</LinkButton>
    </GuideSection>
    <GuideSection title="Tech stack">
      <dl className="docs-guide__requirements">{[['React 19','Composable interface components'],['TypeScript','Props and application data'],['Tailwind CSS 4','Styles and semantic tokens'],['React Aria','Accessible controls and interactions'],['Motion','Transitions and layout movement'],['Remix Icon','Shared icon vocabulary']].map(([title,description])=><div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
    </GuideSection>
  </>;
}
