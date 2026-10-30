import type { ComponentFamily } from './catalog-families';

export function FamilyDocumentation({ family }: { family: ComponentFamily }) {
  const term = family.kind === 'preset' ? 'Presets' : family.kind === 'composition' ? 'Compositions' : 'Components';
  return <section id="family" className="docs-example docs-family-info">
    <h2>{family.label} family</h2>
    <p>{family.description}</p>
    <dl>
      <div><dt>{term}</dt><dd>{family.members.map(member => member.label).join(' · ')}</dd></div>
      <div><dt>Shared building blocks</dt><dd>{family.shared.join(' · ')}</dd></div>
      <div><dt>Configuration</dt><dd>{family.configuration}</dd></div>
    </dl>
  </section>;
}
