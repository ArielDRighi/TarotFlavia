import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import ElementoDetailPage, { generateMetadata, generateStaticParams } from './page';

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

const mockGetArticle = vi.fn();
const mockGetArticlesByCategory = vi.fn();

vi.mock('@/lib/api/encyclopedia-articles-api', () => ({
  getArticle: (slug: string) => mockGetArticle(slug),
  getArticlesByCategory: (category: string) => mockGetArticlesByCategory(category),
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

describe('generateMetadata (elementos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe incluir el nombre del artículo en title', async () => {
    mockGetArticle.mockResolvedValue({
      id: 5,
      slug: 'fuego',
      nameEs: 'Fuego',
      snippet: 'El elemento del fuego.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'fuego' }) });

    expect(metadata.title).toContain('Fuego');
    expect(metadata.title).toContain('Enciclopedia Mística');
  });

  it('debe usar snippet como description', async () => {
    const snippet = 'El elemento del fuego.';
    mockGetArticle.mockResolvedValue({
      id: 5,
      slug: 'fuego',
      nameEs: 'Fuego',
      snippet,
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'fuego' }) });

    expect(metadata.description).toBe(snippet);
  });

  it('debe incluir Open Graph tags', async () => {
    mockGetArticle.mockResolvedValue({
      id: 5,
      slug: 'fuego',
      nameEs: 'Fuego',
      snippet: 'El elemento del fuego.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'fuego' }) });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringContaining('Fuego'),
      type: 'article',
    });
  });

  it('debe retornar objeto vacío si el artículo no existe', async () => {
    mockGetArticle.mockRejectedValue(new Error('Not found'));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) });

    expect(metadata).toEqual({});
  });
});

describe('generateStaticParams (elementos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar slugs de todos los elementos y modalidades', async () => {
    // generateStaticParams calls getArticlesByCategory once per category (ELEMENT + MODALITY)
    mockGetArticlesByCategory
      .mockResolvedValueOnce([
        { slug: 'fuego' },
        { slug: 'tierra' },
        { slug: 'aire' },
        { slug: 'agua' },
      ])
      .mockResolvedValueOnce([]);

    const params = await generateStaticParams();

    expect(params).toEqual([
      { slug: 'fuego' },
      { slug: 'tierra' },
      { slug: 'aire' },
      { slug: 'agua' },
    ]);
  });
});
