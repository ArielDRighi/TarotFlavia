import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import GuiasPage from './page';
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

// Mock next/image (render a plain img so we can assert src/alt)
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
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
  category: ArticleCategory
): ArticleSummary {
  return {
    id,
    slug,
    nameEs,
    category,
    snippet: `Descripción de ${nameEs}`,
    imageUrl: null,
    sortOrder: id,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GuiasPage (/enciclopedia/guias)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el listado de guías cuando hay datos', () => {
    const guias = [
      buildGuideArticle(
        1,
        'guia-numerologia',
        'Guía de Numerología',
        ArticleCategory.GUIDE_NUMEROLOGY
      ),
      buildGuideArticle(2, 'guia-pendulo', 'Guía del Péndulo', ArticleCategory.GUIDE_PENDULUM),
    ];
    // GuiasPage renders multiple categories — mock all to return empty except one
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_NUMEROLOGY) return { data: [guias[0]], isLoading: false };
      if (cat === ArticleCategory.GUIDE_PENDULUM) return { data: [guias[1]], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    expect(screen.getByText('Guía de Numerología')).toBeInTheDocument();
    expect(screen.getByText('Guía del Péndulo')).toBeInTheDocument();
  });

  it('links de guías deben apuntar a la ruta /enciclopedia/guias/[slug]', () => {
    const guias = [
      buildGuideArticle(
        1,
        'guia-numerologia',
        'Guía de Numerología',
        ArticleCategory.GUIDE_NUMEROLOGY
      ),
    ];
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_NUMEROLOGY) return { data: [guias[0]], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    const link = screen.getByRole('link', { name: /guía de numerología/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/guias/guia-numerologia');
  });

  it('debe incluir la Guía del Tarot en el listado', () => {
    const tarotGuide = buildGuideArticle(
      10,
      'guia-tarot',
      'Guía del Tarot',
      ArticleCategory.GUIDE_TAROT
    );
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_TAROT) return { data: [tarotGuide], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    const link = screen.getByRole('link', { name: /guía del tarot/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/guias/guia-tarot');
  });

  it('debe consultar la categoría GUIDE_TAROT y ubicarla primera', () => {
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false });

    renderWithProviders(<GuiasPage />);

    const requestedCategories = mockUseArticlesByCategory.mock.calls.map((call) => call[0]);
    expect(requestedCategories).toContain(ArticleCategory.GUIDE_TAROT);
    expect(requestedCategories[0]).toBe(ArticleCategory.GUIDE_TAROT);
  });

  it('debe renderizar la tarjeta de la Guía del Tarot con thumbnail temático e imagen con alt', () => {
    const tarotGuide = buildGuideArticle(
      10,
      'guia-tarot',
      'Guía del Tarot',
      ArticleCategory.GUIDE_TAROT
    );
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_TAROT) return { data: [tarotGuide], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('src', expect.stringContaining('guia-tarot-hero.webp'));
    expect(image).toHaveAccessibleName(expect.stringMatching(/tarot/i));
  });

  it('debe mostrar un chip de categoría dorado y el CTA "Leer guía"', () => {
    const tarotGuide = buildGuideArticle(
      10,
      'guia-tarot',
      'Guía del Tarot',
      ArticleCategory.GUIDE_TAROT
    );
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_TAROT) return { data: [tarotGuide], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    expect(screen.getByText('Tarot')).toBeInTheDocument();
    expect(screen.getByText(/leer guía/i)).toBeInTheDocument();
  });

  it('debe usar texto oscuro sobre el chip dorado para contraste AA (T-ENC-009)', () => {
    const tarotGuide = buildGuideArticle(
      10,
      'guia-tarot',
      'Guía del Tarot',
      ArticleCategory.GUIDE_TAROT
    );
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_TAROT) return { data: [tarotGuide], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    // Cada guía renderiza su propio chip; el test fija un único guía mockeado,
    // pero usamos getAllByTestId para no romper si se añaden más guías.
    const [chip] = screen.getAllByTestId('guia-category-chip');
    expect(chip).toHaveClass('text-bg-hero');
    expect(chip).not.toHaveClass('text-secondary-foreground');
  });

  it('debe preferir el imageUrl del backend cuando está disponible', () => {
    const numerologyGuide: ArticleSummary = {
      ...buildGuideArticle(
        1,
        'guia-numerologia',
        'Guía de Numerología',
        ArticleCategory.GUIDE_NUMEROLOGY
      ),
      imageUrl: '/images/enciclopedia/guia-numerologia.webp',
    };
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_NUMEROLOGY)
        return { data: [numerologyGuide], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('src', '/images/enciclopedia/guia-numerologia.webp');
    expect(image).toHaveAccessibleName(expect.stringMatching(/guía de numerología/i));
  });

  it('debe renderizar el hero temático de la Guía de Numerología (T-ENC-011)', () => {
    const numerologyGuide = buildGuideArticle(
      1,
      'guia-numerologia',
      'Guía de Numerología',
      ArticleCategory.GUIDE_NUMEROLOGY
    );
    mockUseArticlesByCategory.mockImplementation((cat: ArticleCategory) => {
      if (cat === ArticleCategory.GUIDE_NUMEROLOGY)
        return { data: [numerologyGuide], isLoading: false };
      return { data: [], isLoading: false };
    });

    renderWithProviders(<GuiasPage />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('src', expect.stringContaining('guia-numerologia-hero.webp'));
    expect(screen.queryByTestId('guia-thumb-fallback')).not.toBeInTheDocument();
  });
});
