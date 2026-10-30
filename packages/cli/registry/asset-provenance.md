# Asset provenance

## appUI artwork

The following files are project artwork created for appUI.

| Asset | Origin | SHA-256 |
| --- | --- | --- |
| `public/gallery-studies.png` | appUI gallery artwork; nine regions | `f567d67d0b9aa053ea3af288bc8c20d2972f0c71bcad32655687146452233e8a` |
| `public/gallery-studies-2.png` | appUI gallery artwork; nine regions | `33cc17f4693d270065476db9dd77cbd867735fe218d6704d5992b6ee61e86907` |
| `public/avatars/studio-portrait.png` | appUI portrait artwork | `9f7ad593020c82fbba031c117442e7588e8b806473568074048b4ae9ad94dcd7` |
| `public/avatars/team-hire-portraits-a.webp` | appUI portrait sheet | `c98115649571a2ceff61174b474952f3b77df12d63605c546cde4b7bbe27bc27` |
| `public/avatars/team-hire-portraits-b.webp` | appUI portrait sheet | `cf71a44c2323da79234331fd478504b76674453fa4a822a76d91e48f3fbfd5c3` |
| `public/carousel/coral-arch.webp` | appUI carousel artwork | `6e4e699a997609cbb70f847bec67a39c5341cdce76a3e27e9dbe3b422e715f02` |
| `public/carousel/paper-shark.webp` | appUI carousel artwork | `a0ef71d406c111a564c952765e0e018c2f70ce938630d3623075cbaf17f88723` |
| `public/carousel/sunlit-kitchen.webp` | appUI carousel artwork | `83d09951a1df001bbcbf9abaff1db632fd41dca14e93ee144d848e82a6bbc161` |

## Gallery regions

Each gallery sheet is 1254 × 1254 pixels and contains a three-by-three grid of
418 × 418 artworks. `components/templates/image-gallery-data.ts` records the
region names and crop coordinates. `ImageArtwork` uses those coordinates for
thumbnails, previews and exports while preserving the source files and aspect
ratio.

The source installer preserves artwork bytes and crop coordinates. Installed
asset URLs use the public directory configured by the consuming application.

## Fonts and icons

The documentation application loads Inter and JetBrains Mono through
`next/font/google`. Installed components use the official Fontsource variable
packages and their accompanying font licenses.

Icons come from `@remixicon/react`. Provider marks identify their respective
services. The appUI `BrandMark` is defined in
`components/foundations/brand-mark.tsx`.
The application icon reuses the same mark.

## Documentation images

The light and dark images in `docs/images/` show appUI with its bundled example
data. The hero combines the appUI BrandMark and Home Dashboard view. The workspace
and board images show the Agent Workspace and Project Board templates.
