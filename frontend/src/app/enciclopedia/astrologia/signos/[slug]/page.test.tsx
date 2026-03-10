import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import SignoDetailPage, { generateMetadata, generateStaticParams } from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'aries' }),
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

describe('SignoDetailPage (/enciclopedia/astrologia/signos/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar ArticleDetailView cuando el artículo existe', () => {
    mockUseArticle.mockReturnValue({
      data: {
        id: 1,
        slug: 'aries',
        nameEs: 'Aries',
        nameEn: 'Aries',
        category: 'zodiac_sign',
        snippet: 'El primer signo del zodíaco.',
        imageUrl: null,
        sortOrder: 1,
        content: '## Aries',
        metadata: null,
        relatedArticles: [],
        relatedTarotCards: null,
      },
      isLoading: false,
      error: null,
    });

    render(<SignoDetailPage />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
  });

  it('debe retornar 404 para slug inexistente', () => {
    mockUseArticle.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<SignoDetailPage />);

    expect(screen.getByText('Artículo no encontrado')).toBeInTheDocument();
  });
});

describe('generateMetadata (signos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe incluir el nombre del artículo en title', async () => {
    mockGetArticle.mockResolvedValue({
      id: 1,
      slug: 'aries',
      nameEs: 'Aries',
      snippet: 'El primer signo del zodíaco.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'aries' }) });

    expect(metadata.title).toContain('Aries');
    expect(metadata.title).toContain('Enciclopedia Mística');
  });

  it('debe usar snippet como description', async () => {
    const snippet = 'El primer signo del zodíaco.';
    mockGetArticle.mockResolvedValue({
      id: 1,
      slug: 'aries',
      nameEs: 'Aries',
      snippet,
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'aries' }) });

    expect(metadata.description).toBe(snippet);
  });

  it('debe incluir Open Graph tags', async () => {
    mockGetArticle.mockResolvedValue({
      id: 1,
      slug: 'aries',
      nameEs: 'Aries',
      snippet: 'El primer signo del zodíaco.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'aries' }) });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringContaining('Aries'),
      type: 'article',
    });
  });

  it('debe retornar objeto vacío si el artículo no existe', async () => {
    mockGetArticle.mockRejectedValue(new Error('Not found'));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) });

    expect(metadata).toEqual({});
  });
});

describe('generateStaticParams (signos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar slugs de todos los signos zodiacales', async () => {
    mockGetArticlesByCategory.mockResolvedValue([
      { slug: 'aries' },
      { slug: 'tauro' },
      { slug: 'geminis' },
    ]);

    const params = await generateStaticParams();

    expect(params).toEqual([{ slug: 'aries' }, { slug: 'tauro' }, { slug: 'geminis' }]);
  });
});
