/**
 * AspectsTable Component
 *
 * Displays aspects between planets in a table format showing:
 * - Aspect type with symbol and nature (harmonious/challenging/neutral)
 * - Planets involved
 * - Orb (precision)
 * - Nature badges
 * - Filters by type and planet
 */

'use client';

import { useMemo, useState } from 'react';
import { Filter, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PLANETS, ASPECTS, Planet, AspectType } from '@/types/birth-chart.enums';
import type { ChartAspect } from '@/types/birth-chart.types';

interface AspectsTableProps {
  aspects: ChartAspect[];
  showCard?: boolean;
  maxItems?: number;
  filterByPlanet?: string;
  showFilters?: boolean;
  onAspectClick?: (aspect: ChartAspect) => void;
}

type FilterType = 'all' | 'harmonious' | 'challenging';

export function AspectsTable({
  aspects,
  showCard = true,
  maxItems,
  filterByPlanet,
  showFilters = true,
  onAspectClick,
}: AspectsTableProps) {
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [planetFilter, setPlanetFilter] = useState<string>(filterByPlanet || 'all');

  // Lista de planetas únicos en los aspectos
  const uniquePlanets = useMemo(() => {
    const planets = new Set<string>();
    aspects.forEach((a) => {
      planets.add(a.planet1);
      planets.add(a.planet2);
    });
    return Array.from(planets);
  }, [aspects]);

  // Filtrar aspectos
  const filteredAspects = useMemo(() => {
    let filtered = [...aspects];

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((aspect) => {
        const metadata = ASPECTS[aspect.aspectType as AspectType];
        return metadata?.nature === typeFilter;
      });
    }

    // Filtrar por planeta
    if (planetFilter !== 'all') {
      filtered = filtered.filter(
        (aspect) => aspect.planet1 === planetFilter || aspect.planet2 === planetFilter
      );
    }

    // Ordenar por orbe (más exacto primero)
    filtered.sort((a, b) => a.orb - b.orb);

    // Limitar cantidad
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [aspects, typeFilter, planetFilter, maxItems]);

  // Obtener metadata del aspecto
  const getAspectInfo = (aspect: ChartAspect) => {
    const metadata = ASPECTS[aspect.aspectType as AspectType];
    return {
      name: metadata?.name || aspect.aspectType,
      symbol: metadata?.symbol || '?',
      nature: metadata?.nature || 'neutral',
    };
  };

  // Obtener color según naturaleza del aspecto
  const getAspectColor = (nature: string) => {
    switch (nature) {
      case 'harmonious':
        return 'text-green-500 bg-green-500/10';
      case 'challenging':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-purple-500 bg-purple-500/10';
    }
  };

  // Obtener info del planeta
  const getPlanetInfo = (planetKey: string) => {
    const metadata = PLANETS[planetKey as Planet];
    return {
      name: metadata?.name || planetKey,
      symbol: metadata?.symbol || planetKey.charAt(0).toUpperCase(),
    };
  };

  const TableContent = (
    <>
      {/* Filtros */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2 p-4 sm:p-0">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="harmonious">Armónicos</SelectItem>
              <SelectItem value="challenging">Desafiantes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planetFilter} onValueChange={setPlanetFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Planeta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los planetas</SelectItem>
              {uniquePlanets.map((planet) => {
                const info = getPlanetInfo(planet);
                return (
                  <SelectItem key={planet} value={planet}>
                    {info.symbol} {info.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aspecto</TableHead>
            <TableHead className="text-center">Planeta 1</TableHead>
            <TableHead className="hidden text-center sm:table-cell">Tipo</TableHead>
            <TableHead className="text-center">Planeta 2</TableHead>
            <TableHead className="text-right">Orbe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAspects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                No se encontraron aspectos con los filtros seleccionados
              </TableCell>
            </TableRow>
          ) : (
            filteredAspects.map((aspect, index) => {
              const aspectInfo = getAspectInfo(aspect);
              const planet1Info = getPlanetInfo(aspect.planet1);
              const planet2Info = getPlanetInfo(aspect.planet2);

              return (
                <TableRow
                  key={`${aspect.planet1}-${aspect.planet2}-${aspect.aspectType}-${index}`}
                  className={cn(onAspectClick && 'hover:bg-muted/50 cursor-pointer')}
                  onClick={() => onAspectClick?.(aspect)}
                >
                  {/* Aspecto con símbolo */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('text-lg', getAspectColor(aspectInfo.nature))}
                      >
                        {aspectInfo.symbol}
                      </Badge>
                      <span className="hidden sm:inline">{aspectInfo.name}</span>
                    </div>
                  </TableCell>

                  {/* Planeta 1 */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-lg">{planet1Info.symbol}</TooltipTrigger>
                        <TooltipContent>{planet1Info.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Tipo (solo desktop) */}
                  <TableCell className="hidden text-center sm:table-cell">
                    <Badge
                      variant={
                        aspectInfo.nature === 'harmonious'
                          ? 'default'
                          : aspectInfo.nature === 'challenging'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="text-xs"
                    >
                      {aspectInfo.nature === 'harmonious'
                        ? 'Armónico'
                        : aspectInfo.nature === 'challenging'
                          ? 'Desafiante'
                          : 'Neutro'}
                    </Badge>
                  </TableCell>

                  {/* Planeta 2 */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-lg">{planet2Info.symbol}</TooltipTrigger>
                        <TooltipContent>{planet2Info.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Orbe */}
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          className={cn(
                            'font-mono text-sm',
                            aspect.orb <= 2 && 'font-medium text-green-500',
                            aspect.orb > 5 && 'text-muted-foreground'
                          )}
                        >
                          {aspect.orb.toFixed(1)}°
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Orbe: {aspect.orb.toFixed(2)}°</p>
                          <p className="text-muted-foreground text-xs">
                            {aspect.orb <= 2
                              ? 'Aspecto muy exacto'
                              : aspect.orb <= 5
                                ? 'Aspecto moderado'
                                : 'Aspecto amplio'}
                          </p>
                          <p className="mt-1 text-xs">
                            {aspect.isApplying ? '↗ Aplicativo' : '↘ Separativo'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Leyenda */}
      <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 px-4 text-xs sm:px-0">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-green-500/20" />
          <span>Armónico (fluye)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-red-500/20" />
          <span>Desafiante (tensión)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-purple-500/20" />
          <span>Neutro (fusión)</span>
        </div>
      </div>
    </>
  );

  if (!showCard) {
    return TableContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Aspectos Planetarios
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="text-muted-foreground h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Los aspectos son ángulos entre planetas que indican cómo interactúan sus energías.
                  Los aspectos armónicos fluyen fácilmente, mientras los desafiantes generan tensión
                  creativa.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>{aspects.length} aspectos encontrados entre planetas</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">{TableContent}</CardContent>
    </Card>
  );
}
