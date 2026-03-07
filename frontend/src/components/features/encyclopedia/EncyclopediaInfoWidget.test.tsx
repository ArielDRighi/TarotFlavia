import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EncyclopediaInfoWidget } from './EncyclopediaInfoWidget';
import { ArticleCategory, type ArticleSnippet } from '@/types/encyclopedia-article.types';

// Mock the hook
vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: vi.fn(),
}));

import { useArticleSnippet } from '@/hooks/api/useEncyclopediaArticles';

const mockUseArticleSnippet = vi.mocked(useArticleSnippet);

const mockArticle: ArticleSnippet = {
  id: 1,
  slug: 'guide-numerology',
  nameEs: 'Guía de Numerología',
  category: ArticleCategory.GUIDE_NUMEROLOGY,
  snippet:
    'La numerología es el estudio del significado de los números y su influencia en la vida humana.',
};

describe('EncyclopediaInfoWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado de carga', () => {
    it('debe mostrar Skeleton mientras carga', () => {
      mockUseArticleSnippet.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as ReturnType<typeof useArticleSnippet>);

      render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(screen.getByTestId('encyclopedia-info-widget-skeleton')).toBeInTheDocument();
    });
  });

  describe('Estado de error', () => {
    it('debe retornar null cuando hay error (sin crashear la página)', () => {
      mockUseArticleSnippet.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error al obtener artículo'),
      } as ReturnType<typeof useArticleSnippet>);

      const { container } = render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(container.firstChild).toBeNull();
    });

    it('debe retornar null cuando no hay datos y no está cargando', () => {
      mockUseArticleSnippet.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useArticleSnippet>);

      const { container } = render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Estado con datos', () => {
    beforeEach(() => {
      mockUseArticleSnippet.mockReturnValue({
        data: mockArticle,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useArticleSnippet>);
    });

    it('debe mostrar el snippet del artículo', () => {
      render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(screen.getByText(mockArticle.snippet)).toBeInTheDocument();
    });

    it('debe mostrar el nombre del artículo como título por defecto', () => {
      render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(screen.getByText(mockArticle.nameEs)).toBeInTheDocument();
    });

    it('debe mostrar el botón "Ver más en la Enciclopedia"', () => {
      render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(screen.getByRole('link', { name: /ver más en la enciclopedia/i })).toBeInTheDocument();
    });

    it('el link debe apuntar a /enciclopedia/guias/{slug}', () => {
      render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      const link = screen.getByRole('link', { name: /ver más en la enciclopedia/i });
      expect(link).toHaveAttribute('href', '/enciclopedia/guias/guide-numerology');
    });

    it('debe renderizar el widget con data-testid', () => {
      render(<EncyclopediaInfoWidget slug="guide-numerology" />);

      expect(screen.getByTestId('encyclopedia-info-widget')).toBeInTheDocument();
    });
  });

  describe('Prop title sobreescribe el nombre del artículo', () => {
    it('debe mostrar el título personalizado en lugar del nameEs del artículo', () => {
      mockUseArticleSnippet.mockReturnValue({
        data: mockArticle,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useArticleSnippet>);

      render(
        <EncyclopediaInfoWidget slug="guide-numerology" title="Aprende Numerología Esotérica" />
      );

      expect(screen.getByText('Aprende Numerología Esotérica')).toBeInTheDocument();
      expect(screen.queryByText(mockArticle.nameEs)).not.toBeInTheDocument();
    });
  });

  describe('Prop className', () => {
    it('debe aplicar la clase personalizada al widget', () => {
      mockUseArticleSnippet.mockReturnValue({
        data: mockArticle,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useArticleSnippet>);

      render(<EncyclopediaInfoWidget slug="guide-numerology" className="custom-class mt-4" />);

      const widget = screen.getByTestId('encyclopedia-info-widget');
      expect(widget).toHaveClass('custom-class');
    });
  });
});
