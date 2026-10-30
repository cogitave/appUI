import type { ReactNode, CSSProperties } from 'react';
import { RiAmazonFill, RiAppleFill, RiDiscordFill, RiDropboxFill, RiFacebookFill, RiFigmaFill, RiGithubFill, RiGitlabFill, RiGlobalLine, RiGoogleFill, RiInstagramFill, RiLinkedinFill, RiMicrosoftFill, RiNotionFill, RiRedditFill, RiSlackFill, RiSpotifyFill, RiTelegramFill, RiTiktokFill, RiTwitchFill, RiTwitterXFill, RiWhatsappFill } from '@remixicon/react';
import type { IconComponent } from '@/components/foundations/icon-types';
import { cx } from '@/utils/cx';

const providers: Record<string, { label: string; color: string; icon?: IconComponent }> = {
  google: { label: 'Google', color: '#2678f5', icon: RiGoogleFill },
  apple: { label: 'Apple', color: '#111318', icon: RiAppleFill },
  github: { label: 'GitHub', color: '#111318', icon: RiGithubFill },
  gitlab: { label: 'GitLab', color: '#e96e30', icon: RiGitlabFill },
  microsoft: { label: 'Microsoft', color: '#4e6f98', icon: RiMicrosoftFill },
  x: { label: 'X', color: '#111318', icon: RiTwitterXFill },
  facebook: { label: 'Facebook', color: '#1877f2', icon: RiFacebookFill },
  linkedin: { label: 'LinkedIn', color: '#0a66c2', icon: RiLinkedinFill },
  discord: { label: 'Discord', color: '#5865f2', icon: RiDiscordFill },
  slack: { label: 'Slack', color: '#5b285f', icon: RiSlackFill },
  figma: { label: 'Figma', color: '#9b4cee', icon: RiFigmaFill },
  notion: { label: 'Notion', color: '#111318', icon: RiNotionFill },
  dropbox: { label: 'Dropbox', color: '#0061fe', icon: RiDropboxFill },
  spotify: { label: 'Spotify', color: '#16883b', icon: RiSpotifyFill },
  twitch: { label: 'Twitch', color: '#9146ff', icon: RiTwitchFill },
  reddit: { label: 'Reddit', color: '#ff4500', icon: RiRedditFill },
  tiktok: { label: 'TikTok', color: '#111318', icon: RiTiktokFill },
  instagram: { label: 'Instagram', color: '#d62976', icon: RiInstagramFill },
  telegram: { label: 'Telegram', color: '#229ed9', icon: RiTelegramFill },
  whatsapp: { label: 'WhatsApp', color: '#138c4a', icon: RiWhatsappFill },
  amazon: { label: 'Amazon', color: '#e48619', icon: RiAmazonFill },
  bitbucket: { label: 'Bitbucket', color: '#0052cc' },
  auth0: { label: 'Auth0', color: '#d95225' },
  okta: { label: 'Okta', color: '#007dc1' },
};

export type SocialProvider = keyof typeof providers;
export type SocialButtonProps = {
  provider?: SocialProvider;
  label?: string;
  logo?: ReactNode;
  color?: string;
  appearance?: 'brand' | 'neutral' | 'outline';
  size?: 'medium' | 'small';
  iconOnly?: boolean;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function SocialButton({ provider = 'google', label, logo, color, appearance = 'outline', size = 'medium', iconOnly = false, href, onPress, disabled = false, className }: SocialButtonProps) {
  const config = providers[provider];
  const name = label ?? config?.label ?? provider;
  const Icon = config?.icon;
  const style = { '--social-brand': color ?? config?.color ?? 'var(--accent-strong)' } as CSSProperties;
  const content = <>{logo ?? (Icon ? <Icon size={size === 'small' ? 17 : 19} aria-hidden /> : <span className="ui-social-button__monogram" aria-hidden="true">{name[0]}</span>)}{!iconOnly && <span>Continue with {name}</span>}</>;
  const common = { className: cx('ui-social-button', className), 'data-appearance': appearance, 'data-size': size, 'data-icon-only': iconOnly || undefined, style, 'aria-label': iconOnly ? `Continue with ${name}` : undefined };
  return href && !disabled ? <a {...common} href={href} onClick={onPress}>{content}</a> : <button {...common} type="button" disabled={disabled} onClick={onPress}>{content}</button>;
}

export const socialProviderNames = Object.keys(providers) as SocialProvider[];

export function SocialMark({ provider, size = 14, className }: { provider?: SocialProvider; size?: number; className?: string }) {
  const config = provider ? providers[provider] : undefined;
  const Icon = config?.icon ?? RiGlobalLine;
  const monochrome = provider === 'x' || provider === 'github' || provider === 'notion' || provider === 'apple' || provider === 'tiktok';
  return <Icon size={size} className={className} style={{ color: monochrome ? 'var(--text-main)' : config?.color ?? 'var(--text-muted)' }} aria-hidden />;
}
