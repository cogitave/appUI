'use client';

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RiGlobalLine, RiNotification3Line, RiPlayLine, RiVolumeUpLine } from '@remixicon/react';
import { Input } from '@/components/base/input/input';
import { Textarea } from '@/components/base/textarea/textarea';
import { Select } from '@/components/base/select/select';
import { Switch } from '@/components/base/switch/switch';
import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import {ColorSwatchPicker} from '@/components/base/color-swatch/color-swatch-picker';
import { SegmentedControl } from '@/components/base/segmented-control/segmented-control';
import { AgentAvatar, AgentFace, agentEmotions, agentShapes, type AgentShape, type AgentEmotion } from './agent-avatar';
import { cx } from '@/utils/cx';

export type AgentIdentity = { name: string; label: string; color: string; shape: AgentShape; voice: string; language: string; notifications: boolean; description?: string; emotion?: AgentEmotion; voiceSpeed?: number };
export type AgentCreatorProps = { value?: AgentIdentity; defaultValue?: AgentIdentity; onChange?: (identity: AgentIdentity) => void; onSave?: (identity: AgentIdentity) => void; onPreviewVoice?: (identity: AgentIdentity) => void; className?: string };
const defaults: AgentIdentity = { name: 'Cloud engineer', label: 'Cloud', description: 'Helps with server architecture, cloud infrastructure, deployments, and reliable services.', color: '#f3bca5', shape: 'cloud', emotion: 'Thinking', voice: 'System voice', voiceSpeed: 1, language: 'Auto-detect', notifications: true };
const colors = [{ name: 'Blue', color: '#6092ee' }, { name: 'Teal', color: '#47bea7' }, { name: 'Violet', color: '#9c6ee7' }, { name: 'Pink', color: '#eb64a2' }, { name: 'Red', color: '#f17b74' }, { name: 'Orange', color: '#f3bca5' }, { name: 'Cyan', color: '#65bdd0' }, { name: 'Lime', color: '#adc96b' }, { name: 'Green', color: '#75c481' }];

export function AgentCreator({ value, defaultValue = defaults, onChange, onSave, onPreviewVoice, className }: AgentCreatorProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const reducedMotion = useReducedMotion();
  const [orbitAngle, setOrbitAngle] = useState(0);
  const drag = useRef<{ x: number; y: number; angle: number; kind: 'emotion' | 'shape'; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const emotion = current.emotion ?? 'Thinking';
  const selectedShape = current.shape === 'spark' ? 'star' : current.shape;
  const shapeIndex = agentShapes.indexOf(selectedShape);
  function update(patch: Partial<AgentIdentity>) { const next = { ...current, ...patch }; if (!value) setInternal(next); onChange?.(next); }
  function chooseShape(index: number) { update({ shape: agentShapes[(index + agentShapes.length) % agentShapes.length] }); }
  function startDrag(event: PointerEvent<HTMLDivElement>, kind: 'emotion' | 'shape') { if (event.button !== 0) return; dragged.current = false; drag.current = { x: event.clientX, y: event.clientY, angle: orbitAngle, kind, moved: false }; }
  function moveDrag(event: PointerEvent<HTMLDivElement>) { const start = drag.current; if (!start) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (Math.hypot(dx, dy) < 7 && !start.moved) return; start.moved = true; dragged.current = true; event.currentTarget.setPointerCapture(event.pointerId); if (start.kind === 'emotion') setOrbitAngle(start.angle + dx * .65); }
  function endDrag(event: PointerEvent<HTMLDivElement>) { const start = drag.current; if (!start) return; if (start.moved && start.kind === 'shape') chooseShape(shapeIndex - Math.round((event.clientX - start.x) / 48)); drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }
  function previewVoice() { if (onPreviewVoice) { onPreviewVoice(current); return; } if (typeof speechSynthesis !== 'undefined' && current.voice !== 'Off') { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(`Hello, I'm ${current.name || 'your assistant'}. How can I help?`); utterance.rate = current.voiceSpeed ?? 1; utterance.lang = ({ English: 'en', Türkçe: 'tr', Deutsch: 'de' } as Record<string, string>)[current.language] ?? navigator.language; speechSynthesis.speak(utterance); } }
  return <section aria-label="Agent editor" className={cx('ui-agent-creator', className)} style={{ '--agent-color': current.color } as CSSProperties}>
    <header className="ui-agent-creator__header"><h2>{current.name || 'New agent'}</h2></header>
    <div className="ui-agent-creator__scroll" aria-label="Agent appearance and details" tabIndex={0}>
      <div className="ui-agent-creator__appearance">
        <div className="ui-agent-creator__emotions" role="group" aria-label="Agent emotion" onPointerDown={event => startDrag(event, 'emotion')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { drag.current = null; }}>
          {agentEmotions.map((name, index) => { const angle = (index * 22.5 + orbitAngle) * Math.PI / 180; return <button type="button" key={name} aria-label={name} aria-pressed={emotion === name} style={{ '--face-x': `${Math.sin(angle) * 116}px`, '--face-y': `${-Math.cos(angle) * 116}px` } as CSSProperties} onClick={event => { if (!dragged.current || event.detail === 0) update({ emotion: name }); }}><AgentFace emotion={name} /></button>; })}
        </div>
        <div className="ui-agent-creator__portrait" role="img" aria-label={`${emotion} ${current.shape} avatar`}>{<AnimatePresence mode="wait" initial={false}><motion.div key={current.shape} initial={reducedMotion ? false : { opacity: 0, scale: .85, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={reducedMotion ? undefined : { opacity: 0, scale: .9, rotate: 5 }} transition={{ duration: reducedMotion ? 0 : .18 }}><AgentAvatar shape={current.shape} emotion={emotion} color={current.color} /></motion.div></AnimatePresence>}</div>
        <div className="ui-agent-creator__shapes" role="group" aria-label="Avatar shape" onPointerDown={event => startDrag(event, 'shape')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { drag.current = null; }} onKeyDown={event => { if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return; event.preventDefault(); const next = (shapeIndex + (event.key === 'ArrowRight' ? 1 : -1) + agentShapes.length) % agentShapes.length; chooseShape(next); event.currentTarget.querySelector<HTMLButtonElement>(`[data-shape="${agentShapes[next]}"]`)?.focus(); }}>
          {agentShapes.map((shape, index) => { const delta = (index - shapeIndex + 13) % 9 - 4; const angle = delta * .43; return <button type="button" key={shape} data-shape={shape} aria-label={`${shape[0].toUpperCase() + shape.slice(1)} shape`} aria-pressed={selectedShape === shape} tabIndex={selectedShape === shape ? 0 : -1} style={{ '--shape-x': `${Math.sin(angle) * 174}px`, '--shape-y': `${-(1 - Math.cos(angle)) * 150}px` } as CSSProperties} onClick={event => { if (!dragged.current || event.detail === 0) update({ shape }); }}><AgentAvatar shape={shape} color={current.color} showFace={false} /></button>; })}
        </div>
      </div>
      <div className="ui-agent-creator__colors" role="group" aria-label="Avatar colors"><ColorSwatchPicker className="ui-agent-creator__palette" aria-label="Avatar color" options={colors.map(({name,color})=>({label:`${name} avatar`,color}))} value={current.color} onValueChange={color=>update({color})} layout="row" size="small" appearance="gloss"/><label className="ui-agent-creator__custom-color" title="Custom avatar color"><input type="color" aria-label="Custom avatar color" value={current.color} onChange={event=>update({color:event.target.value})}/></label></div>
      <div className="ui-agent-creator__fields"><Input label="Name" maxLength={48} value={current.name} onChange={name => update({ name })} /><Input label="Label" maxLength={60} value={current.label} onChange={label => update({ label })} /><Textarea label="Description" rows={2} maxLength={500} value={current.description ?? ''} placeholder="Details for the agent" onChange={description => update({ description })} /></div>
      <div className="ui-agent-creator__preferences">
        <div className="ui-agent-creator__preference"><span><RiGlobalLine size={20} aria-hidden />Language</span><Select aria-label="Agent language" options={['Auto-detect', 'English', 'Türkçe', 'Deutsch'].map(label => ({ id: label, label }))} selectedKey={current.language} onSelectionChange={language => language && update({ language })} /></div>
        <Switch isSelected={current.notifications} onChange={notifications => update({ notifications })}><RiNotification3Line size={20} aria-hidden />Notifications</Switch>
        <div className="ui-agent-creator__preference"><span><RiVolumeUpLine size={20} aria-hidden />Voice</span><div><IconButton icon={RiPlayLine} aria-label="Preview voice" disabled={current.voice === 'Off'} onClick={previewVoice} /><Select aria-label="Agent voice" options={['Off', 'System voice', 'Calm', 'Bright', 'Focused'].map(label => ({ id: label, label }))} selectedKey={current.voice} onSelectionChange={voice => voice && update({ voice })} /></div></div>
        <div className="ui-agent-creator__speed"><span>Voice speed</span><SegmentedControl aria-label="Voice speed" options={[.75, 1, 1.25, 1.5].map(rate => ({ value: String(rate), label: `${rate}×` }))} value={String(current.voiceSpeed ?? 1)} onValueChange={speed => update({ voiceSpeed: Number(speed) })} /></div>
      </div>
    </div>
    {onSave && <footer><Button onClick={() => onSave(current)}>Save agent</Button></footer>}
  </section>;
}
