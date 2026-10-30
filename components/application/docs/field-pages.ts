export const fieldPages = {
  field: {
    title:'Field',group:'Base',
    description:'Responsive form layout around shared controls, with their existing labels, descriptions and validation intact. Group columns follow their container; fieldsets provide legends and inherited disabled state.',
    sections:['Preview','Orientation','Columns and density','Fieldset appearances','Validation','Disabled groups','Narrow surfaces','Right to left'],
    snippet:`<FieldSet legend="Profile" description="Visible to your workspace.">\n  <FieldGroup>\n    <Field orientation="responsive">\n      <Input label="Name" name="name" isRequired />\n    </Field>\n    <Field orientation="responsive">\n      <Select label="Visibility" options={visibilityOptions} />\n    </Field>\n  </FieldGroup>\n</FieldSet>`,
  },
} as const;
export type FieldSlug=keyof typeof fieldPages;
export function isFieldSlug(slug:string):slug is FieldSlug{return Object.hasOwn(fieldPages,slug);}
