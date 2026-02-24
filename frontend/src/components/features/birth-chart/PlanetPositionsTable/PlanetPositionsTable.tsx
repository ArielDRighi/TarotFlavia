/**
 * PlanetPositionsTable Component
 *
 * Displays planetary positions in a table format showing:
 * - Planet symbol and name
 * - Zodiac sign with element-based coloring
 * - Exact position (degrees and minutes)
 * - House placement
 * - Retrograde indicator
 */

'use client';

import { RotateCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PLANETS, ZODIAC_SIGNS, Planet } from '@/types/birth-chart.enums';
import type { PlanetPosition } from '@/types/birth-chart.types';
import { formatDegreeSexagesimal } from '../lib/degree.utils';

interface PlanetPositionsTableProps {
  planets: PlanetPosition[];
  ascendant?: PlanetPosition;
  midheaven?: PlanetPosition;
  showCard?: boolean;
  compact?: boolean;
  highlightPlanet?: string;
  onPlanetClick?: (planet: PlanetPosition) => void;
}

/**
 * Get Tailwind color class based on zodiac element
 */
function getElementColor(signName: string): string {
  // Find the zodiac sign by matching the signName
  const signEntry = Object.entries(ZODIAC_SIGNS).find(([, data]) => data.name === signName);
  const element = signEntry?.[1].element || 'fire';

  const colors: Record<string, string> = {
    fire: 'text-red-500',
    earth: 'text-green-600',
    air: 'text-yellow-500',
    water: 'text-blue-500',
  };

  return colors[element] || 'text-foreground';
}

/**
 * Get planet display name and symbol
 */
function getPlanetInfo(planet: Planet): { name: string; symbol: string } {
  const planetData = PLANETS[planet];
  return {
    name: planetData?.name || planet,
    symbol: planetData?.symbol || '?',
  };
}

/**
 * Get zodiac sign display name and symbol
 */
function getSignInfo(signName: string): { name: string; symbol: string } {
  // Find the zodiac sign by matching the signName
  const signEntry = Object.entries(ZODIAC_SIGNS).find(([, data]) => data.name === signName);

  if (signEntry) {
    return {
      name: signEntry[1].name,
      symbol: signEntry[1].symbol,
    };
  }

  return {
    name: signName,
    symbol: '?',
  };
}

export function PlanetPositionsTable({
  planets,
  ascendant,
  midheaven,
  showCard = true,
  compact = false,
  highlightPlanet,
  onPlanetClick,
}: PlanetPositionsTableProps) {
  // Combine all positions (planets + ascendant + midheaven)
  const allPositions: Array<PlanetPosition & { displayName?: string; displaySymbol?: string }> = [
    ...planets,
  ];

  if (ascendant) {
    allPositions.push({
      ...ascendant,
      displayName: 'AC',
      displaySymbol: 'AC',
    });
  }

  if (midheaven) {
    allPositions.push({
      ...midheaven,
      displayName: 'MC',
      displaySymbol: 'MC',
    });
  }

  // Empty state
  if (allPositions.length === 0) {
    const emptyContent = (
      <div className="border-border bg-bg-main rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No hay datos de posiciones planetarias</p>
      </div>
    );

    return showCard ? (
      <Card>
        <CardHeader>
          <CardTitle>Posiciones Planetarias</CardTitle>
          <CardDescription>Ubicación de cada planeta en tu carta natal</CardDescription>
        </CardHeader>
        <CardContent>{emptyContent}</CardContent>
      </Card>
    ) : (
      emptyContent
    );
  }

  // Table content
  const tableContent = (
    <div className="rounded-lg border" data-compact={compact ? 'true' : 'false'}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Planeta</TableHead>
            <TableHead>Signo</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Casa</TableHead>
            <TableHead className="text-center">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPositions.map((position, index) => {
            const planetInfo = position.displayName
              ? { name: position.displayName, symbol: position.displaySymbol || '?' }
              : getPlanetInfo(position.planet);
            const signInfo = getSignInfo(position.signName);
            const formattedDegree = formatDegreeSexagesimal(position.signDegree);
            const isHighlighted = highlightPlanet === position.planet;

            return (
              <TableRow
                key={`${position.planet}-${index}`}
                onClick={() => onPlanetClick?.(position)}
                className={cn(
                  onPlanetClick && 'hover:bg-accent/50 cursor-pointer',
                  isHighlighted && 'bg-accent border-accent-foreground/20 border-l-4'
                )}
              >
                {/* Planet Name & Symbol */}
                <TableCell className="font-medium">
                  <div
                    className="flex items-center gap-2"
                    title={`${planetInfo.name} - ${signInfo.name}`}
                  >
                    <span className="text-lg" aria-label={`Símbolo de ${planetInfo.name}`}>
                      {planetInfo.symbol}
                    </span>
                    <span className={compact ? 'text-sm' : ''}>{planetInfo.name}</span>
                  </div>
                </TableCell>

                {/* Zodiac Sign */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn('text-lg', getElementColor(position.signName))}
                      aria-label={`Símbolo de ${signInfo.name}`}
                    >
                      {signInfo.symbol}
                    </span>
                    <span
                      className={cn(compact ? 'text-sm' : '', getElementColor(position.signName))}
                    >
                      {signInfo.name}
                    </span>
                  </div>
                </TableCell>

                {/* Position (Degrees & Minutes) */}
                <TableCell>
                  <div
                    className={cn('font-mono', compact ? 'text-sm' : '')}
                    title={`${formattedDegree} en ${signInfo.name}`}
                  >
                    <span>{formattedDegree}</span>
                  </div>
                </TableCell>

                {/* House */}
                <TableCell>
                  <Badge variant="outline">{position.house}</Badge>
                </TableCell>

                {/* Retrograde Status */}
                <TableCell className="text-center">
                  {position.isRetrograde && (
                    <div
                      className="text-muted-foreground inline-flex items-center gap-1"
                      title="Planeta retrógrado"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {!compact && <span className="text-xs">R</span>}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  // Return with or without Card wrapper
  return showCard ? (
    <Card>
      <CardHeader>
        <CardTitle>Posiciones Planetarias</CardTitle>
        <CardDescription>Ubicación de cada planeta en tu carta natal</CardDescription>
      </CardHeader>
      <CardContent>{tableContent}</CardContent>
    </Card>
  ) : (
    tableContent
  );
}
