import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleDetailView } from './ArticleDetailView';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleDetail } from '@/types/encyclopedia-article.types';

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
  });

  describe('Related tarot cards', () => {
    it('should show related tarot cards section when relatedTarotCards has items', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedTarotCards: [1, 3, 10] })} />);

      expect(screen.getByTestId('related-tarot-cards')).toBeInTheDocument();
    });

    it('should not show related tarot cards section when relatedTarotCards is null', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedTarotCards: null })} />);

      expect(screen.queryByTestId('related-tarot-cards')).not.toBeInTheDocument();
    });

    it('should not show related tarot cards section when relatedTarotCards is empty', () => {
      render(<ArticleDetailView article={createTestArticle({ relatedTarotCards: [] })} />);

      expect(screen.queryByTestId('related-tarot-cards')).not.toBeInTheDocument();
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
});
