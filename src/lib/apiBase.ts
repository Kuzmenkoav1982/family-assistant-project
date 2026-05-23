/**
 * Central API base URL for new code.
 * Existing hardcoded call-sites are migrated separately in small batches.
 */

const DEFAULT_API_BASE_URL = 'https://functions.poehali.dev';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
);

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}
