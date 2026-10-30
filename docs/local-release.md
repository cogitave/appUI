# Local setup and distribution

## Run the application

From the appUI checkout:

```sh
npm ci
npm run dev
```

The development application opens on port 3000. Use `npm run build` followed by
`npm run start` for production.

## Static demo

`npm run build:pages` exports the documentation and interactive previews to
`out/`. Set `NEXT_PUBLIC_BASE_PATH` when the host serves the site from a
subdirectory. The GitHub Pages workflow reads that path from the site's Pages
configuration and deploys the export after updates to `main`.

## Build the source installer

```sh
npm run cli:pack
```

The command builds the registry and creates the local CLI tarball under
`artifacts/distribution/`. Generated archives are excluded from Git.

Install that tarball in a React 19 application, substituting its actual path:

```sh
npm install --save-dev /absolute/path/to/appui-0.1.0.tgz
npx appui init --install
npx appui add button select message conversation --install
```

Load the generated `styles/appui/globals.css` once. Configure the import aliases
listed in `appui.json` in TypeScript and your bundler. Default destinations
follow the application's existing `src` directory. `npx appui doctor` checks
managed source and dependency configuration.

The local installer includes Base, Blocks and Charts. Templates are available
in the appUI source application. See `packages/cli/README.md` for CLI, MCP and
agent skill usage, and `docs/template-access.md` for template availability.
