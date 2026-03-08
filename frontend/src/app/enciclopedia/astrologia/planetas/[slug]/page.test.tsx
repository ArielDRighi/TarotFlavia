import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import PlanetaDetailPage, { generateMetadata, generateStaticParams } from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'mercurio' }),
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

describe('PlanetaDetailPage (/enciclopedia/astrologia/planetas/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar ArticleDetailView cuando el artículo existe', () => {
    mockUseArticle.mockReturnValue({
      data: {
        id: 2,
        slug: 'mercurio',
        nameEs: 'Mercurio',
        nameEn: 'Mercury',
        category: 'planet',
        snippet: 'El planeta de la comunicación.',
        imageUrl: null,
        sortOrder: 2,
        content: '## Mercurio',
        metadata: null,
        relatedArticles: [],
        relatedTarotCards: null,
      },
      isLoading: false,
      error: null,
    });

    render(<PlanetaDetailPage />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
  });

  it('debe retornar 404 para slug inexistente', () => {
    mockUseArticle.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<PlanetaDetailPage />);

    expect(screen.getByText('Artículo no encontrado')).toBeInTheDocument();
  });
});

describe('generateMetadata (planetas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe incluir el nombre del artículo en title', async () => {
    mockGetArticle.mockResolvedValue({
      id: 2,
      slug: 'mercurio',
      nameEs: 'Mercurio',
      snippet: 'El planeta de la comunicación.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'mercurio' }) });

    expect(metadata.title).toContain('Mercurio');
    expect(metadata.title).toContain('Enciclopedia Mística');
  });

  it('debe usar snippet como description', async () => {
    const snippet = 'El planeta de la comunicación.';
    mockGetArticle.mockResolvedValue({
      id: 2,
      slug: 'mercurio',
      nameEs: 'Mercurio',
      snippet,
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'mercurio' }) });

    expect(metadata.description).toBe(snippet);
  });

  it('debe incluir Open Graph tags', async () => {
    mockGetArticle.mockResolvedValue({
      id: 2,
      slug: 'mercurio',
      nameEs: 'Mercurio',
      snippet: 'El planeta de la comunicación.',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'mercurio' }) });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringContaining('Mercurio'),
      type: 'article',
    });
  });

  it('debe retornar objeto vacío si el artículo no existe', async () => {
    mockGetArticle.mockRejectedValue(new Error('Not found'));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) });

    expect(metadata).toEqual({});
  });
});

describe('generateStaticParams (planetas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar slugs de todos los planetas', async () => {
    mockGetArticlesByCategory.mockResolvedValue([
      { slug: 'sol' },
      { slug: 'luna' },
      { slug: 'mercurio' },
    ]);

    const params = await generateStaticParams();

    expect(params).toEqual([{ slug: 'sol' }, { slug: 'luna' }, { slug: 'mercurio' }]);
  });
});
