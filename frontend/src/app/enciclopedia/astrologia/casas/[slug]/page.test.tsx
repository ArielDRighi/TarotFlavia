import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import CasaDetailPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'primera-casa' }),
}));

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

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}));

vi.mock('remark-gfm', () => ({ default: vi.fn() }));

const mockUseArticle = vi.fn();

vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticle: (slug: string) => mockUseArticle(slug),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CasaDetailPage (/enciclopedia/astrologia/casas/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar ArticleDetailView cuando el artículo existe', () => {
    mockUseArticle.mockReturnValue({
      data: {
        id: 3,
        slug: 'primera-casa',
        nameEs: 'Primera Casa',
        nameEn: 'First House',
        category: 'astro_house',
        snippet: 'La casa del yo.',
        imageUrl: null,
        sortOrder: 1,
        content: '## Primera Casa',
        metadata: null,
        relatedArticles: [],
        relatedTarotCards: null,
      },
      isLoading: false,
      error: null,
    });

    render(<CasaDetailPage />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
  });

  it('debe retornar 404 para slug inexistente', () => {
    mockUseArticle.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<CasaDetailPage />);

    expect(screen.getByText('Artículo no encontrado')).toBeInTheDocument();
  });
});
