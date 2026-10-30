'use client';

import { publicPath } from '@/config/deployment';

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/base/select/select';
import { catalogRoots, catalogNavigationEntries, catalogNavigationMatches, familyForSlug, catalogTitle } from './catalog-families';
import { CatalogFamilyItem } from './catalog-family-item';
import { FamilyDocumentation } from './family-documentation';
import { RiAddLine, RiLinksLine, RiArrowLeftLine, RiArrowRightLine, RiArrowRightSLine, RiCheckLine, RiCloseLine, RiCodeSLine, RiComputerLine, RiExternalLinkLine, RiFileCopyLine, RiMenuLine, RiMoonLine, RiRefreshLine, RiSearchLine, RiSmartphoneLine, RiSunLine, RiTabletLine } from '@remixicon/react';
import { AnimatePresence, motion } from 'motion/react';
import { useLandmark } from 'react-aria';
import { BrandMark } from '@/components/foundations/brand-mark';
import { Button } from '@/components/base/buttons/button';
import { TemplatePackDialog } from '@/components/templates/paywall/template-pack-dialog';
import { Badge } from '@/components/base/badges/badge';
import { InstallationSection } from './installation-section';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { useAppearance } from '@/hooks/use-appearance';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMotionTokens } from '@/hooks/use-motion-tokens';
import { cx } from '@/utils/cx';
import { catalog, catalogGroups, templateCategories, docsPages, readySlugs, sectionId, type DocSlug } from './docs-data';
import { DocsExamples, DocsPreview } from './docs-previews';
import { CodePreview } from './code-preview';
import { PreviewFrame } from './preview-frame';
import { ColorFoundation, TypographyFoundation } from './foundation-docs';
import { GettingStartedDocs } from './getting-started-docs';
import { getDocHref, type GuideSlug } from './getting-started-pages';
import { DocsPageActions } from './docs-page-actions';
import { CatalogCommandPalette } from './catalog-command-palette';

const navExpandedKey = 'appui.docs.expanded';
const navScrollKey = 'appui.docs.scroll';
function TemplateFrame({ slug, title, device }: { slug: DocSlug; title: string; device: 'desktop' | 'tablet' | 'mobile' }) {
  return <div className="docs-template-frame" data-device={device}>
    <div className="docs-template-frame__window">
    <div className="docs-template-frame__tabs"><span className="docs-template-frame__lights" aria-hidden="true"><i/><i/><i/></span><span className="docs-template-frame__tab"><i aria-hidden="true"/>{title}<b aria-hidden="true">×</b></span><span className="docs-template-frame__new-tab">New tab</span><span className="docs-template-frame__add-tab" aria-hidden="true">+</span></div>
    <div className="docs-template-frame__address"><span aria-hidden="true">‹ &nbsp;›</span><span>appui.local/templates/{slug}</span></div>
    <div className="docs-template-frame__viewport"><iframe title={`${title} preview`} src={publicPath(`/templates/${slug}`)} loading="eager"/></div>
    </div>
  </div>;
}

export function DocsShell({ slug }: { slug: DocSlug }) {
  const page = docsPages[slug];
  const router = useRouter();
  const family = familyForSlug(slug);
  const title = catalogTitle(slug, page.title);
  const familyKey = family ? `family:${family.id}` : undefined;
  const activeGroup = catalog.find(item => item.slug === slug)?.group;
  const { theme, accent, setTheme, setAccent } = useAppearance();
  const [query, setQuery] = useState('');
  const [searchCollapsed, setSearchCollapsed] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<'preview' | 'code'>('preview');
  const [templateDevice, setTemplateDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({ 'Getting Started': true, Foundations: true, Base: true, ...(activeGroup ? { [activeGroup]: true } : {}), ...(familyKey ? { [familyKey]: true } : {}) }));
  const [demoKey, setDemoKey] = useState(0);
  const [status, setStatus] = useState('');
  const [packOpen, setPackOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const displayedPage = useRef<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { landmarkProps } = useLandmark({ role: 'main', 'aria-label': 'Component documentation' }, mainRef);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const motionTokens = useMotionTokens(mainRef);

  const setArticle = useCallback((element: HTMLElement | null) => {
    articleRef.current = element;
    if (!element) return;
    const nextPage = element.dataset.page;
    if (displayedPage.current && nextPage !== displayedPage.current) {
      // Reset when the incoming page mounts, after the outgoing page's exit.
      // Same-page anchors and the independently scrolling catalog keep their state.
      if (window.location.hash) {
        let target = window.location.hash.slice(1);
        try { target = decodeURIComponent(target); } catch { /* Keep a literal fragment. */ }
        document.getElementById(target)?.scrollIntoView({block:'start',behavior:'instant'});
      } else {
        window.scrollTo({top:0,behavior:'instant'});
      }
    }
    displayedPage.current = nextPage ?? null;
  }, []);

  useLayoutEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(navExpandedKey) ?? '{}') as Record<string, boolean>;
      setExpanded(current => ({ ...current, ...saved, ...(activeGroup ? { [activeGroup]: true } : {}), ...(familyKey ? { [familyKey]: true } : {}) }));
      const savedScroll = Number(sessionStorage.getItem(navScrollKey) ?? 0);
      if (Number.isFinite(savedScroll) && navRef.current) navRef.current.scrollTop = savedScroll;
    } catch { /* Invalid stored navigation state uses the current section. */ }
  }, []);

  useLayoutEffect(() => {
    setExpanded(current => ({ ...current, ...(activeGroup ? { [activeGroup]: true } : {}), ...(familyKey ? { [familyKey]: true } : {}) }));
  }, [slug, activeGroup, familyKey]);

  function toggleGroup(group: string) {
    setExpanded(current => {
      const next = { ...current, [group]: !current[group] };
      sessionStorage.setItem(navExpandedKey, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const otherDialog = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).some(dialog => dialog.getClientRects().length > 0 && !dialog.closest('.docs-catalog-palette, [aria-hidden="true"], [inert]'));
        if (event.repeat || event.altKey || otherDialog) return;
        event.preventDefault();
        setCommandOpen(open => !open);
      }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('');
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(page.snippet.replaceAll('\\n', '\n'));
      setStatus('Example copied.');
    } catch {
      setStatus('Could not copy the example.');
    }
  }

  async function copyPage(format: 'markdown' | 'text') {
    const nodes = Array.from(articleRef.current?.querySelectorAll('h1, h2, h3, p, pre, dt, dd, li, table') ?? [])
      .filter(node => !node.closest('[data-docs-copy-ignore], [aria-hidden="true"], [role="status"], [hidden]'))
      .filter(node => node.tagName !== 'LI' || !node.querySelector('h1, h2, h3, p, pre, dt, dd, li, table'));
    const content = nodes.map(node => {
      if (node.tagName === 'TABLE') {
        const rows = Array.from(node.querySelectorAll('tr')).map(row => Array.from(row.querySelectorAll('th, td')).map(cell => (cell.textContent?.trim() ?? '').replaceAll('|', '\\|')).join(' | '));
        if (format === 'text') return rows.join('\n');
        const columns = node.querySelector('tr')?.children.length ?? 0;
        return [rows[0], Array.from({ length: columns }, () => '---').join(' | '), ...rows.slice(1)].map(row => `| ${row} |`).join('\n');
      }
      const value = node.textContent?.trim() ?? '';
      if (!value || format === 'text') return value;
      if (/^H[123]$/.test(node.tagName)) return `${'#'.repeat(Number(node.tagName[1]))} ${value}`;
      if (node.tagName === 'PRE') return `\`\`\`\n${value}\n\`\`\``;
      if (node.tagName === 'LI') return `- ${value}`;
      return value;
    }).filter(Boolean).join('\n\n');
    try { await navigator.clipboard.writeText(content); setStatus('Page copied.'); }
    catch { setStatus('Could not copy the page.'); }
  }

  const navigationSlugs = catalogRoots.filter(item => readySlugs.includes(item.slug as DocSlug)).map(item => item.slug);
  const nextIndex = navigationSlugs.indexOf(family?.rootSlug ?? slug) + 1;
  const nextSlug = navigationSlugs[nextIndex] as DocSlug | undefined;
  const previousSlug = navigationSlugs[nextIndex - 2] as DocSlug | undefined;
  const isFoundation = slug === 'color' || slug === 'typography';
  const isGuide = activeGroup === 'Getting Started';

  useEffect(() => { setMode('preview'); setStatus(''); setMobileMenuOpen(false); }, [slug]);
  useEffect(() => { setSearchCollapsed({}); }, [query]);

  return (
    <div className={cx('docs-shell', activeGroup === 'Templates' && 'docs-shell--template', slug === 'components' && 'docs-shell--catalog')}>
      <aside className={cx('docs-sidebar', mobileMenuOpen && 'is-open')} aria-label="Component navigation">
        <div className="docs-sidebar__head"><Link className="docs-brand" href="/getting-started" aria-label="appUI documentation"><BrandMark size={30} /><span>app<span>UI</span></span></Link><button className="docs-mobile-menu-button" type="button" aria-label={mobileMenuOpen ? 'Close component menu' : 'Open component menu'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(open => !open)}>{mobileMenuOpen ? <RiCloseLine size={21} aria-hidden /> : <RiMenuLine size={21} aria-hidden />}</button></div>
        <div className="docs-search"><RiSearchLine size={18} aria-hidden /><input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Quick Search" aria-label="Search the catalog" /><button type="button" className="docs-command-trigger" aria-label="Open catalog command palette" aria-haspopup="dialog" aria-expanded={commandOpen} aria-keyshortcuts="Control+K Meta+K" onClick={() => setCommandOpen(true)}><kbd>⌘K</kbd></button></div>
        <nav ref={navRef} className="docs-sidebar__nav" aria-label="Catalog" onScroll={event => sessionStorage.setItem(navScrollKey, String(event.currentTarget.scrollTop))}>
          {catalogGroups.map(group => {
            const items = catalogNavigationEntries.filter(item => item.group === group && catalogNavigationMatches(item, query)).sort((a, b) => {
              const categoryOrder = group === 'Templates' ? templateCategories.indexOf(a.category as typeof templateCategories[number]) - templateCategories.indexOf(b.category as typeof templateCategories[number]) : 0;
              return categoryOrder || a.label.localeCompare(b.label, 'en', { sensitivity: 'base', numeric: true });
            });
            if (!items.length) return null;
            const hasCategoryHeadings = group === 'Templates';
            return <details key={group} className="docs-nav-group" open={Boolean(query) || Boolean(expanded[group])}>
              <summary onClick={event => { event.preventDefault(); if (!query) toggleGroup(group); }}>{group}<RiArrowRightSLine size={15} aria-hidden /></summary>
              <div className="docs-nav-group__items">
                {items.map((item, index) => {
                  const ready = readySlugs.includes(item.slug as DocSlug);
                  const badges = <span className="docs-nav-badges">{item.isNew && <Badge variant="label" color="new">NEW</Badge>}{item.tier === 'pro' && <Badge variant="label">PRO</Badge>}</span>;
                  const itemFamily = familyForSlug(item.slug);
                  const isLastBranch = index === items.length - 1 || (hasCategoryHeadings && item.category !== items[index + 1]?.category);
                  const preserveNav = () => { if (navRef.current) sessionStorage.setItem(navScrollKey, String(navRef.current.scrollTop)); setMobileMenuOpen(false); };
                  return <Fragment key={item.slug}>{hasCategoryHeadings && item.category && item.category !== items[index - 1]?.category && <h3 className="docs-nav-category">{item.category}</h3>}{itemFamily && group !== 'Templates' ? <CatalogFamilyItem family={itemFamily} slug={slug} query={query} isLastBranch={isLastBranch} isOpen={query.trim() ? !searchCollapsed[itemFamily.id] : Boolean(expanded[`family:${itemFamily.id}`])} isNew={item.isNew} isPro={item.tier === 'pro'} onToggle={() => { if (query.trim()) setSearchCollapsed(current => ({...current, [itemFamily.id]: !current[itemFamily.id]})); else toggleGroup(`family:${itemFamily.id}`); }} onNavigate={preserveNav}/> : ready ? <Link key={item.slug} data-last-branch={isLastBranch || undefined} href={getDocHref(item.slug)} aria-current={slug === item.slug ? 'page' : undefined} className={cx(slug === item.slug && 'is-active')} onNavigate={() => { if (navRef.current) sessionStorage.setItem(navScrollKey, String(navRef.current.scrollTop)); setMobileMenuOpen(false); }}><span className="docs-nav-group__branch" aria-hidden="true" />{item.label}{badges}</Link> : <span key={item.slug} data-last-branch={isLastBranch || undefined} className="docs-nav-group__pending" title="Component work in progress"><span className="docs-nav-group__branch" aria-hidden="true" />{item.label}{badges}</span>}</Fragment>;
                })}
              </div>
            </details>;
          })}
        </nav>
        <div className="docs-sidebar__pack"><Button variant="secondary" size="small" onClick={() => setPackOpen(true)}>Get templates</Button><small>Pay what you want · $0 welcome</small></div>
        <div className="docs-sidebar__foot"><span>appUI / SYSTEM</span><span>{readySlugs.length} / {catalog.length}</span></div>
      </aside>

      <TemplatePackDialog linkComponent={Link} isOpen={packOpen} onOpenChange={setPackOpen}/>
      <CatalogCommandPalette isOpen={commandOpen} onOpenChange={setCommandOpen} onNavigate={() => { setQuery(''); setMobileMenuOpen(false); }}/>
      <div className="docs-content-region">
      <main {...landmarkProps} ref={mainRef} className="docs-main">
        <header className="docs-topbar" data-family={family?.id}>
          <div className="docs-topbar__path"><BrandMark size={17} /><span>appUI</span><RiArrowRightSLine size={15} aria-hidden /><Link href="/getting-started">Docs</Link><RiArrowRightSLine size={15} aria-hidden /><strong>{title}</strong></div>
          {family && <div className="docs-family-selector"><span aria-hidden>{family.selectionLabel}</span><Select label={`${family.label} ${family.selectionLabel.toLowerCase()}`} hideLabel size="small" density="compact" selectedKey={slug} options={family.members.map(member => ({ id: member.slug, label: member.label }))} onSelectionChange={value => { if (value && value !== slug) router.push(getDocHref(value)); }}/></div>}
          <div className="docs-topbar__actions"><button type="button" className="docs-command-topbar" aria-label="Open catalog command palette" aria-haspopup="dialog" aria-expanded={commandOpen} onClick={() => setCommandOpen(true)}><RiSearchLine size={18} aria-hidden/></button><button className="docs-theme-button" type="button" onClick={event => setTheme(theme === 'dark' ? 'light' : 'dark', event)} aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} appearance`}>{theme === 'dark' ? <RiSunLine size={20} aria-hidden /> : <RiMoonLine size={20} aria-hidden />}</button></div>
        </header>

        <AnimatePresence mode="wait" initial={false}><motion.article ref={setArticle} className="docs-page" key={slug} data-page={slug} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reducedMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}>
          <div className="docs-page__intro">{slug === "mcp" && <div className="docs-page__integration-mark" aria-hidden><BrandMark size={64}/><RiAddLine size={20}/><RiLinksLine size={64}/></div>}<div className="docs-page__intro-header"><h1>{title}{activeGroup === 'Templates' && <Badge variant="pill" className="docs-page__tier">PRO</Badge>}</h1>{isGuide && slug !== 'components' && <DocsPageActions onCopy={copyPage} />}</div><p>{family?.description ?? page.description}</p></div>
          {isGuide ? <GettingStartedDocs slug={slug as GuideSlug} onNotify={setStatus} /> : isFoundation ? slug === 'color' ? <ColorFoundation theme={theme} accent={accent} setTheme={setTheme} setAccent={setAccent} onNotify={setStatus} /> : <TypographyFoundation /> : <>
            <div className="docs-preview-bar" id="preview"><div className="docs-preview-tabs" role="tablist" aria-label="Example display" onKeyDown={event => { if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return; event.preventDefault(); const next = event.key === 'ArrowLeft' || event.key === 'Home' ? 'preview' : 'code'; setMode(next); event.currentTarget.querySelector<HTMLButtonElement>(`#${next}-tab`)?.focus(); }}><button id="preview-tab" role="tab" aria-controls="example-panel" type="button" className={cx(mode === 'preview' && 'is-active')} aria-selected={mode === 'preview'} tabIndex={mode === 'preview' ? 0 : -1} onClick={() => setMode('preview')}>{mode === 'preview' && <motion.span className="docs-preview-tabs__indicator" layoutId="example-tab-indicator" transition={{ duration: reducedMotion ? 0 : motionTokens.fast, ease: motionTokens.ease }} />}<span className="docs-preview-tabs__icon" aria-hidden="true">◉</span><span>Preview</span></button><button id="code-tab" role="tab" aria-controls="example-panel" type="button" className={cx(mode === 'code' && 'is-active')} aria-selected={mode === 'code'} tabIndex={mode === 'code' ? 0 : -1} onClick={() => setMode('code')}>{mode === 'code' && <motion.span className="docs-preview-tabs__indicator" layoutId="example-tab-indicator" transition={{ duration: reducedMotion ? 0 : motionTokens.fast, ease: motionTokens.ease }} />}<RiCodeSLine size={16} aria-hidden /><span>Code</span></button></div>{activeGroup === 'Templates' && <SegmentedControl className="docs-template-device" aria-label="Preview device" value={templateDevice} onValueChange={value => setTemplateDevice(value as typeof templateDevice)} options={([['desktop','Desktop',RiComputerLine],['tablet','Tablet',RiTabletLine],['mobile','Mobile',RiSmartphoneLine]] as const).map(([value,label,Icon]) => ({value,label,icon:<Icon size={16} aria-hidden/>}))}/>}<div className="docs-preview-bar__actions">{activeGroup === 'Templates' && <Link href={`/templates/${slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${page.title} live preview`}><RiExternalLinkLine size={16} aria-hidden />Live preview</Link>}<button type="button" onClick={() => { setDemoKey(key => key + 1); setStatus('Preview reset.'); }} aria-label="Reset preview" title="Reset preview"><RiRefreshLine size={17} aria-hidden /></button><button type="button" onClick={copyExample}><RiFileCopyLine size={16} aria-hidden />Copy code</button></div></div>
            <PreviewFrame mode={mode} surface={['composer-attachments','composer-panel','message','message-actions','conversation'].includes(slug) ? 'muted' : 'default'}>
              <AnimatePresence mode="wait" initial={false}>{mode === 'preview' ? <motion.div className="docs-preview__motion" key="preview" initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reducedMotion ? 0 : motionTokens.fast, ease: motionTokens.ease }}>{activeGroup === 'Templates' ? <TemplateFrame key={`${slug}-${demoKey}`} slug={slug} title={page.title} device={templateDevice}/> : <DocsPreview key={`${slug}-${demoKey}`} slug={slug} onNotify={setStatus} />}</motion.div> : <CodePreview key="code" source={page.snippet} />}</AnimatePresence>
            </PreviewFrame>
          </>}
          <p className="docs-status" role="status">{status}</p>
          {!isGuide && !isFoundation && activeGroup !== 'Templates' && <DocsExamples key={`${slug}-${demoKey}`} slug={slug} onNotify={setStatus} />}
          {family && <FamilyDocumentation family={family}/>}
          {!isGuide && !isFoundation && <InstallationSection slug={slug} title={page.title} isTemplate={activeGroup === 'Templates'} snippet={page.snippet} onNotify={setStatus} />}
          {(previousSlug || nextSlug) && <nav className="docs-pagination" aria-label="Adjacent pages">{previousSlug ? <Link href={getDocHref(previousSlug)} aria-label={`Previous page: ${catalogTitle(previousSlug, docsPages[previousSlug].title)}`}><span><RiArrowLeftLine size={16} aria-hidden />{catalogTitle(previousSlug, docsPages[previousSlug].title)}</span><small>{docsPages[previousSlug].description}</small></Link> : <span aria-hidden="true"/>}{nextSlug ? <Link href={getDocHref(nextSlug)} aria-label={`Next page: ${catalogTitle(nextSlug, docsPages[nextSlug].title)}`}><span>{catalogTitle(nextSlug, docsPages[nextSlug].title)}<RiArrowRightLine size={16} aria-hidden /></span><small>{docsPages[nextSlug].description}</small></Link> : <span aria-hidden="true"/>}</nav>}
        </motion.article></AnimatePresence>
      </main>

      <aside className="docs-toc" aria-label="On this page"><div><h2>On this page</h2>{!isGuide && !isFoundation && <><a href="#preview" className="is-active">Preview</a></>}{page.sections.filter(section => section !== 'Preview').map((section, index) => <a className={(isGuide || isFoundation) && index === 0 ? 'is-active' : undefined} key={section} href={`#${sectionId(section)}`}>{section}</a>)}{family && <a href="#family">Family and configuration</a>}{!isGuide && !isFoundation && <a href="#installation">Installation</a>}</div></aside>
      </div>
    </div>
  );
}
