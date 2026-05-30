/**
 * Tests for HoroscopeWidget Component
 *
 * Cubre los distintos estados del widget según la respuesta del backend:
 * - Loading
 * - Success (horóscopo del día disponible)
 * - 400: usuario sin fecha de nacimiento → CTA "Configurar"
 * - 404: horóscopo aún no generado → mensaje "se está preparando"
 * - 5xx / error genérico → mensaje de error + botón "Reintentar"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HoroscopeWidget } from './HoroscopeWidget';
import * as useHoroscopeModule from '@/hooks/api/useHoroscope';
import { ZodiacSign, type DailyHoroscope } from '@/types/horoscope.types';

vi.mock('@/hooks/api/useHoroscope', async () => {
  const actual = await vi.importActual<typeof useHoroscopeModule>('@/hooks/api/useHoroscope');
  return {
    ...actual,
    useMySignHoroscope: vi.fn(),
  };
});

const mockHoroscope: DailyHoroscope = {
  id: 1,
  zodiacSign: ZodiacSign.ARIES,
  horoscopeDate: '2026-05-29',
  generalContent: 'Hoy es un día propicio para nuevos comienzos.',
  areas: {
    love: { content: 'Amor en el aire', score: 8 },
    wellness: { content: 'Energía alta', score: 9 },
    money: { content: 'Cuidado con gastos', score: 6 },
  },
  luckyNumber: 7,
  luckyColor: 'Rojo',
  luckyTime: 'Mañana',
};

type HookReturn = ReturnType<typeof useHoroscopeModule.useMySignHoroscope>;

function mockHook(overrides: Partial<HookReturn>): void {
  vi.mocked(useHoroscopeModule.useMySignHoroscope).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    errorState: null,
    isRefetching: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as HookReturn);
}

describe('HoroscopeWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render skeleton while loading', () => {
      mockHook({ isLoading: true });

      render(<HoroscopeWidget />);

      expect(screen.getByTestId('horoscope-widget-loading')).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    it('should render horoscope content when data is available', () => {
      mockHook({ data: mockHoroscope, isSuccess: true });

      render(<HoroscopeWidget />);

      expect(screen.getByTestId('horoscope-widget')).toBeInTheDocument();
      expect(screen.getByText('Aries')).toBeInTheDocument();
      expect(screen.getByText('Hoy es un día propicio para nuevos comienzos.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ver más/i })).toHaveAttribute(
        'href',
        '/horoscopo/aries'
      );
    });
  });

  describe('Error state: no-birthdate (400)', () => {
    it('should show CTA to configure birth date', () => {
      mockHook({
        isError: true,
        errorState: 'no-birthdate',
        error: new Error('birthDate required'),
      });

      render(<HoroscopeWidget />);

      expect(screen.getByTestId('horoscope-widget-no-birthdate')).toBeInTheDocument();
      expect(screen.getByText(/configura tu fecha de nacimiento/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /configurar/i })).toHaveAttribute('href', '/perfil');
    });

    it('should NOT show the "not-generated" message', () => {
      mockHook({
        isError: true,
        errorState: 'no-birthdate',
        error: new Error('birthDate required'),
      });

      render(<HoroscopeWidget />);

      expect(screen.queryByText(/se está preparando/i)).not.toBeInTheDocument();
    });
  });

  describe('Error state: not-generated (404)', () => {
    it('should show "preparing" message, NOT the birth date CTA', () => {
      mockHook({
        isError: true,
        errorState: 'not-generated',
        error: new Error('Horoscope not found'),
      });

      render(<HoroscopeWidget />);

      expect(screen.getByTestId('horoscope-widget-not-generated')).toBeInTheDocument();
      expect(screen.getByText(/tu horóscopo de hoy se está preparando/i)).toBeInTheDocument();
      // Crítico: NO debe pedir configurar fecha
      expect(screen.queryByText(/configura tu fecha de nacimiento/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /configurar/i })).not.toBeInTheDocument();
    });
  });

  describe('Error state: generic error (5xx / network)', () => {
    it('should show generic error message with retry button', () => {
      mockHook({
        isError: true,
        errorState: 'error',
        error: new Error('Internal Server Error'),
      });

      render(<HoroscopeWidget />);

      expect(screen.getByTestId('horoscope-widget-error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
      // No debe mostrar el CTA de fecha de nacimiento
      expect(screen.queryByText(/configura tu fecha de nacimiento/i)).not.toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const refetch = vi.fn();
      mockHook({
        isError: true,
        errorState: 'error',
        error: new Error('Internal Server Error'),
        refetch,
      });

      render(<HoroscopeWidget />);

      await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });
});
