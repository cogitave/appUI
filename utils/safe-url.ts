/** Permit web links and application paths without accepting script protocols. */
export function safeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try { return new URL(trimmed).href; } catch { return undefined; }
  }
  if (/^[\/#]/.test(trimmed) && !/^\/\//.test(trimmed) && !/[\u0000-\u001f\\]/.test(trimmed)) return trimmed;
  return undefined;
}

export function urlHostname(value: string | undefined) {
  try { return new URL(value ?? '').hostname.replace(/^www\./, ''); } catch { return undefined; }
}
