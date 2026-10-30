import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppearanceInitializer } from '@/components/foundations/appearance-initializer';
import { publicPath } from '@/config/deployment';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], axes: ['opsz'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-source' });

export const metadata: Metadata = {
  title: 'appUI · Components',
  description: 'Components and foundations for the appUI design system.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body style={{ '--appui-profile-cover': `url("${publicPath('/carousel/coral-arch.webp')}")` } as CSSProperties}>
        <AppearanceInitializer />
        {children}
      </body>
    </html>
  );
}
