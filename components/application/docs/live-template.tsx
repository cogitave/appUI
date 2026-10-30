'use client';

import { useEffect, useState } from 'react';
import { TemplatePreview } from './template-previews';
import type { DocSlug } from './docs-data';
import { Skeleton, SkeletonGroup } from '@/components/base/skeleton/skeleton';

export function LiveTemplate({ slug }: { slug: DocSlug }) {
  const [status, setStatus] = useState('');
  const [ready,setReady] = useState(false);
  useEffect(()=>{
    let alive=true,frame=0;
    void document.fonts.ready.then(()=>{frame=requestAnimationFrame(()=>{if(alive)setReady(true);});});
    return()=>{alive=false;cancelAnimationFrame(frame);};
  },[]);
  useEffect(() => { if (!status) return; const timeout = window.setTimeout(() => setStatus(''), 3200); return () => window.clearTimeout(timeout); }, [status]);
  return <main className="live-template" data-ready={ready||undefined}>
    <SkeletonGroup isLoading={!ready} label="Loading template preview" className="live-template__loading"><Skeleton isLoading={!ready} shape="rectangle"><TemplatePreview slug={slug} onNotify={setStatus} /></Skeleton></SkeletonGroup>
    <output role="status" className="live-template__status" data-visible={Boolean(status)}>{status}</output>
  </main>;
}
