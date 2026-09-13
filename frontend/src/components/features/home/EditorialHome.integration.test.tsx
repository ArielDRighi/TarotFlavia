import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EditorialHome } from './EditorialHome';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';
import type { EditorialHomeData } from '@/types/home.types';
import { ZodiacSign } from '@/types/horoscope.types';
import type { DailyHoroscope } from '@/types/horoscope.types';

/**
 * Portada completa, sin mocks (T-SEO-014).
 *
 * `EditorialHome.test.tsx` mockea las siete secciones para probar la
 * composición; esto es lo contrario: las secciones reales con datos reales,
 * para verificar sobre el árbol final los criterios de aceptación que un mock
 * no puede atrapar (un `h1` agregado en cualquier sección, un extracto que no
 * llega al HTML).
 */

function buildHoroscope(sign: ZodiacSign, index: number): DailyHoroscope {
  return {
    id: index + 1,
    zodiacSign: sign,
    horoscopeDate: '2026-09-12',
    generalContent: `Extracto del día para ${sign}.`,
    areas: {
      love: { content: 'Amor', score: 7 },
      wellness: { content: 'Bienestar', score: 6 },
      money: { content: 'Dinero', score: 5 },
    },
    luckyNumber: 3,
    luckyColor: 'Azul',
    luckyTime: 'Tarde',
  };
}

const CARD: CardDetail = {
  id: 1,
  slug: 'el-loco',
  nameEs: 'El Loco',
  nameEn: 'The Fool',
  arcanaType: ArcanaType.MAJOR,
  number: 0,
  suit: null,
  thumbnailUrl: '/images/tarot/the-fool.webp',
  romanNumeral: '0',
  courtRank: null,
  element: null,
  planet: null,
  zodiacSign: null,
  meaningUpright: 'El salto de fe absoluto.',
  meaningReversed: 'Imprudencia.',
  description: null,
  keywords: { upright: [], reversed: [] },
  imageUrl: '/images/tarot/the-fool.webp',
  relatedCards: null,
  advice: 'Da el salto.',
};

const GUIDE: ArticleSummary = {
  id: 1,
  slug: 'guia-tarot',
  nameEs: 'Guía del Tarot',
  category: ArticleCategory.GUIDE_TAROT,
  snippet: 'Cómo formular una pregunta.',
  imageUrl: null,
  sortOrder: 1,
};

const FULL: EditorialHomeData = {
  dailyHoroscopes: {
    canonicalDate: '2026-09-12',
    horoscopes: Object.values(ZodiacSign).map(buildHoroscope),
    isShowingPreviousDay: false,
  },
  dailyCard: { canonicalDate: '2026-09-12', card: CARD },
  latestGuides: [GUIDE],
};

const EMPTY: EditorialHomeData = {
  dailyHoroscopes: undefined,
  dailyCard: undefined,
  latestGuides: undefined,
};

describe('EditorialHome — árbol completo (T-SEO-014)', () => {
  it('⚠️ tiene un único h1, de publicación, con todas las secciones reales', () => {
    render(<EditorialHome data={FULL} />);

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/tarot y astrología en español/i);
  });

  it('⚠️ los 12 extractos, la carta y la guía están en el árbol servido', () => {
    render(<EditorialHome data={FULL} />);

    expect(screen.getAllByTestId(/^home-horoscope-sign-/)).toHaveLength(12);
    expect(screen.getByText('Extracto del día para aries.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'El Loco' })).toBeInTheDocument();
    expect(screen.getByTestId('article-card')).toHaveTextContent('Guía del Tarot');
  });

  it('⚠️ no contiene precios, tabla de planes ni "3 pasos"', () => {
    const { container } = render(<EditorialHome data={FULL} />);

    expect(container.querySelector('table')).toBeNull();
    expect(container.textContent).not.toMatch(/\$\s?\d/);
    expect(container.textContent).not.toMatch(/premium/i);
    expect(container.textContent).not.toMatch(/3 (simples )?pasos/i);
    expect(screen.queryByRole('link', { name: /crear cuenta/i })).not.toBeInTheDocument();
  });

  it('sigue teniendo un único h1 y las siete secciones aunque la API no responda', () => {
    render(<EditorialHome data={EMPTY} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId('home-horoscope-empty')).toBeInTheDocument();
    expect(screen.getByTestId('home-daily-card-empty')).toBeInTheDocument();
    // Las guías no tienen estado vacío: caen al catálogo estático (T-SEO-022).
    expect(screen.getByTestId('home-guides-fallback')).toBeInTheDocument();
    expect(screen.getAllByTestId('article-card')).toHaveLength(7);
    expect(screen.getByTestId('home-encyclopedia')).toBeInTheDocument();
    expect(screen.getByTestId('home-about')).toBeInTheDocument();
    expect(screen.getByTestId('home-services')).toBeInTheDocument();
  });
});
