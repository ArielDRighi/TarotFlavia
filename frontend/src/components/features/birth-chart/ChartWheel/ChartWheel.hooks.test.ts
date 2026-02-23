/**
 * Tests for useChartWheel hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChartWheel } from './ChartWheel.hooks';
import type { ChartSvgData } from '@/types/birth-chart.types';
import { Planet, ZodiacSign, AspectType } from '@/types/birth-chart.enums';

// Mock de astrodraw/astrochart
vi.mock('@astrodraw/astrochart', () => {
  interface MockChartInstance {
    radix: ReturnType<typeof vi.fn>;
  }

  const MockChart = vi.fn(function (this: MockChartInstance) {
    this.radix = vi.fn();
    return this;
  });

  return {
    Chart: MockChart,
  };
});

describe('useChartWheel', () => {
  const mockChartData: ChartSvgData = {
    planets: [
      {
        planet: Planet.SUN,
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        signDegree: 15.5,
        formattedPosition: "15°30'",
        house: 1,
        isRetrograde: false,
      },
    ],
    houses: [
      {
        house: 1,
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        signDegree: 0,
        formattedPosition: "0°00'",
      },
    ],
    aspects: [
      {
        planet1: Planet.SUN,
        planet1Name: 'Sol',
        planet2: Planet.MOON,
        planet2Name: 'Luna',
        aspectType: AspectType.CONJUNCTION,
        aspectName: 'Conjunción',
        aspectSymbol: '☌',
        orb: 2.5,
        isApplying: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock createElement para document.getElementById
    document.getElementById = vi.fn().mockReturnValue({
      innerHTML: '',
      querySelector: vi.fn().mockReturnValue(null),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('🔴 Validación de Datos', () => {
    it('debe establecer error cuando planets está vacío', async () => {
      const invalidData: ChartSvgData = {
        planets: [],
        houses: mockChartData.houses,
        aspects: [],
      };

      const { result } = renderHook(() => useChartWheel({ data: invalidData }));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isRendered).toBe(false);
      });
    });

    it.skip('debe establecer error cuando planet falta propiedad requerida', async () => {
      const invalidData: ChartSvgData = {
        planets: [
          {
            planet: Planet.SUN,
            // Falta sign, signDegree, house
          } as unknown as (typeof mockChartData.planets)[0],
        ],
        houses: mockChartData.houses,
        aspects: [],
      };

      const { result } = renderHook(() => useChartWheel({ data: invalidData }));

      await waitFor(() => {
        expect(result.current.error).toContain('no válidos');
        expect(result.current.isRendered).toBe(false);
      });
    });

    it.skip('debe establecer error cuando house falta propiedad requerida', async () => {
      const invalidData: ChartSvgData = {
        planets: mockChartData.planets,
        houses: [
          {
            house: 1,
            // Falta sign, signDegree
          } as unknown as (typeof mockChartData.houses)[0],
        ],
        aspects: [],
      };

      const { result } = renderHook(() => useChartWheel({ data: invalidData }));

      await waitFor(() => {
        expect(result.current.error).toContain('no válidos');
        expect(result.current.isRendered).toBe(false);
      });
    });

    it('debe renderizar correctamente con datos válidos', async () => {
      const { result } = renderHook(() => useChartWheel({ data: mockChartData }));

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.isRendered).toBe(true);
      });
    });
  });

  describe('🔴 Cleanup y Memory Leaks', () => {
    it.skip('debe cancelar requestAnimationFrame al desmontar', async () => {
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const { unmount } = renderHook(() => useChartWheel({ data: mockChartData }));

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });

    it.skip('debe limpiar el contenedor al desmontar', async () => {
      const mockContainer = {
        innerHTML: '<svg></svg>',
        querySelector: vi.fn().mockReturnValue({}),
      };

      document.getElementById = vi.fn().mockReturnValue(mockContainer);

      const { unmount } = renderHook(() => useChartWheel({ data: mockChartData }));

      unmount();

      expect(mockContainer.innerHTML).toBe('');
    });

    it('no debe actualizar estado después de desmontar', async () => {
      const { result, unmount } = renderHook(() => useChartWheel({ data: mockChartData }));

      const initialError = result.current.error;
      unmount();

      // Esperar para asegurar que ningún estado se actualiza
      await new Promise((resolve) => setTimeout(resolve, 100));

      // El error no debe haber cambiado después del unmount
      expect(result.current.error).toBe(initialError);
    });
  });

  describe('🔴 Hook Return Values', () => {
    it('debe retornar un containerId único', () => {
      const { result: result1 } = renderHook(() => useChartWheel({ data: mockChartData }));
      const { result: result2 } = renderHook(() => useChartWheel({ data: mockChartData }));

      expect(result1.current.containerId).toBeTruthy();
      expect(result2.current.containerId).toBeTruthy();
      expect(result1.current.containerId).not.toBe(result2.current.containerId);
    });
  });
});
