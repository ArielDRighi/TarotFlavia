import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DailyHoroscopeDigest } from './DailyHoroscopeDigest';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import { ROUTES } from '@/lib/constants/routes';
import { ZodiacSign } from '@/types/horoscope.types';
import type { CanonicalDailyHoroscopes, DailyHoroscope } from '@/types/horoscope.types';

function buildHoroscope(sign: ZodiacSign, index: number): DailyHoroscope {
  return {
    id: index + 1,
    zodiacSign: sign,
    horoscopeDate: '2026-09-12',
    generalContent: `Energía general de ${sign} para hoy. Segunda oración del extracto.`,
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

// Se construye desordenado a propósito: la portada ordena por la rueda zodiacal.
const SHUFFLED = [...Object.values(ZodiacSign)].reverse();

const DAILY: CanonicalDailyHoroscopes = {
  canonicalDate: '2026-09-12',
  horoscopes: SHUFFLED.map(buildHoroscope),
  isShowingPreviousDay: false,
};

describe('DailyHoroscopeDigest (T-SEO-014)', () => {
  it('muestra la fecha visible y los 12 extractos con link a cada signo', () => {
    render(<DailyHoroscopeDigest daily={DAILY} />);

    const section = screen.getByTestId('home-horoscope');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
      HOME_EDITORIAL.horoscope.heading
    );
    expect(within(section).getByTestId('home-horoscope-date')).toHaveTextContent(
      /12 de septiembre de 2026/i
    );

    const items = within(section).getAllByTestId(/^home-horoscope-sign-/);
    expect(items).toHaveLength(12);

    const aries = within(section).getByTestId('home-horoscope-sign-aries');
    expect(aries).toHaveTextContent('Energía general de aries para hoy.');
    expect(within(aries).getByRole('link', { name: /aries/i })).toHaveAttribute(
      'href',
      ROUTES.HOROSCOPO_SIGN(ZodiacSign.ARIES)
    );
  });

  it('ordena por la rueda zodiacal aunque la API venga desordenada', () => {
    render(<DailyHoroscopeDigest daily={DAILY} />);

    const items = screen.getAllByTestId(/^home-horoscope-sign-/);
    expect(items[0]).toHaveAttribute('data-testid', 'home-horoscope-sign-aries');
    expect(items[11]).toHaveAttribute('data-testid', 'home-horoscope-sign-pisces');
  });

  it('avisa cuando se sirve el de ayer y muestra la fecha del horóscopo servido', () => {
    const previous: CanonicalDailyHoroscopes = {
      ...DAILY,
      horoscopes: DAILY.horoscopes.map((item) => ({ ...item, horoscopeDate: '2026-09-11' })),
      isShowingPreviousDay: true,
    };
    render(<DailyHoroscopeDigest daily={previous} />);

    expect(screen.getByTestId('home-horoscope-previous-day')).toBeInTheDocument();
    expect(screen.getByTestId('home-horoscope-date')).toHaveTextContent(
      /11 de septiembre de 2026/i
    );
  });

  it('tolera una generación parcial: muestra los signos que vinieron', () => {
    render(<DailyHoroscopeDigest daily={{ ...DAILY, horoscopes: DAILY.horoscopes.slice(0, 3) }} />);

    expect(screen.getAllByTestId(/^home-horoscope-sign-/)).toHaveLength(3);
  });

  it('muestra el estado vacío con link al hub si no hay horóscopo', () => {
    render(<DailyHoroscopeDigest daily={undefined} />);

    expect(screen.getByTestId('home-horoscope-empty')).toHaveTextContent(
      HOME_EDITORIAL.horoscope.emptyState
    );
    expect(screen.queryAllByTestId(/^home-horoscope-sign-/)).toHaveLength(0);
    expect(screen.getByRole('link', { name: HOME_EDITORIAL.horoscope.linkLabel })).toHaveAttribute(
      'href',
      ROUTES.HOROSCOPO
    );
  });

  it('muestra el estado vacío si la lista vino sin signos', () => {
    render(<DailyHoroscopeDigest daily={{ ...DAILY, horoscopes: [] }} />);

    expect(screen.getByTestId('home-horoscope-empty')).toBeInTheDocument();
  });
});
