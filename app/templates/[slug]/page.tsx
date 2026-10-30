import { notFound } from 'next/navigation';
import { templatePages } from '@/components/application/docs/template-pages';
import { LiveTemplate } from '@/components/application/docs/live-template';

export function generateStaticParams() {
  return Object.keys(templatePages).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug in templatePages ? `${templatePages[slug as keyof typeof templatePages].title} · appUI` : 'appUI' };
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in templatePages)) notFound();
  return <LiveTemplate slug={slug as keyof typeof templatePages} />;
}
