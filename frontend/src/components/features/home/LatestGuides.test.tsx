import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LatestGuides } from './LatestGuides';
import { GUIDES_CATALOG, GUIDES_CATALOG_LIST } from '@/lib/constants/guides-catalog.data';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

const GUIDES: ArticleSummary[] = [
  {
    id: 1,
    slug: 'guia-tarot',
    nameEs: 'Guía del Tarot',
    category: ArticleCategory.GUIDE_TAROT,
    snippet: 'Cómo formular una pregunta y leer una tirada.',
    imageUrl: null,
    sortOrder: 1,
  },
  {
    id: 2,
    slug: 'guia-pendulo',
    nameEs: 'Guía del Péndulo',
    category: ArticleCategory.GUIDE_PENDULUM,
    snippet: 'Cómo preguntar con un péndulo.',
    imageUrl: '/images/enciclopedia/desde-la-api.webp',
    sortOrder: 1,
  },
];

describe('LatestGuides (T-SEO-014)', () => {
  it('muestra una tarjeta por guía con título, extracto y link', () => {
    render(<LatestGuides guides={GUIDES} />);

    const section = screen.getByTestId('home-guides');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
      HOME_EDITORIAL.guides.heading
    );

    const cards = within(section).getAllByTestId('article-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Guía del Tarot');
    expect(cards[0]).toHaveTextContent('Cómo formular una pregunta y leer una tirada.');
    expect(cards[0]).toHaveAttribute('href', ROUTES.ENCICLOPEDIA_GUIA('guia-tarot'));
  });

  it('enlaza al listado completo de guías', () => {
    render(<LatestGuides guides={GUIDES} />);

    expect(screen.getByRole('link', { name: HOME_EDITORIAL.guides.linkLabel })).toHaveAttribute(
      'href',
      ROUTES.ENCICLOPEDIA_GUIAS
    );
  });
});

describe('LatestGuides — miniaturas y fallback (T-SEO-022)', () => {
  it('cada tarjeta lleva la miniatura de su categoría; la de la API tiene prioridad', () => {
    render(<LatestGuides guides={GUIDES} />);

    const [tarot, pendulum] = screen.getAllByTestId('article-card');
    expect(within(tarot).getByTestId('article-card-thumbnail')).toHaveAttribute(
      'src',
      expect.stringContaining('guia-tarot-hero.webp')
    );
    expect(within(pendulum).getByTestId('article-card-thumbnail')).toHaveAttribute(
      'src',
      expect.stringContaining('desde-la-api.webp')
    );
  });

  it('⚠️ con la API caída renderiza las siete guías del catálogo, con miniatura, sin aviso de error', () => {
    const { container } = render(<LatestGuides guides={undefined} />);

    expect(screen.getByTestId('home-guides-fallback')).toBeInTheDocument();
    const cards = screen.getAllByTestId('article-card');
    expect(cards).toHaveLength(GUIDES_CATALOG_LIST.length);
    expect(cards).toHaveLength(7);

    const tarot = GUIDES_CATALOG[ArticleCategory.GUIDE_TAROT];
    expect(cards[0]).toHaveTextContent(tarot.nameEs);
    expect(cards[0]).toHaveTextContent(tarot.snippet);
    expect(cards[0]).toHaveAttribute('href', ROUTES.ENCICLOPEDIA_GUIA(tarot.slug));
    expect(within(cards[0]).getByTestId('article-card-thumbnail')).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(tarot.image.src))
    );

    expect(container.textContent).not.toMatch(/no se pudieron cargar/i);
    expect(container.querySelector('.border-dashed')).toBeNull();
  });

  it('una lista vacía de la API también cae al catálogo', () => {
    render(<LatestGuides guides={[]} />);

    expect(screen.getByTestId('home-guides-fallback')).toBeInTheDocument();
    expect(screen.getAllByTestId('article-card')).toHaveLength(7);
  });

  it('con guías de la API no se marca el fallback', () => {
    render(<LatestGuides guides={GUIDES} />);

    expect(screen.queryByTestId('home-guides-fallback')).not.toBeInTheDocument();
  });
});
