import { Avatar } from '@/components/base/avatar/avatar';
import { cx } from '@/utils/cx';

export type ProfileCardData = { name: string; birthDate: string; gender: string; bloodType: string; doctor: string };

export function ProfileCard({ profile, className, headingLevel = 'h2' }: { profile: ProfileCardData; className?: string; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return <section className={cx('ui-dash-patient', className)}>
    <div className="ui-dash-patient__identity"><Avatar initials={profile.name.split(' ').map(part => part[0]).join('')} size="lg" alt={profile.name} /><Heading>{profile.name}</Heading></div>
    <div className="ui-dash-patient__details">{[['Date of Birth', profile.birthDate], ['Gender', profile.gender], ['Blood Type', profile.bloodType], ['GP Doctor', profile.doctor]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
  </section>;
}
