import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import ElementoDetailPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'fuego' }),
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

describe('ElementoDetailPage (/enciclopedia/elementos/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar ArticleDetailView cuando el artículo existe', () => {
    mockUseArticle.mockReturnValue({
      data: {
        id: 5,
        slug: 'fuego',
        nameEs: 'Fuego',
        nameEn: 'Fire',
        category: 'element',
        snippet: 'El elemento del fuego.',
        imageUrl: null,
        sortOrder: 1,
        content: '## Fuego',
        metadata: null,
        relatedArticles: [],
        relatedTarotCards: null,
      },
      isLoading: false,
      error: null,
    });

    render(<ElementoDetailPage />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
  });

  it('debe retornar 404 para slug inexistente', () => {
    mockUseArticle.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<ElementoDetailPage />);

    expect(screen.getByText('Artículo no encontrado')).toBeInTheDocument();
  });
});
