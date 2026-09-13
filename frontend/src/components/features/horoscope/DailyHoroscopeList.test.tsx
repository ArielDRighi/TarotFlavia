import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DailyHoroscopeList } from './DailyHoroscopeList';
import { ROUTES } from '@/lib/constants/routes';
import { ZodiacSign } from '@/types/horoscope.types';
import type { CanonicalDailyHoroscopes, DailyHoroscope } from '@/types/horoscope.types';

function buildHoroscope(sign: ZodiacSign, index: number): DailyHoroscope {
  return {
    id: index + 1,
    zodiacSign: sign,
    horoscopeDate: '2026-09-12',
    generalContent: `Energía general de ${sign} para hoy. Segunda oración.`,
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
  horoscopes: [...Object.values(ZodiacSign)].reverse().map(buildHoroscope),
  isShowingPreviousDay: false,
};

describe('DailyHoroscopeList (T-SEO-015)', () => {
  it('cada signo lleva su icono de marca decorativo (T-UI-12), no un glifo del sistema', () => {
    render(<DailyHoroscopeList daily={DAILY} testIdPrefix="hub-horoscope" emptyState="Nada" />);

    const aries = screen.getByTestId('hub-horoscope-sign-aries');
    const icon = aries.querySelector('img');
    expect(icon).not.toBeNull();
    expect(decodeURIComponent(icon?.getAttribute('src') ?? '')).toContain(
      '/images/icons/zodiac/aries.webp'
    );
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(aries.textContent).not.toMatch(/[♈-♓]/u);
  });

  it('renderiza la fecha y los 12 extractos con link a cada signo, con el prefijo de testid pedido', () => {
    render(<DailyHoroscopeList daily={DAILY} testIdPrefix="hub-horoscope" emptyState="Nada" />);

    expect(screen.getByTestId('hub-horoscope-date')).toHaveTextContent(/12 de septiembre de 2026/i);
    const items = screen.getAllByTestId(/^hub-horoscope-sign-/);
    expect(items).toHaveLength(12);
    expect(items[0]).toHaveAttribute('data-testid', 'hub-horoscope-sign-aries');
    expect(items[11]).toHaveAttribute('data-testid', 'hub-horoscope-sign-pisces');

    const aries = screen.getByTestId('hub-horoscope-sign-aries');
    expect(aries).toHaveTextContent('Energía general de aries para hoy.');
    expect(within(aries).getByRole('link', { name: /aries/i })).toHaveAttribute(
      'href',
      ROUTES.HOROSCOPO_SIGN(ZodiacSign.ARIES)
    );
  });

  it('avisa cuando se sirve el de ayer', () => {
    const previous: CanonicalDailyHoroscopes = {
      ...DAILY,
      horoscopes: DAILY.horoscopes.map((item) => ({ ...item, horoscopeDate: '2026-09-11' })),
      isShowingPreviousDay: true,
    };
    render(<DailyHoroscopeList daily={previous} testIdPrefix="x" emptyState="Nada" />);

    expect(screen.getByTestId('x-date')).toHaveTextContent(/11 de septiembre/i);
    expect(screen.getByTestId('x-previous-day')).toBeInTheDocument();
  });

  /**
   * T-SEO-017: el pie con la fórmula editorial va debajo de los 12 extractos,
   * con la fecha del horóscopo servido (si es el de ayer, la de ayer).
   */
  it('cierra con la nota editorial del día servido', () => {
    render(<DailyHoroscopeList daily={DAILY} testIdPrefix="hub-horoscope" emptyState="Nada" />);

    const note = screen.getByTestId('hub-horoscope-editorial-note');
    expect(note).toHaveTextContent(/revisión editorial/i);
    expect(note).toHaveTextContent(/12 de septiembre de 2026/i);
  });

  it('cierra con el aviso legal (T-SEO-018)', () => {
    render(<DailyHoroscopeList daily={DAILY} testIdPrefix="hub-horoscope" emptyState="Nada" />);

    expect(screen.getByTestId('content-disclaimer')).toBeInTheDocument();
  });

  it('la nota editorial sigue a la fecha del horóscopo que se muestra, no a la de hoy', () => {
    const previous: CanonicalDailyHoroscopes = {
      ...DAILY,
      horoscopes: DAILY.horoscopes.map((item) => ({ ...item, horoscopeDate: '2026-09-11' })),
      isShowingPreviousDay: true,
    };
    render(<DailyHoroscopeList daily={previous} testIdPrefix="x" emptyState="Nada" />);

    expect(screen.getByTestId('x-editorial-note')).toHaveTextContent(/11 de septiembre/i);
  });

  it('sin horóscopo no hay nota editorial que firmar', () => {
    render(<DailyHoroscopeList daily={undefined} testIdPrefix="x" emptyState="Nada" />);

    expect(screen.queryByTestId('x-editorial-note')).not.toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay horóscopo', () => {
    render(<DailyHoroscopeList daily={undefined} testIdPrefix="x" emptyState="Sin horóscopo" />);

    expect(screen.getByTestId('x-empty')).toHaveTextContent('Sin horóscopo');
    expect(screen.queryAllByTestId(/^x-sign-/)).toHaveLength(0);
  });

  it('el encabezado de cada signo es h3 por defecto y puede bajar a h2 para el hub', () => {
    render(<DailyHoroscopeList daily={DAILY} testIdPrefix="x" emptyState="" headingLevel={2} />);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(12);
  });
});
