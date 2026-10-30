import { catalogTitle, memberForSlug } from '@/components/application/docs/catalog-families';
import { notFound, redirect } from 'next/navigation';
import { docsPages, readySlugs, type DocSlug } from '@/components/application/docs/docs-data';
import { guidePaths, getDocHref } from '@/components/application/docs/getting-started-pages';

export function generateStaticParams() {
  return readySlugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug in docsPages ? `${catalogTitle(slug, docsPages[slug as DocSlug].title)}${memberForSlug(slug) ? ` · ${memberForSlug(slug)!.label}` : ''} · appUI` : 'appUI' };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in docsPages)) notFound();
  if (Object.hasOwn(guidePaths, slug)) redirect(getDocHref(slug));
  return null;
}
