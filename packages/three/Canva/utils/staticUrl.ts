/**
 * Resolve a public asset path against Vite's base URL.
 * Always use this instead of NODE_ENV ternary `/static` vs `/degital-twin-3d/static`.
 */
export function staticUrl(path: string): string {
  const base =
    (typeof import.meta !== 'undefined' &&
      (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL) ||
    '/degital-twin-3d/';
  const normalized = path.replace(/^\//, '');
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1');
}
