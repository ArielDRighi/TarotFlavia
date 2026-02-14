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
  /** Si es true, el tamaño se calcula automáticamente basado en el contenedor padre */
  responsive?: boolean;
}

export interface UseChartWheelReturn {
  isRendered: boolean;
  error: string | null;
  exportSvg: () => string;
  containerId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  calculatedSize: number;
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
  responsive = false,
}: UseChartWheelParams): UseChartWheelReturn {
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedSize, setCalculatedSize] = useState<number>(size);
  const chartRef = useRef<AstroChart | null>(null);
  const containerIdRef = useRef<string>(generateChartContainerId());
  const rafIdRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver para calcular tamaño responsive
  useEffect(() => {
    if (!responsive || !containerRef.current) {
      setCalculatedSize(size);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Usar el menor de ancho/alto para mantener el gráfico cuadrado
        const newSize = Math.min(width, height, size);
        setCalculatedSize(newSize);
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [responsive, size]);

  // Validar estructura de datos
  const validateData = useCallback((dataToValidate: ChartSvgData): boolean => {
    if (!Array.isArray(dataToValidate.planets) || dataToValidate.planets.length === 0) {
      return false;
    }

    // Validar que cada planeta tenga las propiedades necesarias
    for (const planet of dataToValidate.planets) {
      const p = planet as unknown as Record<string, unknown>;
      if (
        typeof p.planet !== 'string' ||
        typeof p.sign !== 'string' ||
        typeof p.signDegree !== 'number' ||
        typeof p.house !== 'number'
      ) {
        return false;
      }
    }

    // Validar casas si existen
    if (dataToValidate.houses && Array.isArray(dataToValidate.houses)) {
      for (const house of dataToValidate.houses) {
        const h = house as unknown as Record<string, unknown>;
        if (
          typeof h.house !== 'number' ||
          typeof h.sign !== 'string' ||
          typeof h.signDegree !== 'number'
        ) {
          return false;
        }
      }
    }

    return true;
  }, []);

  // Renderizar gráfico
  const renderChart = useCallback(() => {
    try {
      setError(null);
      setIsRendered(false);

      // Validar datos
      if (!validateData(data)) {
        throw new Error(
          'Datos de carta astral no válidos. Verifica que planets contenga planet, sign, signDegree y house.'
        );
      }

      // Limpiar gráfico anterior
      if (chartRef.current) {
        const container = document.getElementById(containerIdRef.current);
        if (container) {
          container.innerHTML = '';
        }
        chartRef.current = null;
      }

      // Cancelar requestAnimationFrame anterior si existe
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Esperar siguiente frame para asegurar que el DOM esté listo
      rafIdRef.current = requestAnimationFrame(() => {
        // Guard: no procesar si el componente fue desmontado
        if (!isMountedRef.current) {
          return;
        }

        try {
          // Convertir datos (ahora validados)
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
            calculatedSize,
            calculatedSize,
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

          // Guard: solo actualizar estado si el componente sigue montado
          if (isMountedRef.current) {
            setIsRendered(true);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al renderizar gráfico';
          if (isMountedRef.current) {
            setError(errorMessage);
            setIsRendered(false);
          }
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al preparar datos';
      setError(errorMessage);
      setIsRendered(false);
    }
  }, [data, calculatedSize, showAspects, darkMode, validateData]);

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
    isMountedRef.current = true;
    renderChart();

    // Copiar el ID actual para usar en cleanup
    const currentContainerId = containerIdRef.current;

    // Cleanup al desmontar
    return () => {
      isMountedRef.current = false;

      // Cancelar requestAnimationFrame pendiente
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Limpiar gráfico
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
    exportSvg,
    containerId: containerIdRef.current,
    containerRef,
    calculatedSize,
  };
}
