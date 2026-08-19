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

/** `notFound()` corta el render lanzando; el mock reproduce ese contrato. */
const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

vi.mock('./HoroscopeSignPanel', () => ({
  HoroscopeSignPanel: ({ sign }: { sign: ZodiacSign }) => (
    <div data-testid="horoscope-sign-panel">{sign}</div>
  ),
}));

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

    it('no renderiza la ficha ni consulta el horóscopo', () => {
      expect(() => render(<HoroscopeSignRoute sign="unicornio" />)).toThrow();

      expect(screen.queryByTestId('zodiac-sign-profile')).not.toBeInTheDocument();
      expect(screen.queryByTestId('horoscope-sign-panel')).not.toBeInTheDocument();
    });

    it('no corta el render para un signo válido', () => {
      render(<HoroscopeSignRoute sign={ZodiacSign.TAURUS} />);

      expect(notFoundMock).not.toHaveBeenCalled();
    });
  });
});
