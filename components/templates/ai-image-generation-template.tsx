'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { RiAddLine, RiCloseLine, RiImageLine, RiLayoutRightLine, RiSparkling2Line } from '@remixicon/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMediaQuery, TEMPLATE_PANEL_QUERY } from '@/hooks/use-media-query';
import { usePanelFocus } from '@/hooks/use-panel-focus';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Composer } from '@/components/blocks/composer/composer';
import { imageGallery, type GalleryImage } from './image-gallery-data';
import { ImageArtwork, downloadImageArtwork } from '@/components/base/image-artwork/image-artwork';

type ImageArt = GalleryImage;
type Generation = { prompt: string; state: 'generating' | 'ready' | 'failed'; id: number };
type Props = { images?: { src: string; title: string }[]; initialPrompt?: string; stylePresets?: string[]; workspaceName?: string; onGenerate?: (prompt: string, style: string | null) => Promise<{ src: string; title: string }> | { src: string; title: string }; onAction?: (action: string) => void };

const studies: ImageArt[] = imageGallery;
const defaultStyles = ['Editorial', 'Paper cut', 'Dreamscape', 'Still life', 'Graphic', 'Cinematic'];
const styleArtworkIds: Record<string, string> = { Editorial: 'flower-portrait', 'Paper cut': 'paper-shark', Dreamscape: 'orbital-drift', 'Still life': 'cobalt-vase', Graphic: 'blue-songbird', Cinematic: 'neon-rain' };
const starterPrompt = 'Create a blue paper-cut shark swimming through layered ocean waves.';

export function ImageGenerationWorkspace({ images, initialPrompt = starterPrompt, stylePresets = defaultStyles, workspaceName = 'Studio workspace', onGenerate, onAction }: Props) {
  const [uploaded, setUploaded] = useState<ImageArt[]>([]);
  const [generated, setGenerated] = useState<ImageArt[]>([]);
  const [panel, setPanel] = useState<'gallery' | 'styles'>('gallery');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWide, setPanelWide] = useState(false);
  const compactPanel = useMediaQuery(TEMPLATE_PANEL_QUERY);
  const panelRef = useRef<HTMLElement>(null);
  const [chosenStyle, setChosenStyle] = useState<string | null>(null);
  const [selected, setSelected] = useState<ImageArt | null>(null);
  usePanelFocus(compactPanel && panelOpen, panelRef, () => { if (selected) setSelected(null); else setPanelOpen(false); });
  const reducedMotion = useReducedMotion();
  const [generation, setGeneration] = useState<Generation>({ prompt: initialPrompt, state: 'generating', id: 0 });
  const [resultImage, setResultImage] = useState<ImageArt>(studies[0]);
  const [promptValue, setPromptValue] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const uploadedRef = useRef<ImageArt[]>([]);
  const nextGenerationId = useRef(1);
  const activeGenerationId = useRef(0);
  const gallery: ImageArt[] = [...generated, ...(images ? images.map((image, index) => ({ ...image, id: `provided-${index}` })) : studies), ...uploaded];

  useEffect(() => { setPanelOpen(!compactPanel); }, [compactPanel]);
  useEffect(() => {
    if (generation.state !== 'generating' || (onGenerate && generation.id > 0)) return;
    const timer = window.setTimeout(() => setGeneration(current => current.id === generation.id ? { ...current, state: 'ready' } : current), 5200);
    return () => window.clearTimeout(timer);
  }, [generation, onGenerate]);
  useEffect(() => { uploadedRef.current = uploaded; }, [uploaded]);
  useEffect(() => () => uploadedRef.current.forEach(image => URL.revokeObjectURL(image.src)), []);
  useEffect(() => {
    if (!selected || compactPanel) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, compactPanel]);

  function generate(prompt: string) {
    const id = nextGenerationId.current++;
    activeGenerationId.current = id;
    setGeneration({ prompt, state: 'generating', id });
    onAction?.(`generate: ${prompt}`);
    if (onGenerate) Promise.resolve().then(() => onGenerate(prompt, chosenStyle)).then(result => {
      if (activeGenerationId.current !== id) return;
      const image = { ...result, id: `generated-${id}` };
      setGenerated(current => [image, ...current]);
      setResultImage(image);
      setGeneration(current => current.id === id ? { ...current, state: 'ready' } : current);
    }).catch(() => {
      if (activeGenerationId.current !== id) return;
      setGeneration(current => current.id === id ? { ...current, state: 'failed' } : current);
      onAction?.('image generation failed');
    });
  }
  function upload(files: FileList | null) {
    if (!files?.length) return;
    const additions = Array.from(files).filter(file => file.type.startsWith('image/')).map(file => ({ id: `upload-${crypto.randomUUID()}`, src: URL.createObjectURL(file), title: file.name.replace(/\.[^.]+$/, '') }));
    setUploaded(current => [...additions, ...current]);
    setPanel('gallery');
    setPanelOpen(true);
    onAction?.(`${additions.length} image${additions.length === 1 ? '' : 's'} added`);
  }

  return <div className="ui-image-workbench" data-panel-closed={!panelOpen || undefined} data-panel-wide={panelWide || undefined}>
    <section inert={compactPanel && panelOpen} className="ui-image-workbench__conversation" aria-label="Image generation conversation">
      <div className="ui-image-workbench__mobile-header"><strong>Image generation</strong><IconButton icon={RiImageLine} aria-label="Open gallery" onClick={() => { setPanel('gallery'); setPanelOpen(true); }}/></div>
      <header className="ui-image-workbench__topbar"><span>{workspaceName}</span><span aria-hidden="true">›</span><strong>Image generation</strong><button type="button" aria-label={panelOpen ? 'Hide image panel' : 'Show image panel'} aria-expanded={panelOpen} onClick={() => setPanelOpen(open => !open)}><RiLayoutRightLine size={17}/></button></header>
      <div className="ui-image-workbench__thread">
        <p className="ui-image-workbench__prompt">{generation.prompt}</p>
        <div className="ui-image-workbench__generation" key={generation.id} data-state={generation.state} role="status" aria-live="polite">
          {generation.state === 'generating' ? <><div className="ui-image-workbench__orb" aria-hidden="true">{Array.from({ length: 121 }, (_, index) => <i key={index} style={{ animationDelay: `${((index * 17) % 49) * -36}ms` }} />)}</div><span><span className="ui-image-workbench__pulse"/>Generating image</span></> : generation.state === 'failed' ? <><div className="ui-image-workbench__failure"><RiSparkling2Line size={25}/><p>Image generation failed.</p></div><span><button type="button" onClick={() => generate(generation.prompt)}>Try again</button></span></> : <><span className="ui-image-workbench__result" role="img" aria-label="Generated preview"><ImageArtwork image={onGenerate ? resultImage : gallery[0] ?? studies[0]} alt=""/></span><span>{onGenerate ? 'Image ready' : 'Sample preview'} <button type="button" onClick={() => { if (galleryRef.current) galleryRef.current.scrollTop = 0; setPanel('gallery'); setPanelOpen(true); setSelected(onGenerate ? resultImage : gallery[0] ?? studies[0]); }}>Open</button></span></>}
        </div>
      </div>
      <div className="ui-image-workbench__composer"><Composer value={promptValue} onChange={setPromptValue} onSend={generate} models={[{ id: 'fast', label: 'Fast' }, { id: 'quality', label: 'Quality' }]} branch="Main" project={workspaceName} agentLabel={chosenStyle ?? 'Image agent'} contextPercent={57} onVoice={() => onAction?.('voice input')} placeholder="Describe an image to create" /></div>
    </section>
    {compactPanel && panelOpen && <button type="button" className="ui-image-workbench__panel-scrim" aria-label="Close image panel" tabIndex={-1} onClick={() => setPanelOpen(false)}/>}
    <aside ref={panelRef} role={compactPanel ? "dialog" : undefined} aria-modal={compactPanel && panelOpen || undefined} className="ui-image-workbench__panel" aria-label="Image gallery and styles" aria-hidden={!panelOpen} inert={!panelOpen}>
      <header className="ui-image-workbench__panel-header"><div role="tablist" aria-label="Image panel"><button type="button" role="tab" aria-selected={panel === 'gallery'} onClick={() => setPanel('gallery')}><RiImageLine size={17}/>Gallery</button><button type="button" role="tab" aria-selected={panel === 'styles'} onClick={() => setPanel('styles')}><RiSparkling2Line size={17}/>Styles</button></div><div className="ui-image-workbench__panel-actions"><input ref={fileInput} type="file" accept="image/*" multiple aria-label="Upload images" onChange={event => { upload(event.currentTarget.files); event.currentTarget.value = ''; }}/><button type="button" aria-label="Add images" title="Add images" onClick={() => fileInput.current?.click()}><RiAddLine size={17}/></button><button type="button" aria-label={panelWide ? 'Use normal gallery width' : 'Expand gallery'} aria-pressed={panelWide} title="Expand gallery" onClick={() => setPanelWide(wide => !wide)}>↗</button><button type="button" aria-label="Hide image panel" title="Hide image panel" onClick={() => setPanelOpen(false)}><RiLayoutRightLine size={17}/></button></div></header>
      {panel === 'gallery' ? <div ref={galleryRef} className="ui-image-workbench__gallery" role="tabpanel" aria-label="Gallery">
        <AnimatePresence initial={false}>{selected && <motion.figure className="ui-image-workbench__featured" key="featured-image" initial={reducedMotion ? false : { height: 0, opacity: 0, marginBottom: 0 }} animate={{ height: 'auto', opacity: 1, marginBottom: 8 }} exit={reducedMotion ? undefined : { height: 0, opacity: 0, marginBottom: 0 }} transition={{ height: { duration: reducedMotion ? 0 : .42, ease: [.2, .78, .25, 1] }, opacity: { duration: reducedMotion ? 0 : .2 }, marginBottom: { duration: reducedMotion ? 0 : .42 } }}><div className="ui-image-workbench__featured-art" style={{ aspectRatio: selected.width && selected.height ? `${selected.width} / ${selected.height}` : undefined }} role="img" aria-label={selected.title}><AnimatePresence initial={false}><motion.span className="ui-image-workbench__featured-art-image" key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .24 }}><ImageArtwork image={selected} alt=""/></motion.span></AnimatePresence></div><div className="ui-image-workbench__featured-actions"><button type="button" aria-label={`Minimize ${selected.title}`} onClick={() => setSelected(null)}><RiCloseLine size={16}/></button><button type="button" aria-label={`Download ${selected.title}`} onClick={() => { downloadImageArtwork(selected, selected.id).catch(() => onAction?.('Image download failed')); }}>↓</button></div><figcaption>{selected.title}</figcaption></motion.figure>}</AnimatePresence>
        <div className="ui-image-workbench__gallery-grid">{[0, 1, 2].map(column => <div className="ui-image-workbench__gallery-column" key={column}>{gallery.filter((image, index) => index % 3 === column).map((image, index) => <motion.button layout="position" className="ui-image-workbench__tile" type="button" key={image.id} style={{ animationDelay: `${Math.min(index * 3 + column, 12) * 30}ms` }} aria-label={`Enlarge ${image.title}`} aria-expanded={selected?.id === image.id} onClick={() => { setSelected(image); galleryRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); }}><span className="ui-image-workbench__art" style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : undefined }}><ImageArtwork image={image} alt={image.title}/></span><span className="ui-image-workbench__tile-label">{image.title}</span></motion.button>)}</div>)}</div>
      </div> : <div className="ui-image-workbench__styles" role="tabpanel" aria-label="Styles"><h3>Style presets</h3><p>Choose a direction for your next image.</p><div>{stylePresets.map((style, index) => <button type="button" key={style} aria-pressed={chosenStyle === style} onClick={() => { setChosenStyle(style); onAction?.(`select ${style} style`); }}><span className="ui-image-workbench__style-art" aria-hidden="true"><ImageArtwork image={studies.find(image => image.id === styleArtworkIds[style]) ?? studies[index % studies.length]} alt=""/></span><strong>{style}</strong></button>)}</div></div>}
    </aside>
  </div>;
}
