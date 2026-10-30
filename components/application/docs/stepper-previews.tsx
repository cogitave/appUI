'use client';

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Stepper, type StepperStep } from '@/components/base/stepper/stepper';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Alert } from '@/components/base/alert/alert';
import { Button } from '@/components/base/buttons/button';
import { Card } from '@/components/base/card/card';
import { Input } from '@/components/base/input/input';
import { Questionnaire, type Question } from '@/components/blocks/questionnaire/questionnaire';
import { DocExampleSection as Section } from './doc-example-section';

function PanelPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present} aria-hidden={!present || undefined}>{children}</div>;
}
function WorkspaceSetup() {
  const [current, setCurrent] = useState('workspace');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savedName, setSavedName] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [created, setCreated] = useState(false);
  const panelId = useId();
  const input = useRef<HTMLInputElement>(null), create = useRef<HTMLButtonElement>(null), focusNext = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    (current === 'review' ? create.current : input.current)?.focus({ preventScroll: true });
  }, [current]);
  useLayoutEffect(() => {
    if (created) root.current?.querySelector<HTMLButtonElement>('.ui-stepper [aria-current="step"]')?.focus({ preventScroll: true });
  }, [created]);
  function advance(key: string) { focusNext.current = true; setCurrent(key); }
  const reduced = useReducedMotion();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const steps: StepperStep[] = [
    { id: 'workspace', label: 'Workspace', controls: panelId, description: 'Give your team a home', status: savedName ? 'complete' : 'pending' },
    { id: 'team', label: 'Team', controls: panelId, description: 'Invite someone to join', isOptional: true, isDisabled: !savedName, status: savedEmail ? 'complete' : 'pending' },
    { id: 'review', label: 'Review', controls: panelId, description: 'Check the details', isDisabled: !savedName, status: created ? 'complete' : 'pending' },
  ];
  return <div ref={root} className="docs-stepper-demo" data-demo="stepper-main"><Stepper steps={steps} selectedKey={current} onSelectionChange={setCurrent} aria-label="Workspace setup"/>
    <Card padding="none"><AnimatedHeight><div id={panelId} role="region" aria-label={steps.find(step => step.id === current)?.label} className="docs-stepper-panel-host"><AnimatePresence initial={false} mode="popLayout"><motion.div key={`${current}-${created ? 'complete' : 'edit'}`} initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : .16 }}><PanelPresence><div className="docs-stepper-panel">
      {current === 'workspace' ? <><Input inputRef={input} label="Workspace name" placeholder="Studio team" value={name} onChange={setName}/><div className="docs-stepper-actions"><Button size="small" disabled={!name.trim()} onClick={() => { setSavedName(name.trim()); setCreated(false); advance('team'); }}>Save and continue</Button></div></> : current === 'team' ? <><Input inputRef={input} label="Teammate email" type="email" placeholder="name@example.com" hint="You can invite someone later." value={email} onChange={setEmail}/><div className="docs-stepper-actions"><Button size="small" variant="secondary" onClick={() => advance('workspace')}>Previous</Button><Button size="small" disabled={Boolean(email.trim()) && !validEmail} onClick={() => { setSavedEmail(validEmail ? email.trim() : ''); advance('review'); }}>Continue</Button></div></> : <>
        {created ? <Alert role="status" tone="success" title="Your workspace is ready" description={`${savedName} has been created.`}/> : <><div><h3>{savedName}</h3><p className="docs-extended-note">{savedEmail ? `Invite ${savedEmail}` : 'No teammate added yet.'}</p></div><div className="docs-stepper-actions"><Button size="small" variant="secondary" onClick={() => advance('team')}>Previous</Button><Button ref={create} size="small" onClick={() => setCreated(true)}>Create workspace</Button></div></>}
      </>}
    </div></PanelPresence></motion.div></AnimatePresence></div></AnimatedHeight></Card>
  </div>;
}
const exampleSteps: StepperStep[] = [
  { id: 'details', label: 'Details', status: 'complete' },
  { id: 'preferences', label: 'Preferences', isOptional: true },
  { id: 'review', label: 'Review' },
];
function LabelsDemo() {
  const [current, setCurrent] = useState('details');
  return <div className="docs-stepper-demo" data-demo="stepper-labels"><Stepper steps={exampleSteps} selectedKey={current} onSelectionChange={setCurrent} variant="labels" aria-label="Profile steps"/><p className="docs-extended-note" role="status">{exampleSteps.find(step => step.id === current)?.label} selected.</p></div>;
}
const questions: Question[] = [
  { id: 'intent', prompt: 'What would you like to make?', type: 'single', options: [{ id: 'product', label: 'A product interface' }, { id: 'workflow', label: 'A workflow' }], allowOther: true, stepLabel: 'Goal' },
  { id: 'tools', prompt: 'Which tools do you use?', type: 'multiple', options: [{ id: 'design', label: 'Design tools' }, { id: 'editor', label: 'Code editor' }, { id: 'docs', label: 'Documentation' }], stepLabel: 'Tools' },
  { id: 'priority', prompt: 'What matters most?', type: 'single', options: [{ id: 'clarity', label: 'Clarity' }, { id: 'craft', label: 'Craft' }], stepLabel: 'Focus' },
];
function QuestionnaireDemo() {
  const [complete, setComplete] = useState(false);
  return <div className="docs-stepper-demo" data-demo="stepper-questionnaire"><Questionnaire questions={questions} onComplete={() => setComplete(true)}/>{complete && <p role="status" className="docs-extended-note">Answers saved.</p>}</div>;
}
export function StepperPreview() { return <WorkspaceSetup/>; }
export function StepperExamples() { return <>
  <Section title="Labels" description="The selected label moves smoothly without remounting its button. Arrow keys move focus; Enter or Space selects a step."><LabelsDemo/></Section>
  <Section title="Vertical" description="Vertical steps support long labels, optional tasks, errors and disabled destinations."><div className="docs-stepper-demo" data-demo="stepper-vertical"><Stepper orientation="vertical" defaultSelectedKey="preferences" aria-label="Review flow" steps={[...exampleSteps.slice(0,2).map(step => step.id === 'preferences' ? {...step,status:'error' as const,description:'Choose a notification preference.'} : step),{id:'approval',label:'Approval',description:'Waiting for the workspace owner.',isDisabled:true},{id:'summary',label:'Summary'}]}/></div></Section>
  <Section title="Read only" description="Use a non-interactive tracker when navigation belongs elsewhere. Selection and completion remain separate."><div className="docs-stepper-demo" data-demo="stepper-readonly"><Stepper steps={exampleSteps} selectedKey="preferences" isReadOnly aria-label="Setup progress"/></div></Section>
  <Section title="In Questionnaire" description="Questionnaire uses the same label navigation and keeps answered steps distinct from the current step. The question and its surrounding height animate together."><QuestionnaireDemo/></Section>
</>; }
