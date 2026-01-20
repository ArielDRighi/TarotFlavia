'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChineseCompatibility } from './ChineseCompatibility';
import { CHINESE_ZODIAC_INFO, getElementNameEs } from '@/lib/utils/chinese-zodiac';
import type { ChineseHoroscope, ChineseElementCode } from '@/types/chinese-horoscope.types';

/**
 * ChineseHoroscopeDetail Component Props
 */
export interface ChineseHoroscopeDetailProps {
  /** Chinese horoscope data */
  horoscope: ChineseHoroscope;
  /** Element code (optional - used to display full zodiac name like 'Dragón de Tierra') */
  element?: ChineseElementCode | null;
}

const AREA_LABELS = {
  love: { label: 'Amor', icon: '❤️' },
  career: { label: 'Carrera', icon: '💼' },
  wellness: { label: 'Bienestar', icon: '✨' },
  finance: { label: 'Finanzas', icon: '💰' },
};

/**
 * ChineseHoroscopeDetail Component
 *
 * Displays the complete Chinese horoscope for a specific animal and year.
 * Shows overview, areas (love, career, wellness, finance), lucky elements, and compatibility.
 *
 * @example
 * ```tsx
 * <ChineseHoroscopeDetail horoscope={dragonHoroscope2026} />
 * ```
 */
export function ChineseHoroscopeDetail({ horoscope, element }: ChineseHoroscopeDetailProps) {
  const animalInfo = CHINESE_ZODIAC_INFO[horoscope.animal];

  // Determine display name: fullZodiacType from API > calculated from element > just animal name
  const displayName =
    horoscope.fullZodiacType ||
    (element ? `${animalInfo.nameEs} de ${getElementNameEs(element)}` : animalInfo.nameEs);

  return (
    <div className="space-y-6" data-testid="chinese-horoscope-detail">
      {/* Header */}
      <div className="text-center">
        <span className="text-6xl">{animalInfo.emoji}</span>
        <h1 className="mt-2 font-serif text-3xl">{displayName}</h1>
        <Badge variant="secondary" className="mt-2">
          Horóscopo {horoscope.year}
        </Badge>
      </div>

      {/* Overview */}
      <Card className="p-6">
        <p className="text-lg leading-relaxed">{horoscope.generalOverview}</p>
      </Card>

      {/* Areas */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(horoscope.areas).map(([key, area]) => {
          const config = AREA_LABELS[key as keyof typeof AREA_LABELS];
          return (
            <Card key={key} className="p-4" data-testid={`area-card-${key}`}>
              <div className="mb-2 flex items-center gap-2">
                <span>{config.icon}</span>
                <h3 className="font-medium">{config.label}</h3>
                <Badge variant="outline" className="ml-auto">
                  {area.score}/10
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{area.content}</p>
            </Card>
          );
        })}
      </div>

      {/* Lucky Elements */}
      <Card className="p-4">
        <h3 className="mb-4 font-serif text-lg">Elementos de Suerte</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-sm">Números</p>
            <p className="font-medium">{horoscope.luckyElements.numbers.join(', ')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Colores</p>
            <p className="font-medium">{horoscope.luckyElements.colors.join(', ')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Direcciones</p>
            <p className="font-medium">{horoscope.luckyElements.directions.join(', ')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Meses</p>
            <p className="font-medium">{horoscope.luckyElements.months.join(', ')}</p>
          </div>
        </div>
      </Card>

      {/* Compatibility */}
      <ChineseCompatibility compatibility={horoscope.compatibility} />

      {/* Monthly Highlights */}
      {horoscope.monthlyHighlights && (
        <Card className="p-4">
          <h3 className="mb-4 font-serif text-lg">Aspectos Destacados del Año</h3>
          <p className="text-muted-foreground text-sm">{horoscope.monthlyHighlights}</p>
        </Card>
      )}
    </div>
  );
}
