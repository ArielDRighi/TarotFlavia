import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBaseUrl } from './base-url';

describe('getBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve la URL configurada', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com');

    expect(getBaseUrl()).toBe('https://auguriatarot.com');
  });

  it('normaliza la barra final: pegar el dominio con "/" en Railway no debe romper las URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com/');

    // Sin esto: `https://auguriatarot.com//opengraph-image` y las 178 URLs del sitemap con `//`
    expect(getBaseUrl()).toBe('https://auguriatarot.com');
  });

  it('cae a localhost fuera de producción', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    expect(getBaseUrl()).toBe('http://localhost:3001');
  });
});
