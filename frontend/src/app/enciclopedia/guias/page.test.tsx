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
});
