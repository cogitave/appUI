'use client';

import { useId } from 'react';
import { cx } from '@/utils/cx';

export const agentShapes = ['petal', 'flower', 'star', 'heart', 'cloud', 'diamond', 'shield', 'slender', 'pocket'] as const;
export type AgentShape = typeof agentShapes[number] | 'spark';
export const agentEmotions = ['Neutral', 'Happy', 'Angry', 'Thinking', 'Shook', 'Curious', 'Wink', 'Sleepy', 'Sad', 'Worried', 'Skeptical', 'Focused', 'Excited', 'Calm', 'Shy', 'Confused'] as const;
export type AgentEmotion = typeof agentEmotions[number];

const paths: Record<AgentShape, string> = {
  cloud: 'M25 80C8 80 4 67 9 57C12 50 18 48 24 48C22 36 30 25 43 28C47 12 66 14 69 35C85 29 95 41 92 55C106 73 90 83 76 81Z',
  heart: 'M50 88C41 79 10 58 8 37C5 12 36 8 50 31C64 8 95 12 92 37C90 58 59 79 50 88Z',
  star: 'M44 13Q50 2 56 13L65 33L87 35Q100 36 91 46L76 61L80 85Q82 98 70 91L50 79L30 91Q18 98 20 85L24 61L9 46Q0 36 13 35L35 33Z',
  spark: 'M50 5Q56 37 94 50Q57 58 50 95Q39 60 6 50Q42 39 50 5Z',
  diamond: 'M44 9Q50 2 56 9L91 44Q98 50 91 56L56 91Q50 98 44 91L9 56Q2 50 9 44Z',
  shield: 'M50 6Q69 20 91 24L88 58Q84 81 50 94Q16 81 12 58L9 24Q31 20 50 6Z',
  petal: 'M50 8C69 0 84 21 73 37C101 35 105 61 80 68C88 96 60 105 50 80C36 104 12 90 20 67C-4 59 0 34 27 37C15 16 33 0 50 8Z',
  flower: 'M39 13C42 0 61 0 63 14C77 3 93 18 83 32C103 33 105 55 86 59C101 76 85 94 70 84C66 105 43 103 40 87C24 100 7 85 17 71C-3 69-3 45 14 41C1 26 18 8 32 19Z',
  slender: 'M43 7Q50 2 57 7L72 31L83 75Q88 96 69 94L50 85L31 94Q12 96 17 75L28 31Z',
  pocket: 'M17 12Q50 6 83 12L88 62Q88 83 50 94Q12 83 12 62Z',
};

export function AgentFace({ emotion = 'Thinking', className }: { emotion?: AgentEmotion; className?: string }) {
  const squint = ['Happy', 'Sleepy', 'Calm', 'Excited'].includes(emotion);
  const eyes = ['Shook', 'Curious', 'Worried', 'Confused'].includes(emotion) ? 16 : 14;
  const frown = ['Sad', 'Worried', 'Angry'].includes(emotion);
  return <svg className={cx('ui-agent-face', className)} viewBox="0 0 100 100" aria-hidden="true" fill="#202125" stroke="#202125" strokeLinecap="round">
    {squint ? <path d="M24 51Q31 43 38 51M60 51Q67 43 74 51" fill="none" strokeWidth="7" /> : <><ellipse cx="31" cy="49" rx="7" ry={eyes} stroke="none" /><ellipse cx="67" cy="49" rx="7" ry={emotion === 'Wink' ? 2 : eyes} stroke="none" /></>}
    {!['Neutral', 'Happy', 'Calm', 'Shy'].includes(emotion) && <path d={emotion === 'Angry' || emotion === 'Focused' ? 'M22 30L40 36M59 36L77 30' : emotion === 'Thinking' || emotion === 'Skeptical' ? 'M23 30Q32 27 40 30M59 31L77 35' : 'M23 33Q31 23 40 30M59 30Q68 23 77 33'} fill="none" strokeWidth="3" opacity=".75" />}
    {emotion === 'Shook' || emotion === 'Excited' ? <ellipse cx="50" cy="73" rx="5" ry="7" stroke="none" /> : emotion !== 'Thinking' && emotion !== 'Focused' && <path d={frown ? 'M41 74Q50 67 59 74' : 'M42 71Q50 78 58 71'} fill="none" strokeWidth="3" />}
  </svg>;
}

/** Code-native paper avatar shared by the editor, shape chooser and agent tabs. */
export function AgentAvatar({ shape = 'cloud', emotion = 'Thinking', color = '#f3bca5', showFace = true, className }: { shape?: AgentShape; emotion?: AgentEmotion; color?: string; showFace?: boolean; className?: string }) {
  const id = useId().replaceAll(':', '');
  const path = paths[shape];
  return <span className={cx('ui-agent-avatar', className)} style={{ '--agent-color': color } as React.CSSProperties}>
    <svg viewBox="0 0 108 108" aria-hidden="true">
      <defs><filter id={`${id}-paper`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="7" result="noise" /><feColorMatrix in="noise" type="saturate" values="0" /><feComposite in2="SourceGraphic" operator="in" /><feBlend in="SourceGraphic" mode="soft-light" /></filter></defs>
      <path d={path} transform="translate(5 5)" fill="color-mix(in srgb, var(--agent-color) 72%, #844221)" />
      <path d={path} transform="translate(2 2)" fill="var(--agent-color)" stroke="color-mix(in srgb, var(--agent-color) 75%, #844221)" strokeWidth=".7" />
      <path d={path} transform="translate(2 2)" fill="var(--agent-color)" filter={`url(#${id}-paper)`} opacity=".24" />
    </svg>
    {showFace && <AgentFace emotion={emotion} />}
  </span>;
}
