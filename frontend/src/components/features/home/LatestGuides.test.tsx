import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LatestGuides } from './LatestGuides';
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
    imageUrl: null,
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

  it('muestra el estado vacío si no hay guías', () => {
    render(<LatestGuides guides={undefined} />);

    expect(screen.getByTestId('home-guides-empty')).toHaveTextContent(
      HOME_EDITORIAL.guides.emptyState
    );
    expect(screen.queryAllByTestId('article-card')).toHaveLength(0);
  });
});
