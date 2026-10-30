import { publicPath } from '@/config/deployment';
import type { ImageArtworkSource } from '@/components/base/image-artwork/image-artwork';

export type GalleryImage = ImageArtworkSource & { id: string; title: string };

// Existing appUI artwork. Sources and checksums are documented in docs/asset-provenance.md.
// Each sheet contains nine 418 × 418 artworks, kept at their original proportions.
const sheets = [
  { src: publicPath("/gallery-studies.png"), images: [
    ['paper-shark', 'Paper shark among blue waves'],
    ['terracotta-coast', 'Terracotta stairs overlooking the sea'],
    ['sunlit-kitchen', 'Sunlit kitchen with marble and brass'],
    ['flower-portrait', 'Portrait framed by summer flowers'],
    ['cobalt-vase', 'Cobalt vase and white blossoms'],
    ['moonlit-bay', 'Moonlit bay and golden city lights'],
    ['blue-songbird', 'Blue songbird among orange berries'],
    ['pastel-sculptures', 'Pastel sculptures in soft daylight'],
    ['desert-sunset', 'Desert spires at sunset'],
  ] },
  { src: publicPath("/gallery-studies-2.png"), images: [
    ['alpine-lake', 'Alpine lake and a pine-covered island'],
    ['pink-poppy', 'Pink poppy in delicate paper texture'],
    ['coastal-drive', 'Silver roadster on a coastal drive'],
    ['ginger-cat', 'Ginger cat on a teal painted background'],
    ['violet-glass', 'Violet glass and polished chrome'],
    ['tropical-room', 'Sunlit room with tropical plants'],
    ['orbital-drift', 'Astronaut above a pastel planet'],
    ['lemon-still-life', 'Lemons in a blue porcelain bowl'],
    ['neon-rain', 'Neon reflections on a rainy street'],
  ] },
];

export const imageGallery: GalleryImage[] = sheets.flatMap(sheet => sheet.images.map(([id, title], index) => ({
  id, title, src: sheet.src, width: 418, height: 418,
  crop: { x: (index % 3) * 418, y: Math.floor(index / 3) * 418, width: 418, height: 418, sourceWidth: 1254, sourceHeight: 1254 },
})));
