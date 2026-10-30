const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

/** Resolve application-owned assets and native links for subdirectory hosting. */
export function publicPath(path: string): string {
  if (!basePath || !path.startsWith('/') || path.startsWith('//') || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}
