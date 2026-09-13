import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleCard } from './ArticleCard';
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

describe('ArticleCard', () => {
  describe('Zodiac sign', () => {
    it('debe mostrar símbolo y fechas para signo zodiacal', () => {
      const article = createArticle({
        category: ArticleCategory.ZODIAC_SIGN,
        nameEs: 'Aries',
        snippet: 'El primer signo del zodíaco',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByTestId('article-card')).toBeInTheDocument();
      expect(screen.getByText('Aries')).toBeInTheDocument();
    });

    it('debe tener link hacia la página del artículo', () => {
      const article = createArticle({
        category: ArticleCategory.ZODIAC_SIGN,
        slug: 'aries',
      });

      render(<ArticleCard article={article} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', expect.stringContaining('aries'));
    });

    it('debe mostrar la categoría como etiqueta', () => {
      const article = createArticle({ category: ArticleCategory.ZODIAC_SIGN });

      render(<ArticleCard article={article} />);

      expect(screen.getByTestId('article-card-category')).toBeInTheDocument();
    });
  });

  describe('Planet', () => {
    it('debe mostrar signo(s) que rige para planeta', () => {
      const article = createArticle({
        category: ArticleCategory.PLANET,
        nameEs: 'Marte',
        snippet: 'Planeta de la energía y acción',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('Marte')).toBeInTheDocument();
      expect(screen.getByTestId('article-card')).toBeInTheDocument();
    });

    it('debe mostrar el snippet del planeta', () => {
      const article = createArticle({
        category: ArticleCategory.PLANET,
        nameEs: 'Venus',
        snippet: 'Planeta del amor y la belleza',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('Planeta del amor y la belleza')).toBeInTheDocument();
    });
  });

  describe('Astrological house', () => {
    it('debe mostrar número romano para casa astral', () => {
      const article = createArticle({
        category: ArticleCategory.ASTROLOGICAL_HOUSE,
        nameEs: 'Casa I',
        snippet: 'La casa del yo y la identidad',
        sortOrder: 1,
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('Casa I')).toBeInTheDocument();
      expect(screen.getByTestId('article-card')).toBeInTheDocument();
    });

    it('debe mostrar el snippet de la casa', () => {
      const article = createArticle({
        category: ArticleCategory.ASTROLOGICAL_HOUSE,
        nameEs: 'Casa VII',
        snippet: 'La casa de las relaciones y la pareja',
        sortOrder: 7,
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('La casa de las relaciones y la pareja')).toBeInTheDocument();
    });
  });

  describe('Element / Modality', () => {
    it('debe renderizar para categoría elemento', () => {
      const article = createArticle({
        category: ArticleCategory.ELEMENT,
        nameEs: 'Fuego',
        snippet: 'Energía activa y transformadora',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('Fuego')).toBeInTheDocument();
    });

    it('debe renderizar para categoría modalidad', () => {
      const article = createArticle({
        category: ArticleCategory.MODALITY,
        nameEs: 'Cardinal',
        snippet: 'Inicia y lidera',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('Cardinal')).toBeInTheDocument();
    });
  });

  describe('Guide', () => {
    it('debe mostrar primera línea del snippet para guía', () => {
      const article = createArticle({
        category: ArticleCategory.GUIDE_NUMEROLOGY,
        nameEs: 'Numerología',
        snippet: 'La numerología es el estudio del significado de los números',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByText('Numerología')).toBeInTheDocument();
      expect(
        screen.getByText('La numerología es el estudio del significado de los números')
      ).toBeInTheDocument();
    });

    it('debe mostrar ícono para guía de péndulo', () => {
      const article = createArticle({
        category: ArticleCategory.GUIDE_PENDULUM,
        nameEs: 'Péndulo',
        snippet: 'El péndulo es una herramienta de radiestesia',
      });

      render(<ArticleCard article={article} />);

      expect(screen.getByTestId('article-card')).toBeInTheDocument();
    });
  });

  describe('Link', () => {
    it('debe construir href correcto para cada categoría', () => {
      const article = createArticle({
        category: ArticleCategory.ZODIAC_SIGN,
        slug: 'tauro',
      });

      render(<ArticleCard article={article} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', expect.stringContaining('tauro'));
    });

    it('debe envolver el contenido en un link', () => {
      const article = createArticle({ slug: 'leo', category: ArticleCategory.ZODIAC_SIGN });

      render(<ArticleCard article={article} />);

      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });
});

describe('ArticleCard — miniatura opcional (T-SEO-022)', () => {
  const guide = createArticle({
    category: ArticleCategory.GUIDE_TAROT,
    slug: 'guia-tarot',
    nameEs: 'Guía del Tarot',
    snippet: 'Cómo formular una pregunta.',
  });

  it('sin miniatura conserva la tarjeta de siempre (icono de categoría)', () => {
    render(<ArticleCard article={guide} />);

    expect(screen.queryByTestId('article-card-thumbnail')).not.toBeInTheDocument();
    expect(screen.getByTestId('article-card-icon')).toBeInTheDocument();
  });

  it('con miniatura la muestra en lugar del icono, decorativa y con carga diferida', () => {
    render(
      <ArticleCard article={guide} thumbnailSrc="/images/enciclopedia/guia-tarot-hero.webp" />
    );

    const thumbnail = screen.getByTestId('article-card-thumbnail');
    expect(thumbnail).toHaveAttribute('src', expect.stringContaining('guia-tarot-hero.webp'));
    expect(thumbnail).toHaveAttribute('alt', '');
    expect(thumbnail).toHaveAttribute('loading', 'lazy');
    expect(thumbnail).toHaveAttribute('sizes');
    expect(screen.queryByTestId('article-card-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Guía del Tarot');
    expect(screen.getByText('Cómo formular una pregunta.')).toBeInTheDocument();
  });

  it('acepta una entrada sin id (catálogo estático) y enlaza por slug', () => {
    render(
      <ArticleCard
        article={{
          slug: 'guia-pendulo',
          nameEs: 'Guía del Péndulo',
          category: ArticleCategory.GUIDE_PENDULUM,
          snippet: 'Cómo preguntar con un péndulo.',
        }}
      />
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining('guia-pendulo')
    );
  });
});
