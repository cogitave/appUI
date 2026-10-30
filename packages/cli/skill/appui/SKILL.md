---
name: appui
description: Build or refine React interfaces that use appUI, choosing existing components and preserving its typography, theme, layout and motion conventions. Use for appUI installation, composition and shared-component repairs.
---

# Build with appUI

Use this guidance in projects that use appUI. Follow the user's product choices
and repository instructions. This skill does not authorize publishing, external
account changes or installation into an unrelated project.

## Discover and compose

Read `appui.json` for actual installed paths and aliases. Inspect the existing
screen composition and shared source before introducing a separately styled
substitute. Use connected appUI MCP catalog/source/example tools when available.
With the local CLI installed, `npx --no-install appui list <query>` and
`npx --no-install appui info <name>` provide exact names and dependencies.
The package is a local release; do not assume an npm publication.

For setup, source ownership or custom aliases, read
[components.md](references/components.md). Review `init --dry-run` or
`diff <names>` before installation. Keep customized source; explicit
`--overwrite` creates backups before replacement.

Reuse base controls inside blocks and blocks inside screens. Message and
Conversation follow AI Chat / Chat Starter composition. Composer fills the
width supplied by its layout. Settings and toolbars use Select/ComboBox;
dismissal uses CloseButton; bounded quantities use Meter. Keep native scrolling,
hide visual scrollbars and use ScrollArea directional controls for constrained
overflow. Assistant identity is BrandMark or the caller's avatar.

Preserve established local artwork. ImageArtwork and explicit crop coordinates
keep thumbnails, enlarged views and exports on the same source region.
Read [patterns.md](references/patterns.md)
for forms, conversations and product layouts.

## Keep the shared visual language

Apply family, size, weight, line height and letter spacing as one typography
role. Message text is body regular (14/400/20); compact action titles are body
medium (14/500/20). Semantic surface/text/border and accent roles adapt to both
appearances. Read [theming.md](references/theming.md) for font or theme changes.

Every visible interaction has appropriate motion: selection, search mode,
density, opening, closing and action feedback. Animate actual height when
layout changes. Loading previews complete automatically and use the existing
replay action; mounted content crossfades with placeholders of the same bounds.
Read [motion.md](references/motion.md) for interruption and overlay invariants.

## Verify the changed behavior

Assert the actual DOM theme and loaded fonts before visual evidence. Check
narrow and short layouts, keyboard/focus, relevant form semantics, intermediate
motion and completion, rapid reversal and reduced motion. Shared changes need
a real composed consumer. Constrained menus retain bounds and row geometry
when search mode changes. Hidden/exiting controls immediately leave focus and
accessibility navigation. Stop optional checks when concrete risks are resolved.
