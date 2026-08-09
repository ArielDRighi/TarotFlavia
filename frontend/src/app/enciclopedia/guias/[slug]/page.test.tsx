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

describe('generateStaticParams (guias)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar slugs de todas las guías', async () => {
    // generateStaticParams calls getArticlesByCategory once per guide category (7 total)
    // El orden refleja GUIDE_CATEGORIES en page.tsx (GUIDE_TAROT primero).
    mockGetArticlesByCategory
      .mockResolvedValueOnce([{ slug: 'guia-tarot' }])
      .mockResolvedValueOnce([{ slug: 'guia-numerologia' }])
      .mockResolvedValueOnce([{ slug: 'guia-pendulo' }])
      .mockResolvedValueOnce([{ slug: 'guia-carta-astral' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const params = await generateStaticParams();

    expect(params).toEqual([
      { slug: 'guia-tarot' },
      { slug: 'guia-numerologia' },
      { slug: 'guia-pendulo' },
      { slug: 'guia-carta-astral' },
    ]);
  });
});
