import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { ArticleDetailView } from './ArticleDetailView';
import { getAstroCategoryHero } from '@/lib/data/encyclopedia-editorial.data';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleDetail } from '@/types/encyclopedia-article.types';

// Use the real editorial data, but wrap getAstroCategoryHero in a spy so a single
// test can simulate "asset not generated yet" and assert the band still renders.
vi.mock('@/lib/data/encyclopedia-editorial.data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data/encyclopedia-editorial.data')>();
  return {
    ...actual,
    getAstroCategoryHero: vi.fn(actual.getAstroCategoryHero),
  };
});

// Mock react-markdown to avoid complex rendering in tests
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}));

// Mock remark-gfm
vi.mock('remark-gfm', () => ({
  default: vi.fn(),
}));

// Mock next/image (the ArticleHero renders it for guides with a hero asset)
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

// Mock RelatedTarotCards to isolate ArticleDetailView from the cards data hook.
// We assert it receives the related card IDs; its own rendering (thumbnail,
// name, href) is covered by RelatedTarotCards.test.tsx.
vi.mock('./RelatedTarotCards', () => ({
  RelatedTarotCards: ({ cardIds }: { cardIds: number[] }) => (
    <div data-testid="related-tarot-cards-mock">{cardIds.join(',')}</div>
  ),
}));

// Mock next/link
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

// ─── Factory ──────────────────────────────────────────────────────────────────

function createTestArticle(overrides?: Partial<ArticleDetail>): ArticleDetail {
  return {
    id: 1,
    slug: 'aries',
    nameEs: 'Aries',
    nameEn: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: 'El primer signo del zodíaco.',
    imageUrl: null,
    sortOrder: 1,
    content: '## Aries\n\nAries es el primer signo del zodíaco.',
    metadata: null,
    relatedArticles: [],
    relatedTarotCards: null,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ArticleDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component with data-testid', () => {
      render(<ArticleDetailView article={createTestArticle()} />);

      expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
    });

    it('should render article name in heading', () => {
      render(<ArticleDetailView article={createTestArticle({ nameEs: 'Tauro' })} />);

      expect(screen.getByRole('heading', { name: 'Tauro' })).toBeInTheDocument();
    });

    it('should render category badge', () => {
      render(<ArticleDetailView article={createTestArticle()} />);

      expect(screen.getByTestId('article-category-badge')).toBeInTheDocument();
      expect(screen.getByTestId('article-category-badge')).toHaveTextContent('Signos Zodiacales');
    });

    it('should use dark night text on the gold category badge for AA contrast', () => {
      render(<ArticleDetailView article={createTestArticle()} />);

      const badge = screen.getByTestId('article-category-badge');
      expect(badge).toHaveClass('text-bg-hero');
      expect(badge).not.toHaveClass('text-secondary-foreground');
    });
  });

  describe('Markdown content', () => {
    it('should render markdown content', () => {
      const content = '## Aries\n\nAries es el primer signo del zodíaco.';
      render(<ArticleDetailView article={createTestArticle({ content })} />);

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should pass article content to ReactMarkdown', () => {
      const content = '## Contenido de prueba\n\nTexto de prueba.';
      render(<ArticleDetailView article={createTestArticle({ content })} />);

      expect(screen.getByTestId('markdown-content')).toHaveTextContent('## Contenido de prueba');
    });

    it('should strip the leading top-level heading to avoid a duplicate title', () => {
      const content = '# Aries\n\n## Carácter\n\nTexto.';
      render(<ArticleDetailView article={createTestArticle({ nameEs: 'Aries', content })} />);

      const markdown = screen.getByTestId('markdown-content');
      expect(markdown).not.toHaveTextContent('# Aries');
      expect(markdown).toHaveTextContent('## Carácter');
    });

    it('should render a single h1 on the page (the article title)', () => {
      const content = '# Aries\n\n## Carácter\n\nTexto.';
      render(<ArticleDetailView article={createTestArticle({ nameEs: 'Aries', content })} />);

      const level1Headings = screen.getAllByRole('heading', { level: 1 });
      expect(level1Headings).toHaveLength(1);
      expect(level1Headings[0]).toHaveTextContent('Aries');
    });
  });

  describe('Related tarot cards', () => {
    it('should delegate the related card IDs to RelatedTarotCards (no raw IDs shown)', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedTarotCards: [1, 3, 10] })} />);

      expect(screen.getByTestId('related-tarot-cards-mock')).toHaveTextContent('1,3,10');
      expect(screen.queryByText('#1')).not.toBeInTheDocument();
    });

    it('should not render RelatedTarotCards when relatedTarotCards is null', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedTarotCards: null })} />);

      expect(screen.queryByTestId('related-tarot-cards-mock')).not.toBeInTheDocument();
    });

    it('should not render RelatedTarotCards when relatedTarotCards is empty', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedTarotCards: [] })} />);

      expect(screen.queryByTestId('related-tarot-cards-mock')).not.toBeInTheDocument();
    });
  });

  describe('Related articles', () => {
    it('should show related articles when they exist', () => {
      const relatedArticles = [
        {
          id: 2,
          slug: 'tauro',
          nameEs: 'Tauro',
          category: ArticleCategory.ZODIAC_SIGN,
          snippet: 'El segundo signo.',
          imageUrl: null,
          sortOrder: 2,
        },
      ];
      render(<ArticleDetailView article={createTestArticle({ relatedArticles })} />);

      expect(screen.getByTestId('related-articles')).toBeInTheDocument();
      expect(screen.getByText('Tauro')).toBeInTheDocument();
    });

    it('should not show related articles section when empty', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedArticles: [] })} />);

      expect(screen.queryByTestId('related-articles')).not.toBeInTheDocument();
    });

    it('should link each related article to the route matching its category', () => {
      const base = { snippet: '', imageUrl: null, sortOrder: 0 };
      const relatedArticles = [
        { ...base, id: 10, slug: 'aries', nameEs: 'Aries', category: ArticleCategory.ZODIAC_SIGN },
        { ...base, id: 11, slug: 'marte', nameEs: 'Marte', category: ArticleCategory.PLANET },
        {
          ...base,
          id: 12,
          slug: 'casa-1',
          nameEs: 'Casa I',
          category: ArticleCategory.ASTROLOGICAL_HOUSE,
        },
        { ...base, id: 13, slug: 'fuego', nameEs: 'Fuego', category: ArticleCategory.ELEMENT },
        {
          ...base,
          id: 14,
          slug: 'cardinal',
          nameEs: 'Cardinal',
          category: ArticleCategory.MODALITY,
        },
        {
          ...base,
          id: 15,
          slug: 'guia-tarot',
          nameEs: 'Introducción al Tarot',
          category: ArticleCategory.GUIDE_TAROT,
        },
      ];
      render(
        <ArticleDetailView
          article={createTestArticle({
            nameEs: 'Artículo Base',
            relatedArticles,
            content: 'Descripción base.',
          })}
        />
      );

      const hrefOf = (name: string) => screen.getByText(name).closest('a')?.getAttribute('href');
      expect(hrefOf('Aries')).toBe('/enciclopedia/astrologia/signos/aries');
      expect(hrefOf('Marte')).toBe('/enciclopedia/astrologia/planetas/marte');
      expect(hrefOf('Casa I')).toBe('/enciclopedia/astrologia/casas/casa-1');
      expect(hrefOf('Fuego')).toBe('/enciclopedia/elementos/fuego');
      expect(hrefOf('Cardinal')).toBe('/enciclopedia/elementos/cardinal');
      expect(hrefOf('Introducción al Tarot')).toBe('/enciclopedia/guias/guia-tarot');
    });
  });

  describe('Breadcrumb navigation', () => {
    it('should render breadcrumb link to /enciclopedia', () => {
      render(<ArticleDetailView article={createTestArticle()} />);

      const enciclopediaLink = screen.getByTestId('breadcrumb-enciclopedia');
      expect(enciclopediaLink).toBeInTheDocument();
      expect(enciclopediaLink).toHaveAttribute('href', '/enciclopedia');
    });

    it('should show article name in breadcrumb', () => {
      render(<ArticleDetailView article={createTestArticle({ nameEs: 'Mercurio' })} />);

      const breadcrumb = screen.getByTestId('breadcrumb-current');
      expect(breadcrumb).toHaveTextContent('Mercurio');
    });
  });

  describe('CTA (Call to Action)', () => {
    it('should show CTA button for guide-numerology category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.GUIDE_NUMEROLOGY })}
        />
      );

      const cta = screen.getByTestId('article-cta');
      expect(cta).toBeInTheDocument();
      expect(cta).toHaveTextContent('Calcular mi Numerología');
      expect(cta).toHaveAttribute('href', '/numerologia');
    });

    it('should show CTA button for guide-pendulum category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.GUIDE_PENDULUM })}
        />
      );

      const cta = screen.getByTestId('article-cta');
      expect(cta).toHaveTextContent('Usar el Péndulo Digital');
      expect(cta).toHaveAttribute('href', '/pendulo');
    });

    it('should show CTA button for guide-birth-chart category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.GUIDE_BIRTH_CHART })}
        />
      );

      const cta = screen.getByTestId('article-cta');
      expect(cta).toHaveTextContent('Generar mi Carta Astral');
      expect(cta).toHaveAttribute('href', '/carta-astral');
    });

    it('should show CTA button for guide-ritual category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.GUIDE_RITUAL })}
        />
      );

      const cta = screen.getByTestId('article-cta');
      expect(cta).toHaveTextContent('Explorar Rituales');
      expect(cta).toHaveAttribute('href', '/rituales');
    });

    it('should show CTA button for guide-horoscope category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.GUIDE_HOROSCOPE })}
        />
      );

      const cta = screen.getByTestId('article-cta');
      expect(cta).toHaveTextContent('Ver mi Horóscopo');
      expect(cta).toHaveAttribute('href', '/horoscopo');
    });

    it('should show CTA button for guide-chinese category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.GUIDE_CHINESE })}
        />
      );

      const cta = screen.getByTestId('article-cta');
      expect(cta).toHaveTextContent('Ver mi Horóscopo Chino');
      expect(cta).toHaveAttribute('href', '/horoscopo-chino');
    });

    it('should not show CTA for zodiac sign (non-guide)', () => {
      render(
        <ArticleDetailView article={createTestArticle({ category: ArticleCategory.ZODIAC_SIGN })} />
      );

      expect(screen.queryByTestId('article-cta')).not.toBeInTheDocument();
    });

    it('should not show CTA for planet category', () => {
      render(
        <ArticleDetailView article={createTestArticle({ category: ArticleCategory.PLANET })} />
      );

      expect(screen.queryByTestId('article-cta')).not.toBeInTheDocument();
    });

    it('should not show CTA for astrological house category', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.ASTROLOGICAL_HOUSE })}
        />
      );

      expect(screen.queryByTestId('article-cta')).not.toBeInTheDocument();
    });
  });

  describe('Editorial hero (guides)', () => {
    it('should render the ArticleHero for guide articles', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.GUIDE_TAROT,
            nameEs: 'Guía del Tarot',
          })}
        />
      );

      const hero = screen.getByTestId('article-hero');
      expect(hero).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Guía del Tarot' })).toBeInTheDocument();
    });

    it('should show the hero image configured for the tarot guide', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            slug: 'guia-tarot',
            category: ArticleCategory.GUIDE_TAROT,
            nameEs: 'Guía del Tarot',
          })}
        />
      );

      expect(screen.getByTestId('next-image')).toHaveAttribute(
        'src',
        '/images/enciclopedia/guia-tarot-hero.webp'
      );
    });

    it('should render a single page h1 for guide articles (no duplicate from content)', () => {
      const content = '# Guía del Tarot\n\n## 1. ¿Qué es el Tarot?\n\nTexto.';
      render(
        <ArticleDetailView
          article={createTestArticle({
            slug: 'guia-tarot',
            category: ArticleCategory.GUIDE_TAROT,
            nameEs: 'Guía del Tarot',
            content,
          })}
        />
      );

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });
  });

  describe('Table of contents (guides)', () => {
    const guideContent =
      '# Guía del Tarot\n\nIntro.\n\n## 1. ¿Qué es el Tarot?\n\nTexto.\n\n## 2. Los Arcanos\n\nMás texto.';

    it('should render the TOC for guide articles with numbered sections', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            slug: 'guia-tarot',
            category: ArticleCategory.GUIDE_TAROT,
            nameEs: 'Guía del Tarot',
            content: guideContent,
          })}
        />
      );

      const toc = screen.getByTestId('article-toc');
      expect(toc).toBeInTheDocument();
      expect(within(toc).getAllByRole('link', { name: /¿Qué es el Tarot\?/ })[0]).toHaveAttribute(
        'href',
        '#seccion-1'
      );
    });

    it('should render the TOC for astrology articles with H2 sections', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.ZODIAC_SIGN,
            content: '## 1. Carácter\n\nTexto.\n\n## 2. Elemento\n\nMás texto.',
          })}
        />
      );

      expect(screen.getByTestId('article-toc')).toBeInTheDocument();
    });

    it('should not render the TOC for non-guide/non-astro articles without headings', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.ZODIAC_SIGN,
            content: 'Solo texto sin secciones H2.',
          })}
        />
      );

      expect(screen.queryByTestId('article-toc')).not.toBeInTheDocument();
    });

    it('should not render the TOC for a guide without numbered sections', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.GUIDE_TAROT,
            nameEs: 'Guía del Tarot',
            content: '# Guía del Tarot\n\nSolo un párrafo introductorio sin secciones.',
          })}
        />
      );

      expect(screen.queryByTestId('article-toc')).not.toBeInTheDocument();
    });
  });

  describe('Themed astrology hero (T-ENC-012)', () => {
    const astroCategories: Array<[ArticleCategory, string]> = [
      [ArticleCategory.ZODIAC_SIGN, 'astro-signos.webp'],
      [ArticleCategory.PLANET, 'astro-planetas.webp'],
      [ArticleCategory.ASTROLOGICAL_HOUSE, 'astro-casas.webp'],
      [ArticleCategory.ELEMENT, 'astro-elementos.webp'],
      [ArticleCategory.MODALITY, 'astro-modalidades.webp'],
    ];

    it.each(astroCategories)(
      'renders the themed hero band with image for %s',
      (category, filename) => {
        render(
          <ArticleDetailView
            article={createTestArticle({ category, nameEs: 'Entidad', snippet: 'Descripción.' })}
          />
        );

        expect(screen.getByTestId('article-hero')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: 'Entidad' })).toBeInTheDocument();
        expect(screen.getByTestId('next-image')).toHaveAttribute(
          'src',
          `/images/enciclopedia/${filename}`
        );
      }
    );

    it('uses a Spanish alt on the themed band image', () => {
      render(
        <ArticleDetailView article={createTestArticle({ category: ArticleCategory.ZODIAC_SIGN })} />
      );

      const alt = screen.getByTestId('next-image').getAttribute('alt') ?? '';
      expect(alt.trim().length).toBeGreaterThan(0);
      expect(alt).toMatch(/zodiacal/i);
    });

    it('renders the TOC for astrology categories that have H2 sections', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.PLANET,
            content: '## 1. Influencia\n\nTexto.\n\n## 2. Mitología\n\nMás texto.',
          })}
        />
      );

      expect(screen.getByTestId('article-toc')).toBeInTheDocument();
    });

    it('renders the TOC for astrology articles with unnumbered H2 sections (real article format)', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.PLANET,
            content:
              '# Sol\n\n## Significado Astrológico\n\nTexto.\n\n## Palabras Clave\n\nMás texto.',
          })}
        />
      );

      const toc = screen.getByTestId('article-toc');
      expect(toc).toBeInTheDocument();
      expect(
        within(toc).getAllByRole('link', { name: /Significado Astrológico/ })[0]
      ).toHaveAttribute('href', '#seccion-1');
      expect(within(toc).getAllByRole('link', { name: /Palabras Clave/ })[0]).toHaveAttribute(
        'href',
        '#seccion-2'
      );
    });

    it('does NOT activate the full editorial mode for astrology (no drop-cap, no numbered section badges)', () => {
      render(
        <ArticleDetailView
          article={createTestArticle({
            category: ArticleCategory.PLANET,
            content: '## 1. Influencia\n\nTexto.',
          })}
        />
      );

      expect(screen.queryByTestId('section-badge')).not.toBeInTheDocument();
    });

    it('falls back to the gradient band (no image) when the asset is not available yet', () => {
      vi.mocked(getAstroCategoryHero).mockReturnValueOnce(undefined);

      render(
        <ArticleDetailView
          article={createTestArticle({ category: ArticleCategory.ELEMENT, nameEs: 'Fuego' })}
        />
      );

      expect(screen.getByTestId('article-hero')).toBeInTheDocument();
      expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    });
  });
});
