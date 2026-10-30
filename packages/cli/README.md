# appUI local source installer

This package is a local source installer for appUI components, blocks and charts, including their source dependencies. It is not published to npm.

From the appUI checkout:

```sh
npm run registry:build
node packages/cli/bin/appui.mjs list
node packages/cli/bin/appui.mjs init --cwd /path/to/your-app --dry-run
node packages/cli/bin/appui.mjs init --cwd /path/to/your-app --install
node packages/cli/bin/appui.mjs add button input-group toggle --cwd /path/to/your-app --install
```

Run `npm run cli:pack` to create a local tarball. Install that tarball in your app with your package manager and run its `appui` binary.

## Destination configuration

`appui.json` owns source destinations, import aliases and local artwork URLs. Defaults use an existing `src/` folder when present, and scope the files under `appui` folders. Configure custom package aliases for monorepos; map them in TypeScript and the application bundler. The installer does not rewrite the host's framework config or global stylesheet.

Load the installed `styles/appui/globals.css` once. It includes Tailwind CSS 4, appUI semantic tokens and local Inter/JetBrains Mono variable font imports, with explicit source scanning for the installed component directory. It excludes documentation-only styles. Existing host font variables can override the defaults. React 19 is required.

Styles are assembled from the source closure of every installed component. Shared
theme, typography and motion foundations remain available; adding another
component retains earlier controls. Selection preserves complete CSS rules,
their order, conditional wrappers and keyframes. Only referenced local artwork
is copied. A migration may leave an older managed file on disk without importing
it; the installer does not remove user source or artwork.

## Source ownership

`add` installs the complete source closure. Existing identical files are kept. Managed unchanged files can update. Customized files stop the whole operation before any write. `diff` shows the planned file status; `--overwrite` explicitly backs up replaced files under `.appui/backups/` before applying them. Every installation records source and installed hashes in `.appui/installed.json`.

`--dry-run` never writes or installs dependencies. Dependencies install only when `--install` is provided. Native package manager execution does not use a shell. Destination paths must stay inside the selected project, and symlink destinations are rejected.

`doctor` checks the React/Tailwind requirements and missing or customized managed files. It does not claim to verify the host's bundler or font loading; use its actual build to complete setup verification.

Templates remain in the owner's source checkout. A license service and public package publication are outside this local release.

## Component families

The catalog resource and `list_components` include the free component family
metadata from `config/component-families.json`. Individual install names remain unchanged. Variants
configure a component’s visual form, props configure behavior/data, and composed
screen presets remain outside this local template distribution.

## Local MCP and agent skill

`appui mcp --cwd /path/to/your-app` starts a stdio MCP server using the official
SDK. Its eight tools read the catalog, source, usage examples, theme and design
guidance, inspect project health and plan installation. They perform no writes.
It also exposes the catalog, design-rule overview and four focused reference resources, plus a composition prompt. `get_design_rules` accepts `section: "all"` or a focused section (`overview`, `components`, `theming`, `patterns`, `motion`). MCP
output uses the protocol only; diagnostics go to stderr. A checkout must install
`packages/cli` dependencies before launch; the tarball declares them normally.

`appui skill --cwd /path/to/your-app` installs project guidance under
`.agents/skills/appui`. `--client claude` selects `.claude/skills/appui`, and
`--path` selects another project-relative folder. Dry-run, conflict handling,
managed updates and backups are shared with source installation. No global
client configuration is changed. MCP setup examples are in the documentation.
