export const gettingStartedPages={
 'getting-started':{title:"Let's begin",group:'Getting Started',description:'A React design system for the products you build. Explore the components, installation, agent integrations and shared design foundations.',sections:['Why appUI','Installation','MCP server','Free and Pro','Color','Typography'],snippet:''},
 installation:{title:'Installation',group:'Getting Started',description:'Set up appUI in your React and Tailwind CSS project. Choose your framework, configure a shared UI package or follow the manual setup.',sections:['Quick start','Framework guides','Monorepos and custom aliases','Manual installation','Add a component','Template access','Dark mode','Accent color','Tech stack'],snippet:''},
 mcp:{title:'MCP Server',group:'Getting Started',description:'Connect your coding assistant to the appUI component catalog, source, examples and design foundations through a local MCP integration.',sections:['Setup','Monorepos and custom aliases','Try asking your agent','Tools','Always-on design rules','Templates over MCP','Under the hood'],snippet:''},
 skill:{title:'Agent Skills',group:'Getting Started',description:'Give your coding assistant the appUI catalog, design rules, composition patterns and motion guidance so it builds with the same system.',sections:['Install',"What's inside",'Where it goes per client','Updating','Skill and MCP','Template access'],snippet:''},
 components:{title:'Components',group:'Getting Started',description:'Explore the shared foundations, base controls, composed blocks, charts and complete templates. Open any preview to see its examples and source.',sections:['Foundations','Base','Blocks','Charts','Templates'],snippet:''},
 'theme-setup':{title:'Theme Setup',group:'Getting Started',description:'Use the same semantic colors, typography and motion across light and dark appearances.',sections:['Shared styles','Switch appearance','Try the theme','Motion preferences'],snippet:''},
 'template-access':{title:'Template Access',group:'Getting Started',description:'Choose your contribution, including $0, then use your license to install complete templates.',sections:['Choose your contribution','Activate your license','Add a template'],snippet:''},
} as const;
export type GuideSlug=keyof typeof gettingStartedPages;
export const guidePaths:Record<GuideSlug,string>={
 'getting-started':'/getting-started',installation:'/installation',mcp:'/mcp',skill:'/skill',components:'/components','theme-setup':'/theme-setup','template-access':'/template-access',
};
export function getDocHref(slug:string){return Object.hasOwn(guidePaths,slug)?guidePaths[slug as GuideSlug]:`/components/${slug}`;}
