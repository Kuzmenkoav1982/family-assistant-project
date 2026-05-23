import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const MODULE_PATH = '../../src/lib/apiBase';
const DEFAULT_BASE = 'https://functions.poehali.dev';

async function loadModule(envValue: string | undefined) {
  vi.resetModules();
  vi.stubGlobal('import.meta', { env: { VITE_API_BASE_URL: envValue } });
  vi.stubEnv('VITE_API_BASE_URL', envValue ?? '');
  return import(MODULE_PATH);
}

describe('apiBase', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('falls back to default base URL when VITE_API_BASE_URL is not set', async () => {
    const mod = await loadModule(undefined);
    expect(mod.API_BASE_URL).toBe(DEFAULT_BASE);
  });

  it('normalizes trailing slashes in configured base URL', async () => {
    const mod = await loadModule('https://api.example.com///');
    expect(mod.API_BASE_URL).toBe('https://api.example.com');
  });

  it('apiUrl produces the same URL with or without a leading slash in path', async () => {
    const mod = await loadModule('https://api.example.com');
    const a = mod.apiUrl('/users');
    const b = mod.apiUrl('users');
    expect(a).toBe('https://api.example.com/users');
    expect(b).toBe('https://api.example.com/users');
    expect(a).toBe(b);
  });
});
