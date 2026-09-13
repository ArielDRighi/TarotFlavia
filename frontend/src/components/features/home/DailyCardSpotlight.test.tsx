import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DailyCardSpotlight } from './DailyCardSpotlight';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import { ROUTES } from '@/lib/constants/routes';
import { ArcanaType, Suit } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';
import type { CanonicalDailyCard } from '@/types/home.types';

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
  meaningUpright: 'El Loco representa el salto de fe absoluto y el comienzo de un viaje.',
  meaningReversed: 'Imprudencia.',
  description: 'Un joven al borde de un precipicio.',
  keywords: { upright: ['comienzos', 'fe'], reversed: [] },
  imageUrl: '/images/tarot/the-fool.webp',
  relatedCards: null,
  advice: 'Da el salto que venías postergando.',
};

const DAILY_CARD: CanonicalDailyCard = { canonicalDate: '2026-09-12', card: CARD };

describe('DailyCardSpotlight (T-SEO-014)', () => {
  it('muestra imagen, nombre, interpretación y consejo con link a la ficha', () => {
    render(<DailyCardSpotlight dailyCard={DAILY_CARD} />);

    const section = screen.getByTestId('home-daily-card');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
      HOME_EDITORIAL.dailyCard.heading
    );
    expect(within(section).getByRole('img', { name: /el loco/i })).toBeInTheDocument();
    expect(within(section).getByRole('heading', { level: 3 })).toHaveTextContent('El Loco');
    expect(within(section).getByText(CARD.meaningUpright)).toBeInTheDocument();
    expect(within(section).getByText(CARD.advice as string)).toBeInTheDocument();
    expect(
      within(section).getByRole('link', { name: HOME_EDITORIAL.dailyCard.encyclopediaLinkLabel })
    ).toHaveAttribute('href', ROUTES.ENCICLOPEDIA_TAROT_CARD('el-loco'));
    expect(
      within(section).getByRole('link', { name: HOME_EDITORIAL.dailyCard.linkLabel })
    ).toHaveAttribute('href', ROUTES.CARTA_DEL_DIA);
  });

  it('etiqueta el arcano: mayor con numeral, menor con su palo', () => {
    const { rerender } = render(<DailyCardSpotlight dailyCard={DAILY_CARD} />);
    expect(screen.getByTestId('home-daily-card-arcana')).toHaveTextContent(/arcano mayor · 0/i);

    rerender(
      <DailyCardSpotlight
        dailyCard={{
          ...DAILY_CARD,
          card: { ...CARD, arcanaType: ArcanaType.MINOR, suit: Suit.CUPS, romanNumeral: null },
        }}
      />
    );
    expect(screen.getByTestId('home-daily-card-arcana')).toHaveTextContent(/arcano menor · copas/i);
  });

  it('muestra la fecha de la carta', () => {
    render(<DailyCardSpotlight dailyCard={DAILY_CARD} />);

    expect(screen.getByTestId('home-daily-card-date')).toHaveTextContent(
      /12 de septiembre de 2026/i
    );
  });

  it('omite el consejo si la ficha no lo trae, sin dejar un bloque vacío', () => {
    const withoutAdvice: CardDetail = { ...CARD };
    delete withoutAdvice.advice;
    render(<DailyCardSpotlight dailyCard={{ ...DAILY_CARD, card: withoutAdvice }} />);

    expect(screen.queryByTestId('home-daily-card-advice')).not.toBeInTheDocument();
  });

  it('muestra el estado vacío con links a la herramienta y a la enciclopedia', () => {
    render(<DailyCardSpotlight dailyCard={undefined} />);

    expect(screen.getByTestId('home-daily-card-empty')).toHaveTextContent(
      HOME_EDITORIAL.dailyCard.emptyState
    );
    expect(screen.getByRole('link', { name: HOME_EDITORIAL.dailyCard.linkLabel })).toHaveAttribute(
      'href',
      ROUTES.CARTA_DEL_DIA
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('la carta va sobre el incienso recuperado, decorativo y con carga diferida (T-SEO-022)', () => {
    render(<DailyCardSpotlight dailyCard={DAILY_CARD} />);

    const incense = screen.getByTestId('home-daily-card-incense');
    expect(incense).toHaveAttribute('src', expect.stringContaining('incense-bg.webp'));
    expect(incense).toHaveAttribute('alt', '');
    expect(incense).toHaveAttribute('loading', 'lazy');
    expect(incense).toHaveAttribute('sizes');
  });

  it('el estado vacío es un aviso plano, no una caja punteada (T-SEO-022)', () => {
    render(<DailyCardSpotlight dailyCard={undefined} />);

    expect(screen.getByTestId('home-daily-card-empty')).not.toHaveClass('border-dashed');
  });
});
