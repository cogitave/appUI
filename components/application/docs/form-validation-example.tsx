'use client';

import { useState } from 'react';
import { Form } from 'react-aria-components';
import { Alert } from '@/components/base/alert/alert';
import { AnimatedHeight } from '@/components/base/animated-height/animated-height';
import { Button } from '@/components/base/buttons/button';
import { ComboBox } from '@/components/base/combobox/combobox';
import { Input } from '@/components/base/input/input';
import { NumberField } from '@/components/base/number-field/number-field';
import { Select } from '@/components/base/select/select';
import { Textarea } from '@/components/base/textarea/textarea';

export function FormValidationExample() {
  const [saved,setSaved] = useState<Record<string,string>|null>(null);
  return <Form className="docs-field-form" data-demo="field-validation" aria-label="Project request" validationBehavior="native" onSubmit={event=>{event.preventDefault();setSaved(Object.fromEntries([...new FormData(event.currentTarget)].map(([key,value])=>[key,String(value)])));}}>
    <Input label="Contact email" type="email" name="email" isRequired/>
    <Textarea label="Project summary" name="summary" isRequired rows={2} showCount maxLength={200}/>
    <NumberField label="Seats" name="seats" isRequired minValue={1} maxValue={20}/>
    <ComboBox label="Team" name="team" isRequired options={[{id:'design',label:'Design'},{id:'engineering',label:'Engineering'}]}/>
    <Select label="Visibility" name="visibility" defaultSelectedKey="team" options={[{id:'team',label:'Team only'},{id:'private',label:'Private'}]}/>
    <Button type="submit">Save project request</Button>
    <AnimatedHeight>{saved && <Alert role="status" tone="success" title="Project request saved" description={`${saved.email} · ${saved.summary} · ${saved.seats} seats · ${saved.team} · ${saved.visibility}`}/>}</AnimatedHeight>
  </Form>;
}
