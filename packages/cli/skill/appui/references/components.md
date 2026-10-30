# Components and installation

The local CLI registry maintains names and dependency graphs. Use `appui list`,
`appui info <name>`, or MCP `list_components`, `get_component` and
`get_usage_examples`. Do not invent a slug from a visual label. Examples are
recipes: the consuming application supplies data, callbacks and composed children.
Base covers controls; Blocks composes them; Charts accepts application data.
Template development uses the owner's checkout; template activation and public
distribution are not enabled in the local release.

`appui.json` uses `schemaVersion: 1`, `paths`, `aliases` and `assetBaseURL`.
Paths are relative to the destination package. Configure components, hooks,
utils, config, styles and assets; code/style aliases must match TypeScript and
the bundler. Artwork URLs match the public asset destination. Existing `src/`
determines scoped defaults. Run `--cwd` against the app or UI package.

`init` installs foundations; `add` installs the complete source closure.
`--install` explicitly installs missing packages. `--dry-run` writes nothing.
Load the installed globals stylesheet once and retain its Tailwind source scan.
Use the host's actual build to verify exports, aliases and font loading.

`.appui/installed.json` records source and transformed hashes. Identical files
stay untouched; unmodified managed files may update. Customized files stop the
installation before writes. `diff` identifies affected files; `--overwrite`
backs up replacements under `.appui/backups/`. Preserve product customizations.
Paths stay inside the selected project; symlink destinations are rejected.
Keep project-specific guidance outside installed skill files.
