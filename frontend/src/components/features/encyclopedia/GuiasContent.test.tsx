import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { GuiasContent, GuiaCard, resolveThumbnail } from './GuiasContent';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    'data-testid': dataTestId,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    'data-testid'?: string;
  } & Record<string, unknown>) => (
    <a href={href} data-testid={dataTestId} {...rest}>
      {children}
    </a>
  ),
}));

// Mock next/image: render a plain img so we can assert src/alt.
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

// Mock Reveal so the IntersectionObserver-driven wrapper renders children directly.
vi.mock('@/components/common', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseArticlesByCategory = vi.fn();

vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticlesByCategory: (category: ArticleCategory) => mockUseArticlesByCategory(category),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function buildGuideArticle(
  id: number,
  slug: string,
  nameEs: string,
  category: ArticleCategory,
  imageUrl: string | null = null
): ArticleSummary {
  return {
    id,
    slug,
    nameEs,
    category,
    snippet: `Descripción de ${nameEs}`,
    imageUrl,
    sortOrder: id,
  };
}

/**
 * Expected per-guide thumbnail asset (each guide reuses its own hero), in the
 * canonical display order. Tarot stays first (BUG-017).
 */
const GUIDE_ASSETS: ReadonlyArray<[ArticleCategory, string, string]> = [
  [ArticleCategory.GUIDE_TAROT, 'guia-tarot', 'guia-tarot-hero.webp'],
  [ArticleCategory.GUIDE_NUMEROLOGY, 'guia-numerologia', 'guia-numerologia-hero.webp'],
  [ArticleCategory.GUIDE_PENDULUM, 'guia-pendulo', 'guia-pendulo-hero.webp'],
  [ArticleCategory.GUIDE_BIRTH_CHART, 'guia-carta-astral', 'guia-carta-astral-hero.webp'],
  [ArticleCategory.GUIDE_RITUAL, 'guia-rituales', 'guia-rituales-hero.webp'],
  [ArticleCategory.GUIDE_HOROSCOPE, 'guia-horoscopo', 'guia-horoscopo-hero.webp'],
  [ArticleCategory.GUIDE_CHINESE, 'guia-horoscopo-chino', 'guia-horoscopo-chino-hero.webp'],
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GuiasContent — thumbnails de guías (T-ENC-011)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cada guía renderiza su propio hero como thumbnail (src), eliminando el fallback', () => {
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      const entry = GUIDE_ASSETS.find(([category]) => category === cat);
      if (!entry) return { data: [], isLoading: false };
      const [, slug] = entry;
      return {
        data: [buildGuideArticle(entry[0].length, slug, `Guía ${slug}`, cat)],
        isLoading: false,
      };
    });

    renderWithProviders(<GuiasContent />);

    const images = screen.getAllByTestId('next-image');
    expect(images).toHaveLength(GUIDE_ASSETS.length);

    const srcs = images.map((img) => img.getAttribute('src'));
    for (const [, , asset] of GUIDE_ASSETS) {
      expect(srcs.some((src) => src?.includes(asset))).toBe(true);
    }

    // El fallback decorativo ya no debe aparecer cuando todas las guías tienen imagen.
    expect(screen.queryByTestId('guia-thumb-fallback')).not.toBeInTheDocument();
  });

  it.each(GUIDE_ASSETS)(
    'la guía %s muestra su hero con alt en español y href correcto',
    (category, slug, asset) => {
      mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
        if (cat === category) {
          return { data: [buildGuideArticle(1, slug, `Guía ${slug}`, category)], isLoading: false };
        }
        return { data: [], isLoading: false };
      });

      renderWithProviders(<GuiasContent />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', expect.stringContaining(asset));
      // alt no vacío (texto descriptivo en español).
      expect(image.getAttribute('alt')).toBeTruthy();

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', `/enciclopedia/guias/${slug}`);
    }
  );

  it('conserva el orden: la Guía del Tarot se consulta y renderiza primera', () => {
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      const entry = GUIDE_ASSETS.find(([category]) => category === cat);
      if (!entry) return { data: [], isLoading: false };
      const [, slug] = entry;
      return { data: [buildGuideArticle(1, slug, slug, cat)], isLoading: false };
    });

    renderWithProviders(<GuiasContent />);

    const requested = mockUseArticlesByCategory.mock.calls.map((call) => call[0]);
    expect(requested[0]).toBe(ArticleCategory.GUIDE_TAROT);

    const firstImage = screen.getAllByTestId('next-image')[0];
    expect(firstImage).toHaveAttribute('src', expect.stringContaining('guia-tarot-hero.webp'));
  });
});

describe('resolveThumbnail (T-ENC-011)', () => {
  it('prioriza el imageUrl del backend cuando está disponible', () => {
    const article = buildGuideArticle(
      1,
      'guia-numerologia',
      'Guía de Numerología',
      ArticleCategory.GUIDE_NUMEROLOGY,
      '/images/enciclopedia/backend-override.webp'
    );
    const theme = { chip: 'Numerología', image: { src: '/x.webp', alt: 'tema' } };

    const result = resolveThumbnail(article, theme);

    expect(result).toEqual({
      src: '/images/enciclopedia/backend-override.webp',
      alt: expect.stringContaining('Guía de Numerología'),
    });
  });

  it('usa el asset temático de la categoría cuando no hay imageUrl del backend', () => {
    const article = buildGuideArticle(
      1,
      'guia-numerologia',
      'Guía de Numerología',
      ArticleCategory.GUIDE_NUMEROLOGY
    );
    const theme = { chip: 'Numerología', image: { src: '/tema.webp', alt: 'tema' } };

    expect(resolveThumbnail(article, theme)).toEqual({ src: '/tema.webp', alt: 'tema' });
  });

  it('devuelve null cuando el tema no tiene imagen (red de seguridad → fallback)', () => {
    const article = buildGuideArticle(1, 'guia-x', 'Guía X', ArticleCategory.GUIDE_NUMEROLOGY);
    const theme = { chip: 'Guía' };

    expect(resolveThumbnail(article, theme)).toBeNull();
  });
});

describe('GuiaCard — red de seguridad (T-ENC-011)', () => {
  it('muestra el fallback decorativo ✦ cuando la categoría no tiene tema con imagen', () => {
    // ZODIAC_SIGN no es una guía → getGuideTheme devuelve { chip: "Guía" } sin imagen.
    const article = buildGuideArticle(1, 'algo', 'Algo', ArticleCategory.ZODIAC_SIGN);

    renderWithProviders(<GuiaCard article={article} />);

    expect(screen.getByTestId('guia-thumb-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });
});
