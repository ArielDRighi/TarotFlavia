/**
 * HoroscopeSignRoute - Tests (T-SEO-004)
 *
 * Es el componente de ruta (servidor) de `/horoscopo/[sign]`: valida el segmento,
 * sirve la ficha estática del signo y deja el horóscopo del día —que depende del
 * día calendario local del visitante— en el panel cliente.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HoroscopeSignRoute } from './HoroscopeSignRoute';
import { ZodiacSign } from '@/types/horoscope.types';

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
    it('muestra el mensaje de signo no válido', () => {
      render(<HoroscopeSignRoute sign="unicornio" />);

      expect(screen.getByTestId('sign-not-found')).toBeInTheDocument();
      expect(screen.getByText('Signo no válido')).toBeInTheDocument();
    });

    it('no renderiza la ficha ni consulta el horóscopo', () => {
      render(<HoroscopeSignRoute sign="unicornio" />);

      expect(screen.queryByTestId('zodiac-sign-profile')).not.toBeInTheDocument();
      expect(screen.queryByTestId('horoscope-sign-panel')).not.toBeInTheDocument();
    });

    it('ofrece la salida al listado de signos', () => {
      render(<HoroscopeSignRoute sign="unicornio" />);

      expect(screen.getByRole('link', { name: /ver todos los signos/i })).toHaveAttribute(
        'href',
        '/horoscopo'
      );
    });
  });
});
