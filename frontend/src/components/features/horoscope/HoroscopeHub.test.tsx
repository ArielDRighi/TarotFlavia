import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HoroscopeHub } from './HoroscopeHub';
import { ZodiacSign } from '@/types/horoscope.types';
import type { CanonicalDailyHoroscopes, DailyHoroscope } from '@/types/horoscope.types';

vi.mock('./HoroscopeHubSelector', () => ({
  HoroscopeHubSelector: () => <div data-testid="zodiac-selector" />,
}));

function buildHoroscope(sign: ZodiacSign, index: number): DailyHoroscope {
  return {
    id: index + 1,
    zodiacSign: sign,
    horoscopeDate: '2026-09-12',
    generalContent: `Resumen de ${sign}.`,
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

const DAILY: CanonicalDailyHoroscopes = {
  canonicalDate: '2026-09-12',
  horoscopes: Object.values(ZodiacSign).map(buildHoroscope),
  isShowingPreviousDay: false,
};

describe('HoroscopeHub (T-SEO-015)', () => {
  it('h1 único de publicación, fecha y los 12 extractos en el HTML', () => {
    render(<HoroscopeHub daily={DAILY} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/horóscopo de hoy/i);
    expect(screen.getByTestId('horoscope-hub-date')).toHaveTextContent(/12 de septiembre de 2026/i);
    expect(screen.getAllByTestId(/^horoscope-hub-sign-/)).toHaveLength(12);
  });

  it('el selector (consulta puntual) va debajo de los extractos, y el texto explicativo al final', () => {
    render(<HoroscopeHub daily={DAILY} />);

    const digest = screen.getByTestId('horoscope-hub-digest');
    const selector = screen.getByTestId('zodiac-selector');
    const intro = screen.getByTestId('western-horoscope-intro');

    expect(
      digest.compareDocumentPosition(selector) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(selector.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('sin horóscopo (API caída) muestra el estado vacío y sigue sirviendo el selector y el texto', () => {
    render(<HoroscopeHub daily={undefined} />);

    expect(screen.getByTestId('horoscope-hub-empty')).toBeInTheDocument();
    expect(screen.getByTestId('zodiac-selector')).toBeInTheDocument();
    expect(screen.getByTestId('horoscope-hub-guide')).toBeInTheDocument();
    expect(screen.getByTestId('western-horoscope-intro')).toBeInTheDocument();
  });

  it('el texto propio "Cómo leer el horóscopo diario" va entre el selector y la tarjeta informativa', () => {
    render(<HoroscopeHub daily={DAILY} />);

    const selector = screen.getByTestId('zodiac-selector');
    const guide = screen.getByTestId('horoscope-hub-guide');
    const intro = screen.getByTestId('western-horoscope-intro');
    expect(selector.compareDocumentPosition(guide) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(guide.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
