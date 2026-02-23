'use client';

import { useTheme } from 'next-themes';
import { useChartWheel } from './ChartWheel.hooks';
import type { ChartSvgData } from '@/types/birth-chart.types';
import { cn } from '@/lib/utils';

export interface ChartWheelProps {
  /**
   * Datos de la carta astral (planetas, casas, aspectos)
   */
  data: ChartSvgData;

  /**
   * Tamaño del gráfico en píxeles
   * @default 600
   */
  size?: number;

  /**
   * Mostrar líneas de aspectos en el gráfico
   * @default true
   */
  showAspects?: boolean;

  /**
   * Habilitar interactividad (click en planetas, etc.)
   * @default false
   */
  interactive?: boolean;

  /**
   * Callback cuando se hace click en un planeta
   */
  onPlanetClick?: (planet: string) => void;

  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
}

/**
 * Componente ChartWheel - Gráfico circular de carta astral
 *
 * Renderiza la carta astral usando la librería @astrodraw/astrochart
 * con los colores de branding de Auguria.
 *
 * @example
 * ```tsx
 * <ChartWheel
 *   data={chartData}
 *   size={600}
 *   showAspects={true}
 *   onPlanetClick={(planet) => console.log(planet)}
 * />
 * ```
 */
export function ChartWheel({
  data,
  size = 600,
  showAspects = true,
  interactive = false,
  onPlanetClick,
  className,
}: ChartWheelProps) {
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === 'dark';

  const { containerId, isRendered, error, selectedPlanet, setSelectedPlanet } = useChartWheel({
    data,
    size,
    showAspects,
    darkMode,
  });

  // Handler para click en planetas (si es interactivo)
  const handlePlanetClick = (planet: string) => {
    if (!interactive) return;

    setSelectedPlanet(planet);
    if (onPlanetClick) {
      onPlanetClick(planet);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="chart-wheel-container">
      {/* Contenedor del gráfico */}
      <div className={cn('relative flex items-center justify-center', className)}>
        {/* Skeleton loader */}
        {!isRendered && !error && (
          <div
            className="bg-muted animate-pulse rounded-full"
            style={{ width: size, height: size }}
            data-testid="chart-skeleton"
          />
        )}

        {/* Error state */}
        {error && (
          <div
            className="border-destructive/50 bg-destructive/10 text-destructive flex items-center justify-center rounded-lg border p-8"
            style={{ width: size, height: size }}
            data-testid="chart-error"
          >
            <div className="text-center">
              <p className="font-semibold">Error al renderizar gráfico</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Gráfico (astrochart lo renderiza aquí) */}
        <div
          id={containerId}
          role="img"
          aria-label="Gráfico de carta astral"
          style={{ width: size, height: size }}
          className={cn(
            'transition-opacity duration-300',
            isRendered && !error ? 'opacity-100' : 'opacity-0',
            interactive && 'cursor-pointer'
          )}
          onClick={() => interactive && selectedPlanet && handlePlanetClick(selectedPlanet)}
          data-testid="chart-container"
        />
      </div>

      {/* Información del planeta seleccionado (si es interactivo) */}
      {interactive && selectedPlanet && (
        <div className="bg-card rounded-lg border p-4 text-sm" data-testid="selected-planet-info">
          <p className="font-semibold">Planeta seleccionado:</p>
          <p className="text-muted-foreground">{selectedPlanet}</p>
        </div>
      )}
    </div>
  );
}
