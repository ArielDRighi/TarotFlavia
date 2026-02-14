import { useState, useEffect, useCallback, useRef } from 'react';
import { Chart } from '@astrodraw/astrochart';
import type {
  PlanetPosition,
  HouseCusp,
  ChartAspect,
  ChartSvgData,
} from '@/types/birth-chart.types';
import {
  convertPlanetsToAstroChart,
  convertHousesToAstroChart,
  prepareAspectsForChart,
  generateChartContainerId,
  type AstroChartPoint,
  type AstroChartAspect,
} from '../lib/astrochart.utils';
import { getChartSettings, type AstrochartSettings } from '../lib/astrochart.config';

export interface UseChartWheelParams {
  data: ChartSvgData;
  size?: number;
  showAspects?: boolean;
  darkMode?: boolean;
}

export interface UseChartWheelReturn {
  isRendered: boolean;
  error: string | null;
  selectedPlanet: string | null;
  setSelectedPlanet: (planet: string | null) => void;
  exportSvg: () => string;
  containerId: string;
}

/**
 * Estructura de datos para radix del chart
 */
interface RadixData {
  planets: AstroChartPoint[];
  cusps: number[];
  aspects?: AstroChartAspect[];
}

/**
 * Interface mínima para Chart de astrodraw (tipos parciales debido a librería externa)
 */
interface AstroChart {
  radix: (data: RadixData) => void;
}

export function useChartWheel({
  data,
  size = 600,
  showAspects = true,
  darkMode = false,
}: UseChartWheelParams): UseChartWheelReturn {
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const chartRef = useRef<AstroChart | null>(null);
  const containerIdRef = useRef<string>(generateChartContainerId());

  // Renderizar gráfico
  const renderChart = useCallback(() => {
    try {
      setError(null);
      setIsRendered(false);

      // Validar datos
      if (!data.planets || data.planets.length === 0) {
        throw new Error('Datos de planetas no válidos');
      }

      // Limpiar gráfico anterior
      if (chartRef.current) {
        const container = document.getElementById(containerIdRef.current);
        if (container) {
          container.innerHTML = '';
        }
        chartRef.current = null;
      }

      // Esperar siguiente frame para asegurar que el DOM esté listo
      requestAnimationFrame(() => {
        try {
          // Convertir datos
          const planets = convertPlanetsToAstroChart(data.planets as PlanetPosition[]);
          const cusps = convertHousesToAstroChart(data.houses as HouseCusp[]);

          // Preparar aspectos si se deben mostrar
          let aspects: AstroChartAspect[] | undefined;
          if (showAspects && data.aspects && data.aspects.length > 0) {
            aspects = prepareAspectsForChart(data.aspects as ChartAspect[]);
          }

          // Seleccionar configuración según modo oscuro
          const settings: AstrochartSettings = getChartSettings(darkMode ? 'dark' : 'light');

          // Crear instancia del gráfico
          // astrochart v3 API: new Chart(elementId, width, height, settings)
          // Usamos unknown temporalmente y luego type assertion a nuestra interfaz
          const chart = new Chart(
            containerIdRef.current,
            size,
            size,
            settings as unknown as Partial<Record<string, unknown>>
          ) as unknown as AstroChart;

          // Preparar datos para radix
          const chartData: RadixData = {
            planets,
            cusps,
            ...(aspects && { aspects }),
          };

          // Renderizar con los datos
          chart.radix(chartData);

          chartRef.current = chart;
          setIsRendered(true);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al renderizar gráfico';
          setError(errorMessage);
          setIsRendered(false);
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al preparar datos';
      setError(errorMessage);
      setIsRendered(false);
    }
  }, [data, size, showAspects, darkMode]);

  // Exportar SVG
  const exportSvg = useCallback((): string => {
    const container = document.getElementById(containerIdRef.current);
    if (!container) {
      return '';
    }

    const svgElement = container.querySelector('svg');
    if (!svgElement) {
      return '';
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  }, []);

  // Renderizar gráfico cuando cambien las dependencias
  useEffect(() => {
    renderChart();

    // Copiar el ID actual para usar en cleanup
    const currentContainerId = containerIdRef.current;

    // Cleanup al desmontar
    return () => {
      if (chartRef.current) {
        const container = document.getElementById(currentContainerId);
        if (container) {
          container.innerHTML = '';
        }
        chartRef.current = null;
      }
    };
  }, [renderChart]);

  return {
    isRendered,
    error,
    selectedPlanet,
    setSelectedPlanet,
    exportSvg,
    containerId: containerIdRef.current,
  };
}
