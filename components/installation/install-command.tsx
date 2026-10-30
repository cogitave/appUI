'use client';

import { CodeBlock } from '@/components/base/code-block/code-block';
import { product } from '@/config/product';

export function InstallCommand({ slug, action = 'add', onNotify }: { slug?: string; action?: 'init' | 'login' | 'add'; onNotify?: (message: string) => void }) {
  if (!product.cli.published && product.cli.localAvailable) {
    if (action === 'login' || slug?.startsWith('template-')) return <CodeBlock label="Template release status" onCopy={onNotify} examples={[{value:'status',label:'Local release',code:'# Template activation is not available in the local release.\n# Use the owner source checkout for template development.'}]}/>;
    const arguments_ = `${action}${action === 'add' && slug ? ` ${slug}` : ''}`;
    return <CodeBlock label="Local installation" onCopy={onNotify} examples={[
      {value:'checkout',label:'Source checkout',code:`node /path/to/appUI/packages/cli/bin/appui.mjs ${arguments_} --cwd . --install`},
      {value:'package',label:'Local package',code:`npm install -D /path/to/appui-0.1.0.tgz\nnpx --no-install appui ${arguments_} --install`},
    ]}/>;
  }
  const runners = { npm: 'npx', pnpm: 'pnpm dlx', yarn: 'yarn dlx' };
  const argument = action === 'login' ? 'YOUR_LICENSE_KEY' : action === 'add' ? slug ?? '' : '';
  return <CodeBlock label={action === 'login' ? 'Login command' : action === 'init' ? 'Initialize command' : 'Install command'} onCopy={onNotify} examples={Object.entries(runners).map(([manager,runner]) => ({value:manager,label:manager,code:`${runner} ${product.cli.packageName}@${product.cli.tag} ${action}${argument ? ` ${argument}` : ''}`}))}/>;
}
