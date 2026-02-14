import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ChartWheel } from './ChartWheel';
import type { ChartSvgData } from '@/types/birth-chart.types';
import { Planet, ZodiacSign, AspectType } from '@/types/birth-chart.enums';

// Mock de next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
  }),
}));

// Mock del hook useChartWheel
vi.mock('./ChartWheel.hooks', () => ({
  useChartWheel: vi.fn(),
}));

// Import después del mock para que use la versión mockeada
import { useChartWheel } from './ChartWheel.hooks';

describe('ChartWheel', () => {
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
      {
        planet: Planet.MOON,
        sign: ZodiacSign.TAURUS,
        signName: 'Tauro',
        signDegree: 20.3,
        formattedPosition: "20°18'",
        house: 2,
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

  const mockUseChartWheel = {
    containerId: 'astrochart-test',
    containerRef: { current: null },
    calculatedSize: 500,
    isRendered: true,
    error: null,
    exportSvg: vi.fn().mockReturnValue('<svg></svg>'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useChartWheel as Mock).mockReturnValue(mockUseChartWheel);
  });

  describe('🔴 RED Phase - Tests que deben fallar', () => {
    it('debe renderizar el contenedor del gráfico', () => {
      render(<ChartWheel data={mockChartData} />);

      const container = screen.getByRole('img', {
        name: /gráfico de carta astral/i,
      });
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('id', 'astrochart-test');
    });

    it('debe mostrar error cuando hay un error', () => {
      (useChartWheel as Mock).mockReturnValue({
        ...mockUseChartWheel,
        error: 'Error al renderizar el gráfico',
        isRendered: false,
      });

      render(<ChartWheel data={mockChartData} />);

      expect(screen.getByText(/error al renderizar el gráfico/i)).toBeInTheDocument();
    });

    it('debe mostrar skeleton mientras no está renderizado', () => {
      (useChartWheel as Mock).mockReturnValue({
        ...mockUseChartWheel,
        isRendered: false,
        error: null,
      });

      render(<ChartWheel data={mockChartData} />);

      // El contenedor debe tener opacity-0 cuando no está renderizado
      const container = screen.getByRole('img');
      expect(container).toHaveClass('opacity-0');
    });

    it('debe ocultar skeleton cuando está renderizado', () => {
      (useChartWheel as Mock).mockReturnValue({
        ...mockUseChartWheel,
        isRendered: true,
      });

      render(<ChartWheel data={mockChartData} />);

      const container = screen.getByRole('img');
      expect(container).not.toHaveClass('opacity-0');
    });

    it('debe mostrar controles cuando showControls es true', () => {
      render(<ChartWheel data={mockChartData} showControls={true} />);

      const downloadButton = screen.getByRole('button', {
        name: /descargar/i,
      });
      expect(downloadButton).toBeInTheDocument();
    });

    it('debe ocultar controles cuando showControls es false', () => {
      render(<ChartWheel data={mockChartData} showControls={false} />);

      const downloadButton = screen.queryByRole('button', {
        name: /descargar/i,
      });
      expect(downloadButton).not.toBeInTheDocument();
    });

    it('debe aplicar className personalizado', () => {
      render(<ChartWheel data={mockChartData} className="custom-class" />);

      // El contenedor principal debe tener la clase personalizada
      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('debe pasar el tamaño correcto al hook', () => {
      const customSize = 600;
      render(<ChartWheel data={mockChartData} size={customSize} />);

      expect(useChartWheel).toHaveBeenCalledWith(
        expect.objectContaining({
          size: customSize,
        })
      );
    });

    it('debe pasar showAspects al hook', () => {
      render(<ChartWheel data={mockChartData} showAspects={false} />);

      expect(useChartWheel).toHaveBeenCalledWith(
        expect.objectContaining({
          showAspects: false,
        })
      );
    });

    it('debe pasar darkMode basado en el tema', () => {
      render(<ChartWheel data={mockChartData} />);

      expect(useChartWheel).toHaveBeenCalledWith(
        expect.objectContaining({
          darkMode: true, // porque useTheme devuelve 'dark'
        })
      );
    });

    it('debe pasar responsive al hook cuando se especifica', () => {
      render(<ChartWheel data={mockChartData} responsive={true} />);

      expect(useChartWheel).toHaveBeenCalledWith(
        expect.objectContaining({
          responsive: true,
        })
      );
    });

    it('debe llamar a exportSvg cuando se hace click en descargar', async () => {
      render(<ChartWheel data={mockChartData} showControls={true} />);

      const downloadButton = screen.getByRole('button', {
        name: /descargar/i,
      });
      downloadButton.click();

      await waitFor(() => {
        expect(mockUseChartWheel.exportSvg).toHaveBeenCalled();
      });
    });

    it('debe llamar al callback onExport si se proporciona', async () => {
      const onExport = vi.fn();
      render(<ChartWheel data={mockChartData} showControls={true} onExport={onExport} />);

      const downloadButton = screen.getByRole('button', {
        name: /descargar/i,
      });
      downloadButton.click();

      await waitFor(() => {
        expect(onExport).toHaveBeenCalledWith('<svg></svg>');
      });
    });

    it('debe renderizar el contenedor con el tamaño calculado', () => {
      const customCalculatedSize = 700;
      (useChartWheel as Mock).mockReturnValue({
        ...mockUseChartWheel,
        calculatedSize: customCalculatedSize,
      });

      render(<ChartWheel data={mockChartData} />);

      const container = screen.getByRole('img');
      expect(container).toHaveStyle({
        width: `${customCalculatedSize}px`,
        height: `${customCalculatedSize}px`,
      });
    });
  });
});
