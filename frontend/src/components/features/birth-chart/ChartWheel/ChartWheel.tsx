'use client';

import { Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useChartWheel } from './ChartWheel.hooks';
import type { ChartSvgData } from '@/types/birth-chart.types';
import { cn } from '@/lib/utils';

export interface ChartWheelProps {
  /**
   * Datos de la carta astral (planetas, casas, aspectos)
   */
  data: ChartSvgData;

  /**
   * Tamaño máximo del gráfico en píxeles (si responsive=true, se ajustará al contenedor)
   * @default 600
   */
  size?: number;

  /**
   * Mostrar líneas de aspectos en el gráfico
   * @default true
   */
  showAspects?: boolean;

  /**
   * Mostrar controles (descargar, etc.)
   * @default true
   */
  showControls?: boolean;

  /**
   * Si es true, el tamaño se ajusta automáticamente al contenedor padre
   * @default false
   */
  responsive?: boolean;

  /**
   * Callback cuando se exporta el SVG
   */
  onExport?: (svg: string) => void;

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
 *   showControls={true}
 * />
 * ```
 */
export function ChartWheel({
  data,
  size = 600,
  showAspects = true,
  showControls = true,
  responsive = false,
  onExport,
  className,
}: ChartWheelProps) {
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === 'dark';

  const { containerId, isRendered, error, exportSvg, containerRef, calculatedSize } = useChartWheel(
    {
      data,
      size,
      showAspects,
      darkMode,
      responsive,
    }
  );

  // Handler para exportar SVG
  const handleExport = () => {
    const svg = exportSvg();
    if (svg && onExport) {
      onExport(svg);
    }

    // Download file
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carta-astral-${Date.now()}.svg`;

      // Append al DOM, click y remove para asegurar descarga en todos los navegadores
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Revocar el objeto URL en un microtask para evitar interrumpir la descarga
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 0);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="chart-wheel-container">
      {/* Controles superiores */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {isRendered && 'Gráfico renderizado'}
            {!isRendered && !error && 'Cargando gráfico...'}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!isRendered || !!error}
            data-testid="export-button"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar SVG
          </Button>
        </div>
      )}

      {/* Contenedor del gráfico */}
      <div
        ref={containerRef}
        className={cn('relative flex items-center justify-center', className)}
      >
        {/* Skeleton loader */}
        {!isRendered && !error && (
          <div
            className="bg-muted animate-pulse rounded-full"
            style={{ width: calculatedSize, height: calculatedSize }}
            data-testid="chart-skeleton"
          />
        )}

        {/* Error state */}
        {error && (
          <div
            className="border-destructive/50 bg-destructive/10 text-destructive flex items-center justify-center rounded-lg border p-8"
            style={{ width: calculatedSize, height: calculatedSize }}
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
          style={{ width: calculatedSize, height: calculatedSize }}
          className={cn(
            'transition-opacity duration-300',
            isRendered && !error ? 'opacity-100' : 'opacity-0'
          )}
          data-testid="chart-container"
        />
      </div>
    </div>
  );
}
