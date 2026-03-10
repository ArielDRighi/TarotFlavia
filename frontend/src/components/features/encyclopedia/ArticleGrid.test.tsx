import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleGrid } from './ArticleGrid';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

function createArticle(overrides?: Partial<ArticleSummary>): ArticleSummary {
  return {
    id: 1,
    slug: 'aries',
    nameEs: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: 'El primer signo del zodíaco',
    imageUrl: null,
    sortOrder: 1,
    ...overrides,
  };
}

describe('ArticleGrid', () => {
  describe('Loading state', () => {
    it('debe mostrar skeleton cuando isLoading es true', () => {
      render(<ArticleGrid articles={[]} isLoading={true} />);

      expect(screen.getByTestId('article-skeleton')).toBeInTheDocument();
    });

    it('no debe mostrar artículos cuando está cargando', () => {
      const articles = [createArticle()];

      render(<ArticleGrid articles={articles} isLoading={true} />);

      expect(screen.queryAllByTestId(/article-card/)).toHaveLength(0);
    });

    it('no debe mostrar mensaje vacío cuando está cargando', () => {
      render(<ArticleGrid articles={[]} isLoading={true} />);

      expect(screen.queryByText('No se encontraron artículos')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('debe mostrar mensaje vacío por defecto cuando no hay artículos', () => {
      render(<ArticleGrid articles={[]} />);

      expect(screen.getByText('No se encontraron artículos')).toBeInTheDocument();
    });

    it('debe mostrar mensaje vacío personalizado cuando se proporciona', () => {
      render(<ArticleGrid articles={[]} emptyMessage="Sin resultados disponibles" />);

      expect(screen.getByText('Sin resultados disponibles')).toBeInTheDocument();
    });
  });

  describe('Rendering articles', () => {
    it('debe renderizar el número correcto de artículos', () => {
      const articles = Array.from({ length: 4 }, (_, i) =>
        createArticle({ id: i + 1, slug: `article-${i + 1}`, nameEs: `Artículo ${i + 1}` })
      );

      render(<ArticleGrid articles={articles} />);

      expect(screen.getAllByTestId('article-card')).toHaveLength(4);
    });

    it('debe renderizar artículos de distintas categorías', () => {
      const articles = [
        createArticle({ id: 1, slug: 'aries', category: ArticleCategory.ZODIAC_SIGN }),
        createArticle({ id: 2, slug: 'marte', category: ArticleCategory.PLANET }),
        createArticle({
          id: 3,
          slug: 'casa-i',
          category: ArticleCategory.ASTROLOGICAL_HOUSE,
        }),
      ];

      render(<ArticleGrid articles={articles} />);

      expect(screen.getAllByTestId('article-card')).toHaveLength(3);
    });
  });

  describe('Grid container', () => {
    it('debe tener data-testid en el contenedor del grid', () => {
      render(<ArticleGrid articles={[createArticle()]} />);

      expect(screen.getByTestId('article-grid')).toBeInTheDocument();
    });

    it('debe aplicar className personalizado', () => {
      render(<ArticleGrid articles={[createArticle()]} className="custom-class" />);

      expect(screen.getByTestId('article-grid')).toHaveClass('custom-class');
    });

    it('debe aplicar className personalizado en estado loading', () => {
      const { container } = render(
        <ArticleGrid articles={[]} isLoading={true} className="loading-class" />
      );

      expect(container.firstChild).toHaveClass('loading-class');
    });

    it('debe aplicar className personalizado en estado vacío', () => {
      render(<ArticleGrid articles={[]} className="empty-class" />);

      const emptyDiv = screen.getByText('No se encontraron artículos').closest('div');
      expect(emptyDiv).toHaveClass('empty-class');
    });
  });
});
