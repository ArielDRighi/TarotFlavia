import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import GuiaDetailPage, { generateMetadata, generateStaticParams } from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'guia-numerologia' }),
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

const mockGetArticle = vi.fn();
const mockGetArticlesByCategory = vi.fn();

vi.mock('@/lib/api/encyclopedia-articles-api', () => ({
  getArticle: (slug: string) => mockGetArticle(slug),
  getArticlesByCategory: (category: string) => mockGetArticlesByCategory(category),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GuiaDetailPage (/enciclopedia/guias/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar ArticleDetailView cuando el artículo existe', () => {
    mockUseArticle.mockReturnValue({
      data: {
        id: 4,
        slug: 'guia-numerologia',
        nameEs: 'Guía de Numerología',
        nameEn: null,
        category: 'guide_numerology',
        snippet: 'Aprende sobre numerología.',
        imageUrl: null,
        sortOrder: 1,
        content: '## Guía de Numerología',
        metadata: null,
        relatedArticles: [],
        relatedTarotCards: null,
      },
      isLoading: false,
      error: null,
    });

    render(<GuiaDetailPage />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
  });

  it('debe retornar 404 para slug inexistente', () => {
    mockUseArticle.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<GuiaDetailPage />);

    expect(screen.getByText('Artículo no encontrado')).toBeInTheDocument();
  });
});

describe('generateMetadata (guias)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe incluir el nombre del artículo en title', async () => {
    mockGetArticle.mockResolvedValue({
      id: 4,
      slug: 'guia-numerologia',
      nameEs: 'Guía de Numerología',
      snippet: 'Aprende sobre numerología.',
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'guia-numerologia' }),
    });

    expect(metadata.title).toContain('Guía de Numerología');
    expect(metadata.title).toContain('Enciclopedia Mística');
  });

  it('debe usar snippet como description', async () => {
    const snippet = 'Aprende sobre numerología.';
    mockGetArticle.mockResolvedValue({
      id: 4,
      slug: 'guia-numerologia',
      nameEs: 'Guía de Numerología',
      snippet,
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'guia-numerologia' }),
    });

    expect(metadata.description).toBe(snippet);
  });

  it('debe incluir Open Graph tags', async () => {
    mockGetArticle.mockResolvedValue({
      id: 4,
      slug: 'guia-numerologia',
      nameEs: 'Guía de Numerología',
      snippet: 'Aprende sobre numerología.',
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'guia-numerologia' }),
    });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringContaining('Guía de Numerología'),
      type: 'article',
    });
  });

  it('debe retornar objeto vacío si el artículo no existe', async () => {
    mockGetArticle.mockRejectedValue(new Error('Not found'));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) });

    expect(metadata).toEqual({});
  });
});

describe('generateStaticParams (guias)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar slugs de todas las guías', async () => {
    // generateStaticParams calls getArticlesByCategory once per guide category (6 total)
    mockGetArticlesByCategory
      .mockResolvedValueOnce([{ slug: 'guia-numerologia' }])
      .mockResolvedValueOnce([{ slug: 'guia-pendulo' }])
      .mockResolvedValueOnce([{ slug: 'guia-carta-astral' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const params = await generateStaticParams();

    expect(params).toEqual([
      { slug: 'guia-numerologia' },
      { slug: 'guia-pendulo' },
      { slug: 'guia-carta-astral' },
    ]);
  });
});
