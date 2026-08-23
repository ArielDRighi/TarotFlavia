import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ORGANIZATION_ID, buildAboutPageJsonLd, buildOrganizationJsonLd } from './structured-data';

/**
 * Datos estructurados del sitio (T-SEO-011).
 *
 * El Rich Results Test de Google no se puede correr en CI, así que estos tests
 * cubren lo que sí se puede verificar acá: el shape del JSON-LD, que las URLs
 * sean absolutas (Google descarta las relativas) y que `AboutPage` quede
 * enlazada al `Organization` del sitio por `@id` en lugar de duplicarlo.
 */

const BASE_URL = 'https://auguriatarot.com';

describe('structured-data', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', BASE_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('buildOrganizationJsonLd', () => {
    it('declara el contexto y el tipo que Google espera', () => {
      const jsonLd = buildOrganizationJsonLd();

      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('Organization');
    });

    it('usa un @id estable y absoluto para poder referenciarse desde otras páginas', () => {
      const jsonLd = buildOrganizationJsonLd();

      expect(jsonLd['@id']).toBe(`${BASE_URL}${ORGANIZATION_ID}`);
    });

    it('expone nombre, url, logo y descripción absolutos', () => {
      const jsonLd = buildOrganizationJsonLd();

      expect(jsonLd.name).toBe('Auguria');
      expect(jsonLd.url).toBe(`${BASE_URL}/`);
      expect(jsonLd.logo.url.startsWith(`${BASE_URL}/`)).toBe(true);
      expect(jsonLd.description.length).toBeGreaterThan(50);
    });

    it('declara las áreas de conocimiento del equipo (señal E-E-A-T)', () => {
      const jsonLd = buildOrganizationJsonLd();

      expect(jsonLd.knowsAbout.length).toBeGreaterThanOrEqual(3);
      expect(jsonLd.knowsAbout).toContain('Tarot');
    });

    it('⚠️ no declara ninguna persona: el sitio se presenta como equipo', () => {
      expect(JSON.stringify(buildOrganizationJsonLd())).not.toMatch(/"Person"|Flavia/i);
    });
  });

  describe('buildAboutPageJsonLd', () => {
    it('declara el tipo AboutPage con su URL canónica absoluta', () => {
      const jsonLd = buildAboutPageJsonLd();

      expect(jsonLd['@type']).toBe('AboutPage');
      expect(jsonLd.url).toBe(`${BASE_URL}/sobre-nosotros`);
    });

    it('enlaza al Organization del sitio por @id en vez de duplicarlo', () => {
      const jsonLd = buildAboutPageJsonLd();

      expect(jsonLd.about['@id']).toBe(`${BASE_URL}${ORGANIZATION_ID}`);
      expect(jsonLd.publisher['@id']).toBe(`${BASE_URL}${ORGANIZATION_ID}`);
    });

    it('lleva nombre y descripción propios, distintos de los del Organization', () => {
      const aboutPage = buildAboutPageJsonLd();
      const organization = buildOrganizationJsonLd();

      expect(aboutPage.name.length).toBeGreaterThan(0);
      expect(aboutPage.description).not.toBe(organization.description);
    });

    it('sirve en español, que es el idioma del sitio', () => {
      expect(buildAboutPageJsonLd().inLanguage).toBe('es');
    });
  });

  it('emite JSON serializable: es lo que termina dentro del <script>', () => {
    expect(() => JSON.stringify(buildOrganizationJsonLd())).not.toThrow();
    expect(() => JSON.stringify(buildAboutPageJsonLd())).not.toThrow();
  });
});
