import type { NextConfig } from 'next';

const staticExport = process.env.APPUI_STATIC_EXPORT === 'true';
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

const config: NextConfig = {
  agentRules: false,
  ...(basePath ? { basePath } : {}),
  ...(staticExport ? { output: 'export' as const, trailingSlash: true, images: { unoptimized: true } } : {}),
  ...(process.env.APPUI_BUILD_DIR ? { distDir: process.env.APPUI_BUILD_DIR } : {}),
  devIndicators: false,
};

export default config;
