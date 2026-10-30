import {loadIndex} from '../src/registry.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {planSkill} from '../src/instructions.mjs';
import {applyInstallation} from '../src/project.mjs';

const cli=fileURLToPath(new URL('../bin/appui.mjs',import.meta.url));
const value=response=>JSON.parse(response.content.find(item=>item.type==='text').text);

test('real stdio MCP discovers catalog, source, examples, resources and plans without writes',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'appui-mcp-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 await fs.mkdir(path.join(root,'src'));await fs.writeFile(path.join(root,'package.json'),'{"name":"mcp-fixture","private":true}');
 const transport=new StdioClientTransport({command:process.execPath,args:[cli,'mcp','--cwd',root],stderr:'pipe'});
 const client=new Client({name:'appui-test',version:'1.0.0'});t.after(()=>client.close());
 const stderr=[];transport.stderr.on('data',chunk=>stderr.push(chunk.toString()));
 await client.connect(transport);
 const tools=await client.listTools();assert.equal(tools.tools.length,8);assert.ok(tools.tools.every(tool=>tool.annotations.readOnlyHint===true));
 const listed=value(await client.callTool({name:'list_components',arguments:{query:'toggle'}}));
 assert.ok(listed.items.some(item=>item.name==='toggle'));assert.ok(listed.items.some(item=>item.name==='toggle-group'));
 const composers=value(await client.callTool({name:'list_components',arguments:{query:'composer'}}));
 assert.deepEqual(composers.families.map(family=>family.id),['composer']);
 assert.equal(composers.families[0].kind,'composition');
 assert.deepEqual(composers.families[0].members.map(member=>member.slug).sort(),['composer','composer-attachments','composer-loader','composer-panel']);
 const catalogResource=await client.readResource({uri:'appui://catalog'});
 const catalog=JSON.parse(catalogResource.contents[0].text);
 assert.deepEqual(catalog.items.map(item=>item.name).sort(),(await loadIndex()).items.map(item=>item.name).sort());
 const creator=value(await client.callTool({name:'get_component',arguments:{name:'agent-creator'}}));
 assert.equal(creator.dependencies.three,undefined);
 assert.ok(creator.files.some(file=>file.path.endsWith('agent-avatar.tsx')&&file.content.includes('<svg')));
 const withdrawn=await client.callTool({name:'get_component',arguments:{name:'agent-visual'}});assert.equal(withdrawn.isError,true);
 assert.deepEqual(catalog.families.map(family=>family.id).sort(),['button','composer']);
 assert.ok(catalog.families.every(family=>family.members.every(member=>catalog.items.some(item=>item.name===member.slug))));
 const component=value(await client.callTool({name:'get_component',arguments:{name:'input-group'}}));
 assert.ok(component.files.find(file=>file.path.endsWith('/input/input.tsx')).content.includes('@/utils/appui/cx'));
 assert.equal(component.exports[0].importPath,'@/components/appui/base/input-group/input-group');
 assert.ok(component.files.some(file=>file.path==='styles/components.css'&&file.content.includes('.ui-input-field')));
 assert.ok(component.dependencies['@fontsource-variable/inter']);
 const usage=value(await client.callTool({name:'get_usage_examples',arguments:{name:'toggle'}}));
 assert.ok(usage.imports.some(line=>line.includes("@/components/appui/base/toggle/toggle")));assert.ok(usage.code.includes('<Toggle'));
 const plan=value(await client.callTool({name:'plan_installation',arguments:{names:['input-group'],initialize:true}}));
 assert.equal(plan.writesPerformed,false);assert.ok(plan.files.some(file=>file.path==='appui.json'));assert.equal(plan.command.executable,'appui');
 assert.deepEqual((await fs.readdir(root)).sort(),['package.json','src']);assert.deepEqual(await fs.readdir(path.join(root,'src')),[]);
 const bad=await client.callTool({name:'get_component',arguments:{name:'../../private'}});assert.equal(bad.isError,true);
 const theme=value(await client.callTool({name:'get_theme',arguments:{section:'typography'}}));assert.ok(theme.typography.includes('--text-body-regular--font-weight: 400'));
 const accents=value(await client.callTool({name:'get_theme',arguments:{section:'accents'}}));assert.ok(accents.appearance.includes('export const accents'));assert.ok(accents.accentStyles.includes('--color-accent-500'));
 const resources=await client.listResources();assert.equal(resources.resources.length,6);
 const rules=await client.readResource({uri:'appui://design-rules'});assert.ok(rules.contents[0].text.includes('14/400/20'));
 const allRules=value(await client.callTool({name:'get_design_rules',arguments:{section:'all'}}));
 assert.deepEqual(Object.keys(allRules).sort(),['components','motion','overview','patterns','theming']);
 for(const section of ['components','theming','patterns','motion']){
  const reference=await client.readResource({uri:`appui://design-rules/${section}`});
  assert.equal(reference.contents[0].text,allRules[section]);
  assert.ok(reference.contents[0].text.length>300);
 }
 const invalidRules=await client.callTool({name:'get_design_rules',arguments:{section:'../../private'}});assert.equal(invalidRules.isError,true);
 const prompts=await client.listPrompts();assert.equal(prompts.prompts[0].name,'compose_screen');
 const prompt=await client.getPrompt({name:'compose_screen',arguments:{goal:'A project settings screen'}});assert.ok(prompt.messages[0].content.text.includes('A project settings screen'));
 assert.deepEqual(stderr,[]);
});

test('project skill install preserves UI state and customized instructions',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'appui-skill-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const plan=await planSkill(root);assert.equal(plan.folder,'.agents/skills/appui');
 await applyInstallation(plan,{dryRun:true});assert.deepEqual(await fs.readdir(root),[]);
 await applyInstallation(plan);const file=path.join(root,plan.folder,'SKILL.md');assert.ok((await fs.readFile(file,'utf8')).startsWith('---\nname: appui\n'));
 assert.equal((await planSkill(root)).changes.every(file=>file.status==='unchanged'),true);
 await fs.appendFile(file,'\nProduct-specific edit\n');
 const changed=await planSkill(root);assert.equal(changed.conflicts.length,1);await assert.rejects(applyInstallation(changed),/before writing/);
 await assert.rejects(planSkill(root,{destination:'../outside'}),/leaves the project/);
 const claude=await planSkill(root,{client:'claude'});assert.equal(claude.folder,'.claude/skills/appui');
});
