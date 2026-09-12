import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { buildSitemap } from './sitemap';
import { STATIC_PAGE_METADATA } from './page-metadata';

vi.mock('@/lib/api/encyclopedia-api', () => ({
  getCards: vi.fn(),
}));

vi.mock('@/lib/api/encyclopedia-articles-api', () => ({
  getArticlesByCategory: vi.fn(),
}));

vi.mock('@/lib/api/rituals-api', () => ({
  getRituals: vi.fn(),
}));

vi.mock('@/lib/api/holistic-services-api', () => ({
  getHolisticServices: vi.fn(),
}));

import { getCards } from '@/lib/api/encyclopedia-api';
import { getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getRituals } from '@/lib/api/rituals-api';
import { getHolisticServices } from '@/lib/api/holistic-services-api';

const mockGetCards = vi.mocked(getCards);
const mockGetArticlesByCategory = vi.mocked(getArticlesByCategory);
const mockGetRituals = vi.mocked(getRituals);
const mockGetHolisticServices = vi.mocked(getHolisticServices);

/** Devuelve solo los paths (sin el origen) para aseverar sin acoplarse al dominio. */
function pathsOf(entries: Awaited<ReturnType<typeof buildSitemap>>): string[] {
  return entries.map((entry) => new URL(entry.url).pathname);
}

describe('buildSitemap', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com');

    mockGetCards.mockResolvedValue([]);
    mockGetArticlesByCategory.mockResolvedValue([]);
    mockGetRituals.mockResolvedValue([]);
    mockGetHolisticServices.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('rutas estáticas', () => {
    it('incluye la landing y las páginas públicas', async () => {
      const paths = pathsOf(await buildSitemap());

      expect(paths).toContain('/');
      expect(paths).toContain('/enciclopedia');
      expect(paths).toContain('/horoscopo');
      expect(paths).toContain('/horoscopo-chino');
      expect(paths).toContain('/servicios');
      expect(paths).toContain('/rituales');
      expect(paths).toContain('/contacto');
      expect(paths).toContain('/privacidad');
    });

    it('incluye /sobre-nosotros: es de las que más queremos indexar (T-SEO-011)', async () => {
      const paths = pathsOf(await buildSitemap());

      expect(paths).toContain('/sobre-nosotros');
    });

    it('NO incluye rutas privadas ni sin valor de búsqueda', async () => {
      const paths = pathsOf(await buildSitemap());

      expect(paths).not.toContain('/perfil');
      expect(paths).not.toContain('/historial');
      expect(paths).not.toContain('/admin');
      expect(paths).not.toContain('/login');
      expect(paths).not.toContain('/registro');
      expect(paths).not.toContain('/mis-servicios');
      expect(paths).not.toContain('/premium/activacion');
    });

    it('⚠️ T-SEO-015: /premium tiene noindex, así que no puede estar en el sitemap', async () => {
      const paths = pathsOf(await buildSitemap());

      expect(paths).not.toContain('/premium');
    });

    it('T-SEO-015: las siete páginas de herramientas y contacto están en el sitemap', async () => {
      const paths = pathsOf(await buildSitemap());

      for (const path of [
        '/carta-del-dia',
        '/horoscopo',
        '/rituales',
        '/pendulo',
        '/numerologia',
        '/carta-astral',
        '/contacto',
      ]) {
        expect(paths).toContain(path);
      }
    });

    it('usa el dominio de NEXT_PUBLIC_APP_URL como origen', async () => {
      const entries = await buildSitemap();

      entries.forEach((entry) =>
        expect(entry.url.startsWith('https://auguriatarot.com/')).toBe(true)
      );
    });
  });

  describe('horóscopos (constantes locales, sin API)', () => {
    it('incluye los 12 signos y los 12 animales', async () => {
      const paths = pathsOf(await buildSitemap());

      const signos = paths.filter((path) => path.startsWith('/horoscopo/'));
      const animales = paths.filter((path) => path.startsWith('/horoscopo-chino/'));

      expect(signos).toHaveLength(12);
      expect(animales).toHaveLength(12);
      expect(paths).toContain('/horoscopo/aries');
      expect(paths).toContain('/horoscopo-chino/rat');
    });
  });

  describe('enciclopedia (desde la API)', () => {
    it('incluye las cartas en su URL canónica /enciclopedia/tarot/[slug]', async () => {
      mockGetCards.mockResolvedValue([{ slug: 'the-fool' }, { slug: 'the-magician' }] as Awaited<
        ReturnType<typeof getCards>
      >);

      const paths = pathsOf(await buildSitemap());

      expect(paths).toContain('/enciclopedia/tarot/the-fool');
      expect(paths).toContain('/enciclopedia/tarot/the-magician');
      // La ruta duplicada nunca entra al sitemap
      expect(paths).not.toContain('/enciclopedia/the-fool');
    });

    it('mapea cada categoría de artículo a su ruta real', async () => {
      mockGetArticlesByCategory.mockImplementation(async (category) => {
        const slugByCategory: Partial<Record<ArticleCategory, string>> = {
          [ArticleCategory.ZODIAC_SIGN]: 'aries',
          [ArticleCategory.PLANET]: 'venus',
          [ArticleCategory.ASTROLOGICAL_HOUSE]: 'casa-1',
          [ArticleCategory.ELEMENT]: 'fuego',
          [ArticleCategory.GUIDE_TAROT]: 'como-leer-el-tarot',
        };
        const slug = slugByCategory[category];
        return (slug ? [{ slug }] : []) as Awaited<ReturnType<typeof getArticlesByCategory>>;
      });

      const paths = pathsOf(await buildSitemap());

      expect(paths).toContain('/enciclopedia/astrologia/signos/aries');
      expect(paths).toContain('/enciclopedia/astrologia/planetas/venus');
      expect(paths).toContain('/enciclopedia/astrologia/casas/casa-1');
      expect(paths).toContain('/enciclopedia/elementos/fuego');
      expect(paths).toContain('/enciclopedia/guias/como-leer-el-tarot');
    });
  });

  describe('rituales y servicios (desde la API)', () => {
    it('incluye el detalle de cada ritual y de cada servicio', async () => {
      mockGetRituals.mockResolvedValue([{ slug: 'luna-llena' }] as Awaited<
        ReturnType<typeof getRituals>
      >);
      mockGetHolisticServices.mockResolvedValue([{ slug: 'registros-akashicos' }] as Awaited<
        ReturnType<typeof getHolisticServices>
      >);

      const paths = pathsOf(await buildSitemap());

      expect(paths).toContain('/rituales/luna-llena');
      expect(paths).toContain('/servicios/registros-akashicos');
    });
  });

  describe('degradación cuando la API no responde en build', () => {
    it('no rompe el build: devuelve las estáticas y los horóscopos', async () => {
      mockGetCards.mockRejectedValue(new Error('API caída'));
      mockGetArticlesByCategory.mockRejectedValue(new Error('API caída'));
      mockGetRituals.mockRejectedValue(new Error('API caída'));
      mockGetHolisticServices.mockRejectedValue(new Error('API caída'));

      const entries = await buildSitemap();
      const paths = pathsOf(entries);

      expect(paths).toContain('/');
      expect(paths).toContain('/enciclopedia');
      expect(paths).toContain('/horoscopo/aries');
      expect(paths.some((path) => path.startsWith('/enciclopedia/tarot/'))).toBe(false);
    });

    it('la caída de una sección no se lleva puestas a las demás', async () => {
      mockGetCards.mockRejectedValue(new Error('API caída'));
      mockGetRituals.mockResolvedValue([{ slug: 'luna-llena' }] as Awaited<
        ReturnType<typeof getRituals>
      >);

      const paths = pathsOf(await buildSitemap());

      expect(paths).toContain('/rituales/luna-llena');
      expect(paths.some((path) => path.startsWith('/enciclopedia/tarot/'))).toBe(false);
    });
  });

  it('no emite lastModified: no hay fecha real de edición y una falsa es peor que ninguna (T-SEO-019)', async () => {
    mockGetCards.mockResolvedValue([{ slug: 'the-fool' }] as Awaited<ReturnType<typeof getCards>>);

    const entries = await buildSitemap();

    // Antes se estampaba `new Date()` del request en las 179 URLs: Google lo
    // ignora cuando todas cambian "al segundo" y se lee como generado sin criterio.
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
  });

  it('no emite URLs duplicadas', async () => {
    mockGetCards.mockResolvedValue([{ slug: 'the-fool' }] as Awaited<ReturnType<typeof getCards>>);

    const urls = (await buildSitemap()).map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('coherencia noindex ↔ sitemap (T-SEO-015)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://auguriatarot.com');
    vi.mocked(getCards).mockResolvedValue([]);
    vi.mocked(getArticlesByCategory).mockResolvedValue([]);
    vi.mocked(getRituals).mockResolvedValue([]);
    vi.mocked(getHolisticServices).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('⚠️ ninguna ruta estática con robots.index = false está en el sitemap', async () => {
    const paths = pathsOf(await buildSitemap());

    const noindexCanonicals = Object.values(STATIC_PAGE_METADATA)
      .filter((metadata) => {
        const robots = metadata.robots;
        return typeof robots === 'object' && robots !== null && robots.index === false;
      })
      .map((metadata) => metadata.alternates?.canonical)
      .filter((canonical): canonical is string => typeof canonical === 'string');

    // Si esta lista queda vacía el test no prueba nada: /premium tiene que estar.
    expect(noindexCanonicals).toContain('/premium');
    for (const canonical of noindexCanonicals) {
      expect(paths).not.toContain(canonical);
    }
  });
});
