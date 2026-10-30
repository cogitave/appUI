import Link from 'next/link';
import { RiArrowLeftLine, RiFileWarningLine } from '@remixicon/react';
import { BrandMark } from '@/components/foundations/brand-mark';

export default function NotFound() {
  return <main className="not-found">
    <header className="not-found__brand"><BrandMark size={31} /><span>app<span>UI</span></span></header>
    <section className="not-found__card" aria-labelledby="not-found-title">
      <span className="not-found__icon"><RiFileWarningLine size={25} aria-hidden /></span>
      <span className="not-found__eyebrow">404 · PAGE NOT FOUND</span>
      <h1 id="not-found-title">Couldn’t load this page.</h1>
      <p>The address may have changed, or this page may have been removed. Browse the component catalog to keep exploring.</p>
      <Link href="/components/announcement" className="not-found__link"><RiArrowLeftLine size={18} aria-hidden /> Explore components</Link>
    </section>
    <span className="not-found__foot">appUI / DESIGN SYSTEM</span>
  </main>;
}
