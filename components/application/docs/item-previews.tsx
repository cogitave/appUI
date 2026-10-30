'use client';

import { publicPath } from '@/config/deployment';
import { useState } from 'react';
import { RiFileTextLine, RiFolderLine, RiShieldCheckLine } from '@remixicon/react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badge';
import { Button } from '@/components/base/buttons/button';
import { Direction } from '@/components/base/direction/direction';
import { ImageArtwork } from '@/components/base/image-artwork/image-artwork';
import { AspectRatio } from '@/components/base/aspect-ratio/aspect-ratio';
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemLink, ItemMedia, ItemTitle, type ItemSize } from '@/components/base/item/item';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { Select } from '@/components/base/select/select';
import { DocExampleSection as Section } from './doc-example-section';

const artwork={src:publicPath("/carousel/coral-arch.webp")};
const updates=[{id:'design',title:'Design handoff',description:'Component details are ready for review.'},{id:'access',title:'Project access',description:'The team can open the latest release.'},{id:'release',title:'Release notes',description:'A short summary of what changed.'}];

export function ItemPreview({onNotify}:{onNotify:(message:string)=>void}) {
  return <div className="docs-extended-preview docs-item-preview"><Item>
    <ItemMedia variant="avatar"><Avatar src={publicPath("/avatars/studio-portrait.png")} initials="MC" alt="Maya Chen"/></ItemMedia>
    <ItemContent><ItemTitle>Maya Chen</ItemTitle><ItemDescription>Design lead · Studio team</ItemDescription></ItemContent>
    <ItemActions><Button variant="secondary" size="small" onClick={()=>onNotify('Maya Chen’s profile selected.')}>View profile</Button></ItemActions>
  </Item></div>;
}

function ItemSizeDemo() {
  const [size,setSize]=useState<ItemSize>('medium'),[spacing,setSpacing]=useState<'separated'|'joined'>('separated');
  return <div className="docs-extended-stack docs-item-demo"><div className="docs-extended-actions">
    <SegmentedControl aria-label="Item size" value={size} onValueChange={value=>setSize(value as ItemSize)} options={[{value:'small',label:'Small'},{value:'medium',label:'Medium'},{value:'large',label:'Large'}]}/>
    <SegmentedControl aria-label="Item grouping" value={spacing} onValueChange={value=>setSpacing(value as typeof spacing)} options={[{value:'separated',label:'Separated'},{value:'joined',label:'Joined'}]}/>
  </div><ItemGroup aria-label="Project updates" size={size} spacing={spacing}>{updates.map(update=><Item key={update.id}><ItemMedia><RiFileTextLine/></ItemMedia><ItemContent><ItemTitle>{update.title}</ItemTitle><ItemDescription>{update.description}</ItemDescription></ItemContent></Item>)}</ItemGroup></div>;
}

function ItemLinksDemo() {
  const [visited,setVisited]=useState('');
  return <div className="docs-extended-stack docs-item-demo"><ItemGroup aria-label="Project destinations" spacing="joined">
    <ItemLink href="#item-destination" title="Project overview" description="Open the project summary below." media={<RiFolderLine/>} onNavigate={()=>setVisited('Project overview')}/>
    <ItemLink href="#item-destination" title="Release notes" description="Read the latest changes." media={<RiFileTextLine/>} onNavigate={()=>setVisited('Release notes')}/>
    <ItemLink href="#item-destination" title="Archived project" description="This destination is unavailable." isDisabled media={<RiFolderLine/>}/>
  </ItemGroup><div id="item-destination" tabIndex={-1} className="docs-item-destination"><p className="docs-extended-note" role="status">{visited?`Opened: ${visited}`:'Select a destination to try native link navigation.'}</p></div></div>;
}

function ItemAccessDemo() {
  const [access,setAccess]=useState<string|null>('team');
  return <Item align="start"><ItemMedia variant="avatar"><Avatar initials="AR" color="lime" alt="Alex Rivera"/></ItemMedia><ItemContent><ItemTitle>Alex Rivera</ItemTitle><ItemDescription>A member with shared project access.</ItemDescription></ItemContent><ItemActions><Select aria-label="Alex Rivera access" selectedKey={access} onSelectionChange={setAccess} size="small" options={[{id:'team',label:'Team only'},{id:'private',label:'Private'},{id:'public',label:'Public link'}]}/></ItemActions><ItemFooter><span className="docs-extended-note" role="status">Access: {access==='team'?'Team only':access==='private'?'Private':'Public link'}</span></ItemFooter></Item>;
}

export function ItemExamples({onNotify}:{onNotify:(message:string)=>void}) {
  return <>
    <Section title="Surfaces" description="Plain, outlined and soft rows reuse the shared Card surface."><div className="docs-extended-stack docs-item-demo">{(['plain','outline','soft'] as const).map(variant=><Item key={variant} variant={variant}><ItemMedia><RiFolderLine/></ItemMedia><ItemContent><ItemTitle>{variant[0].toUpperCase()+variant.slice(1)} project</ItemTitle><ItemDescription>A shared place to plan the release.</ItemDescription></ItemContent><ItemActions><Button size="small" variant="secondary" onClick={()=>onNotify(`${variant} project selected.`)}>Open {variant}</Button></ItemActions></Item>)}</div></Section>
    <Section title="Sizes and groups" description="Padding and row geometry animate between sizes. Separated and joined groups retain native list semantics."><ItemSizeDemo/></Section>
    <Section title="Media" description="Use shared icons, Avatar and local artwork. Media keeps its bounds while long text wraps."><ItemGroup aria-label="Media examples" className="docs-item-demo"><Item><ItemMedia><RiShieldCheckLine/></ItemMedia><ItemContent><ItemTitle>Account verified</ItemTitle><ItemDescription>Your workspace details are up to date.</ItemDescription></ItemContent><ItemActions><Badge variant="label" color="primary">Verified</Badge></ItemActions></Item><Item><ItemMedia variant="avatar"><Avatar initials="SO" alt="Sam Okafor" color="pink"/></ItemMedia><ItemContent><ItemTitle>Sam Okafor</ItemTitle><ItemDescription>Product · Studio team</ItemDescription></ItemContent></Item><Item><ItemMedia variant="image"><ImageArtwork image={artwork} alt="Coral paper arch"/></ItemMedia><ItemContent><ItemTitle>Editorial study</ItemTitle><ItemDescription>Original artwork from this project.</ItemDescription></ItemContent></Item></ItemGroup></Section>
    <Section title="Headers and footers" description="A header and footer use complete rows. Embedded actions use their shared components."><div className="docs-extended-stack docs-item-demo"><Item><ItemHeader><AspectRatio ratio={3/1}><ImageArtwork image={artwork} alt="Coral paper forms in warm light"/></AspectRatio></ItemHeader><ItemContent><ItemTitle>Editorial study</ItemTitle><ItemDescription>A warmer direction for the next release.</ItemDescription></ItemContent><ItemFooter><Badge variant="label">DESIGN</Badge><Button size="small" variant="ghost" onClick={()=>onNotify('Editorial study saved.')}>Save study</Button></ItemFooter></Item><ItemAccessDemo/></div></Section>
    <Section title="Links" description="Each full row is one native link, with a named title and description. Separate actions belong in a content row."><ItemLinksDemo/></Section>
    <Section title="Long content" description="Text wraps at its available width. A deliberate line limit can make a dense collection easier to scan."><ItemGroup aria-label="Long content examples" className="docs-item-demo"><Item><ItemContent><ItemTitle>Review the shared workspace configuration before inviting the wider team</ItemTitle><ItemDescription>A long description keeps its original type role and fills the space provided by its own container. Actions move to a separate row on narrow surfaces.</ItemDescription></ItemContent><ItemActions><Button size="small" variant="secondary" onClick={()=>onNotify('Workspace review selected.')}>Review workspace</Button></ItemActions></Item><Item variant="soft"><ItemContent><ItemTitle>Two lines of supporting text</ItemTitle><ItemDescription lines={2}>Keep the most useful context close to the action. This optional limit shows two visual lines while the full description remains available to assistive technology. Use the unlimited version when every detail needs to stay visible.</ItemDescription></ItemContent></Item></ItemGroup></Section>
    <Section title="Right to left" description="Media, trailing controls and navigation arrows follow the scoped direction."><Direction locale="ar-AE" className="docs-item-demo"><ItemGroup aria-label="Right to left items"><Item><ItemMedia variant="avatar"><Avatar initials="MC" alt="Maya Chen"/></ItemMedia><ItemContent><ItemTitle>Maya Chen</ItemTitle><ItemDescription>Design lead · Studio team</ItemDescription></ItemContent><ItemActions><Button size="small" variant="secondary" onClick={()=>onNotify('Maya Chen’s profile selected.')}>View profile</Button></ItemActions></Item><ItemLink href="#item-destination" title="Project overview" description="Open the shared project summary." media={<RiFolderLine/>}/></ItemGroup></Direction></Section>
  </>;
}
