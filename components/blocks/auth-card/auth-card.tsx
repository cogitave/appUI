'use client';

import { useState, type ReactNode, type FormEvent } from 'react';
import { RiArrowLeftLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import { Input } from '@/components/base/input/input';
import { InputOTP } from '@/components/base/input-otp/input-otp';
import { SocialButton, type SocialProvider } from '@/components/base/social-button/social-button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { cx } from '@/utils/cx';

export type AuthCardMode = 'sign-in' | 'sign-up' | 'verify';
export type AuthCardProps = { mode?: AuthCardMode; onSubmit?: (data: FormData) => void; onVerify?: (code: string) => void; onProvider?: (provider: SocialProvider) => void; onModeChange?: (mode: AuthCardMode) => void; providers?: SocialProvider[]; artwork?: ReactNode; logo?: ReactNode; className?: string };

export function AuthCard({ mode = 'sign-in', onSubmit, onVerify, onProvider, onModeChange, providers = ['google','apple','github'], artwork, logo, className }: AuthCardProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [code, setCode] = useState('');
  const title = mode === 'sign-in' ? 'Welcome back' : mode === 'sign-up' ? 'Create your account' : 'Check your inbox';
  const subtitle = mode === 'sign-in' ? 'Sign in to pick up where you left off.' : mode === 'sign-up' ? 'A clearer place for your work starts here.' : 'Enter the code we sent to your email.';
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit?.(new FormData(event.currentTarget)); }
  return <div className={cx('ui-auth-card', artwork && 'ui-auth-card--split', className)}>{artwork && <div className="ui-auth-card__artwork">{artwork}</div>}<div className="ui-auth-card__content">{logo && <div className="ui-auth-card__logo">{logo}</div>}{mode === 'verify' && onModeChange && <button className="ui-auth-card__back" type="button" onClick={() => onModeChange('sign-in')}><RiArrowLeftLine size={16} aria-hidden /> Back to sign in</button>}<h2>{title}</h2><p>{subtitle}</p>{mode === 'verify' ? <div className="ui-auth-card__verify"><InputOTP value={code} onChange={setCode} onComplete={next => onVerify?.(next)} aria-label="Verification code" /><button type="button" disabled={code.length < 6} onClick={() => onVerify?.(code)}>Verify code</button></div> : <form onSubmit={submit}><Input name="email" label="Email" type="email" placeholder="you@company.com" isRequired /><div className="ui-auth-card__password"><Input name="password" label="Password" type={passwordVisible ? 'text' : 'password'} placeholder="Enter your password" isRequired /><button type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible(value => !value)}>{passwordVisible ? <RiEyeOffLine size={17} aria-hidden /> : <RiEyeLine size={17} aria-hidden />}</button></div>{mode === 'sign-up' && <Input name="name" label="Name" placeholder="Your name" isRequired />}<div className="ui-auth-card__options"><Checkbox name="remember" defaultSelected>Remember me</Checkbox>{mode === 'sign-in' && <button type="button" onClick={() => onModeChange?.('verify')}>Forgot password?</button>}</div><button className="ui-auth-card__submit" type="submit">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form>}{mode !== 'verify' && providers.length > 0 && <><div className="ui-auth-card__divider"><span>or continue with</span></div><div className="ui-auth-card__providers">{providers.map(provider => <SocialButton key={provider} provider={provider} onPress={() => onProvider?.(provider)} />)}</div></>}{onModeChange && <div className="ui-auth-card__switch">{mode === 'sign-in' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={() => onModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</button></div>}</div></div>;
}
