# Appearance and typography

Installed `styles/appui/globals.css` imports Tailwind CSS 4 and shared semantic
tokens. The installer supplies Fontsource variable Inter and JetBrains Mono;
the documentation checkout retains its Next.js fonts. The host may override
font variables deliberately. Check loaded fonts, not just computed family names.

Use surface, text and border roles for surfaces and copy. Accent roles describe
selected/actions states; chart colors keep their data meaning. Saved appearance
is synchronized by AppearanceInitializer and useAppearance; ThemeSwitch uses
the same transition. Assert the root `dark` class before a dark screenshot.

Typography lives in `typography.css`. Use size, weight, line height and letter
spacing together. Components use Inter; code uses the shared mono variable.
Body regular is 14px / 400 / 20px; body medium is 14px / 500 / 20px. Compact
body-2 regular is 13px / 400 / 18px. Specimen labels show the actual role values.
Do not change only a label's weight or an input's font size.

Preserve artwork during appearance/spacing repairs. Check contrast for the
actual foreground/background role pair in both appearances; arbitrary palette
pairs are not automatically accessible actions.
