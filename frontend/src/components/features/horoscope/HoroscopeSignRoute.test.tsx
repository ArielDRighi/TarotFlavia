/**
 * HoroscopeSignRoute - Tests (T-SEO-004)
 *
 * Es el componente de ruta (servidor) de `/horoscopo/[sign]`: valida el segmento,
 * sirve la ficha estática del signo y deja el horóscopo del día —que depende del
 * día calendario local del visitante— en el panel cliente.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HoroscopeSignRoute } from './HoroscopeSignRoute';
import { ZodiacSign } from '@/types/horoscope.types';
import type { ServedDailyHoroscope } from '@/types/horoscope.types';

/** `notFound()` corta el render lanzando; el mock reproduce ese contrato. */
const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

vi.mock('./HoroscopeSignPanel', () => ({
  HoroscopeSignPanel: ({
    sign,
    initialHoroscope,
  }: {
    sign: ZodiacSign;
    initialHoroscope?: ServedDailyHoroscope;
  }) => (
    <div
      data-testid="horoscope-sign-panel"
      data-initial-date={initialHoroscope?.horoscope.horoscopeDate ?? ''}
    >
      {sign}
    </div>
  ),
}));

const SERVED: ServedDailyHoroscope = {
  canonicalDate: '2026-09-12',
  isShowingPreviousDay: false,
  horoscope: {
    id: 1,
    zodiacSign: ZodiacSign.TAURUS,
    horoscopeDate: '2026-09-12',
    generalContent: 'Predicción servida',
    areas: {
      love: { content: 'Amor', score: 7 },
      wellness: { content: 'Bienestar', score: 6 },
      money: { content: 'Dinero', score: 5 },
    },
    luckyNumber: null,
    luckyColor: null,
    luckyTime: null,
  },
};

describe('HoroscopeSignRoute', () => {
  describe('signo válido', () => {
    it('renderiza la ficha estática del signo', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} />);

      expect(screen.getByTestId('zodiac-sign-profile')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Tauro/ })).toBeInTheDocument();
    });

    it('renderiza el panel del horóscopo del día con el signo ya validado', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} />);

      expect(screen.getByTestId('horoscope-sign-panel')).toHaveTextContent(ZodiacSign.TAURUS);
    });

    it('⚠️ T-SEO-016: le pasa al panel el horóscopo resuelto en el servidor', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} initialHoroscope={SERVED} />);

      expect(screen.getByTestId('horoscope-sign-panel')).toHaveAttribute(
        'data-initial-date',
        '2026-09-12'
      );
    });

    it('sigue funcionando sin horóscopo servido (API caída en el render)', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} />);

      expect(screen.getByTestId('horoscope-sign-panel')).toHaveAttribute('data-initial-date', '');
    });

    it('vuelve al hub con un enlace real, para que el crawler lo recorra', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} />);

      expect(screen.getByTestId('back-to-horoscope-hub')).toHaveAttribute('href', '/horoscopo');
    });
  });

  describe('segmento inválido', () => {
    beforeEach(() => {
      notFoundMock.mockClear();
    });

    it('⚠️ T-SEO-006: llama a notFound() para que la respuesta sea un 404 real', () => {
      // Antes servía una ficha de "Signo no válido" en 200: un soft-404, que es
      // justo lo que Google indexa como URL válida y vacía.
      expect(() => render(<HoroscopeSignRoute sign="unicornio" />)).toThrow('NEXT_NOT_FOUND');
      expect(notFoundMock).toHaveBeenCalled();
    });

    it('no corta el render para un signo válido', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} />);

      expect(notFoundMock).not.toHaveBeenCalled();
    });
  });
});
