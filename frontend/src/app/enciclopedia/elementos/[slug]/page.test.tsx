import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { generateMetadata, generateStaticParams } from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
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

function apiError(status: number): AxiosError {
  const error = new AxiosError('boom');
  error.response = {
    status,
    statusText: '',
    data: null,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

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

  it('⚠️ T-PROD-024: un slug inexistente 404ea en vez de servir un 200 genérico', async () => {
    mockGetArticle.mockRejectedValue(apiError(404));

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('⚠️ T-PROD-024: propaga un fallo transitorio en vez de cachear metadata degradada', async () => {
    mockGetArticle.mockRejectedValue(apiError(503));

    await expect(generateMetadata({ params: Promise.resolve({ slug: 'aries' }) })).rejects.toThrow(
      'boom'
    );
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
