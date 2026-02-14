/**
 * ElementDistribution Component
 *
 * Displays the distribution of planets by element (fire, earth, air, water)
 * and modality (cardinal, fixed, mutable) in a birth chart.
 *
 * Features:
 * - Visual representation with icons and progress bars
 * - Highlights dominant element and modality
 * - Tooltips with descriptions
 * - Compact mode for smaller layouts
 * - Optional modalities section
 */

'use client';

import { useMemo } from 'react';
import { Flame, Mountain, Wind, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ChartDistribution } from '@/types/birth-chart.types';

interface ElementDistributionProps {
  distribution: ChartDistribution;
  showCard?: boolean;
  showModalities?: boolean;
  compact?: boolean;
}

// Element configuration
const ELEMENTS_CONFIG = {
  Fuego: {
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    bgLight: 'bg-red-500/10',
    description: 'Energía, acción, inspiración',
    signs: 'Aries, Leo, Sagitario',
  },
  Tierra: {
    icon: Mountain,
    color: 'text-green-600',
    bgColor: 'bg-green-600',
    bgLight: 'bg-green-600/10',
    description: 'Practicidad, estabilidad, materialidad',
    signs: 'Tauro, Virgo, Capricornio',
  },
  Aire: {
    icon: Wind,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    bgLight: 'bg-yellow-500/10',
    description: 'Comunicación, ideas, conexiones',
    signs: 'Géminis, Libra, Acuario',
  },
  Agua: {
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    description: 'Emociones, intuición, profundidad',
    signs: 'Cáncer, Escorpio, Piscis',
  },
};

// Modality configuration
const MODALITIES_CONFIG = {
  Cardinal: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    description: 'Iniciativa, liderazgo, comienzos',
    signs: 'Aries, Cáncer, Libra, Capricornio',
  },
  Fijo: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    description: 'Persistencia, estabilidad, determinación',
    signs: 'Tauro, Leo, Escorpio, Acuario',
  },
  Mutable: {
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500',
    description: 'Adaptabilidad, flexibilidad, cambio',
    signs: 'Géminis, Virgo, Sagitario, Piscis',
  },
};

export function ElementDistribution({
  distribution,
  showCard = true,
  showModalities = true,
  compact = false,
}: ElementDistributionProps) {
  // Find dominant element
  const dominantElement = useMemo(() => {
    return distribution.elements.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    );
  }, [distribution.elements]);

  // Find dominant modality
  const dominantModality = useMemo(() => {
    return distribution.modalities.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    );
  }, [distribution.modalities]);

  const ElementsSection = (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {distribution.elements.map((element) => {
        const config = ELEMENTS_CONFIG[element.name as keyof typeof ELEMENTS_CONFIG];
        const Icon = config?.icon || Flame;
        const isDominant = element.name === dominantElement.name;

        return (
          <TooltipProvider key={element.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-2 transition-colors',
                    isDominant && config?.bgLight,
                    !compact && 'p-3'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 rounded-full p-2', config?.bgLight)}>
                    <Icon className={cn('h-4 w-4', config?.color)} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isDominant && 'text-foreground',
                          !isDominant && 'text-muted-foreground'
                        )}
                      >
                        {element.name}
                        {isDominant && <span className="text-primary ml-2 text-xs">Dominante</span>}
                      </span>
                      <span className="font-mono text-sm">
                        {element.count} ({element.percentage}%)
                      </span>
                    </div>

                    {/* Progress bar */}
                    <Progress
                      value={element.percentage}
                      className={cn('h-2', config?.bgLight)}
                      indicatorClassName={config?.bgColor}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">{element.name}</p>
                <p className="text-muted-foreground text-sm">{config?.description}</p>
                <p className="mt-1 text-xs">Signos: {config?.signs}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  const ModalitiesSection = showModalities && (
    <div className={cn('mt-6 space-y-3', compact && 'mt-4 space-y-2')}>
      <h4 className="text-muted-foreground text-sm font-medium">Modalidades</h4>
      {distribution.modalities.map((modality) => {
        const config = MODALITIES_CONFIG[modality.name as keyof typeof MODALITIES_CONFIG];
        const isDominant = modality.name === dominantModality.name;

        return (
          <TooltipProvider key={modality.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-20 text-sm',
                      isDominant ? 'font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {modality.name}
                  </span>
                  <div className="flex-1">
                    <Progress
                      value={modality.percentage}
                      className="h-2"
                      indicatorClassName={config?.bgColor}
                    />
                  </div>
                  <span className="w-16 text-right font-mono text-sm">
                    {modality.count} ({modality.percentage}%)
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">{modality.name}</p>
                <p className="text-muted-foreground text-sm">{config?.description}</p>
                <p className="mt-1 text-xs">Signos: {config?.signs}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  const Content = (
    <>
      {ElementsSection}
      {ModalitiesSection}

      {/* Summary */}
      <div className={cn('bg-muted/50 mt-6 rounded-lg p-3', compact && 'mt-4 p-2')}>
        <p className="text-sm">
          <span className="font-medium">Tu carta tiene predominancia de </span>
          <span
            className={ELEMENTS_CONFIG[dominantElement.name as keyof typeof ELEMENTS_CONFIG]?.color}
          >
            {dominantElement.name}
          </span>
          {showModalities && (
            <>
              <span className="font-medium"> con energía </span>
              <span
                className={
                  MODALITIES_CONFIG[dominantModality.name as keyof typeof MODALITIES_CONFIG]?.color
                }
              >
                {dominantModality.name}
              </span>
            </>
          )}
          <span>.</span>
        </p>
      </div>
    </>
  );

  if (!showCard) {
    return Content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribución de Elementos</CardTitle>
        <CardDescription>Balance de energías en tu carta natal</CardDescription>
      </CardHeader>
      <CardContent>{Content}</CardContent>
    </Card>
  );
}
