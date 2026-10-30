import { cx } from '@/utils/cx';

export type ImageArtworkSource = {
  src: string;
  width?: number;
  height?: number;
  crop?: { x: number; y: number; width: number; height: number; sourceWidth: number; sourceHeight: number };
};

/** Display one artwork from an existing sheet without changing its proportions. */
export function ImageArtwork({ image, alt, className }: { image: ImageArtworkSource; alt: string; className?: string }) {
  const crop = image.crop;
  if (crop) return <svg className={cx('ui-image-artwork', className)} viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} width={crop.width} height={crop.height} preserveAspectRatio="xMidYMid slice" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined} focusable="false">
    <image href={image.src} width={crop.sourceWidth} height={crop.sourceHeight} />
  </svg>;
  return <img className={cx('ui-image-artwork', className)} src={image.src} alt={alt} width={image.width} height={image.height} loading="lazy" decoding="async" />;
}

/** Export the displayed artwork, rather than its entire source sheet. */
export async function downloadImageArtwork(image: ImageArtworkSource, filename: string) {
  const anchor = document.createElement('a');
  if (!image.crop) {
    anchor.href = image.src;
    anchor.download = filename;
    anchor.click();
    return;
  }
  const source = new Image();
  source.src = image.src;
  await source.decode();
  const crop = image.crop;
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image export is unavailable.');
  context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Image export failed.')), 'image/png'));
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = `${filename}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
