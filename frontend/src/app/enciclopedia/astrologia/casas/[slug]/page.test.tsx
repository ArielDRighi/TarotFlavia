import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import CasaDetailPage, { generateMetadata, generateStaticParams } from './page';

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

const mockGetArticle = vi.fn();
const mockGetArticlesByCategory = vi.fn();

vi.mock('@/lib/api/encyclopedia-articles-api', () => ({
  getArticle: (slug: string) => mockGetArticle(slug),
  getArticlesByCategory: (category: string) => mockGetArticlesByCategory(category),
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

describe('generateMetadata (casas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe incluir el nombre del artículo en title', async () => {
    mockGetArticle.mockResolvedValue({
      id: 3,
      slug: 'primera-casa',
      nameEs: 'Primera Casa',
      snippet: 'La casa del yo.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'primera-casa' }) });

    expect(metadata.title).toContain('Primera Casa');
    expect(metadata.title).toContain('Enciclopedia Mística');
  });

  it('debe usar snippet como description', async () => {
    const snippet = 'La casa del yo.';
    mockGetArticle.mockResolvedValue({
      id: 3,
      slug: 'primera-casa',
      nameEs: 'Primera Casa',
      snippet,
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'primera-casa' }) });

    expect(metadata.description).toBe(snippet);
  });

  it('debe incluir Open Graph tags', async () => {
    mockGetArticle.mockResolvedValue({
      id: 3,
      slug: 'primera-casa',
      nameEs: 'Primera Casa',
      snippet: 'La casa del yo.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'primera-casa' }) });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringContaining('Primera Casa'),
      type: 'article',
    });
  });

  it('debe retornar objeto vacío si el artículo no existe', async () => {
    mockGetArticle.mockRejectedValue(new Error('Not found'));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) });

    expect(metadata).toEqual({});
  });
});

describe('generateStaticParams (casas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar slugs de todas las casas astrales', async () => {
    mockGetArticlesByCategory.mockResolvedValue([
      { slug: 'primera-casa' },
      { slug: 'segunda-casa' },
      { slug: 'tercera-casa' },
    ]);

    const params = await generateStaticParams();

    expect(params).toEqual([
      { slug: 'primera-casa' },
      { slug: 'segunda-casa' },
      { slug: 'tercera-casa' },
    ]);
  });
});
