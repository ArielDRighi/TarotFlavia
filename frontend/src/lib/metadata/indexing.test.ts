import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTION_HOSTS, isIndexingAllowed } from './indexing';

describe('isIndexingAllowed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('permite indexar en el dominio productivo', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com');

    expect(isIndexingAllowed()).toBe(true);
  });

  it('permite indexar en el www del dominio productivo', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://www.auguriatarot.com');

    expect(isIndexingAllowed()).toBe(true);
  });

  it('NO permite indexar en staging (es el bug que esta tarea arregla)', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://staging.auguriatarot.com');

    expect(isIndexingAllowed()).toBe(false);
  });

  it('NO permite indexar en desarrollo local', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3001');

    expect(isIndexingAllowed()).toBe(false);
  });

  it('NO permite indexar en un preview de Railway u otro host desconocido', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguria-frontend-production.up.railway.app');

    expect(isIndexingAllowed()).toBe(false);
  });

  it('es fail-closed: sin la variable seteada, no indexa', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    expect(isIndexingAllowed()).toBe(false);
  });

  it('es fail-closed: con una URL inválida, no indexa en vez de romper', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'no-es-una-url');

    expect(isIndexingAllowed()).toBe(false);
  });

  it('no se deja engañar por un host que contiene al productivo como sufijo', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://fake-auguriatarot.com.attacker.dev');

    expect(isIndexingAllowed()).toBe(false);
  });

  it('expone los hosts productivos como única fuente de verdad', () => {
    expect(PRODUCTION_HOSTS).toContain('auguriatarot.com');
    expect(PRODUCTION_HOSTS).toContain('www.auguriatarot.com');
  });
});
