import { useState, useEffect, useCallback, useRef } from 'react';
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
  type AstroChartPlanets,
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
  containerId: string;
}

/**
 * Estructura de datos para radix del chart
 * Formato esperado por astrochart.Chart.radix()
 */
interface RadixData {
  planets: AstroChartPlanets;
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
  /**
   * Se incrementa en cada cleanup. Como el `import()` dinámico de astrochart
   * puede tardar lo que tarde la descarga del chunk, al volver del `await` hay
   * que confirmar que este render sigue vigente: sin esto, desmontar el
   * componente mientras el chunk viaja dejaba un `Chart` construido contra un
   * contenedor que ya no existe, y nadie lo limpiaba nunca.
   */
  const renderGenerationRef = useRef(0);

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
      requestAnimationFrame(async () => {
        try {
          // `@astrodraw/astrochart` toca `self` al evaluarse, así que importarla
          // arriba del módulo rompía el prerender de `/carta-astral/resultado`
          // ("ReferenceError: self is not defined"). El `AuthProvider` lo tapaba
          // porque nunca llegaba a renderizar la página en el servidor; al quitar
          // ese bloqueo (T-PROD-022) el error salió a la luz. Acá ya estamos en el
          // browser, dentro de un `requestAnimationFrame`.
          const generation = renderGenerationRef.current;
          const { Chart } = await import('@astrodraw/astrochart');

          // El componente se desmontó (o se relanzó el render) mientras cargaba.
          if (generation !== renderGenerationRef.current) {
            return;
          }

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

  // Renderizar gráfico cuando cambien las dependencias
  useEffect(() => {
    renderChart();

    // Copiar el ID actual para usar en cleanup
    const currentContainerId = containerIdRef.current;

    // Cleanup al desmontar
    return () => {
      // Invalida cualquier `import()` en vuelo (ver `renderGenerationRef`).
      renderGenerationRef.current += 1;

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
    containerId: containerIdRef.current,
  };
}
