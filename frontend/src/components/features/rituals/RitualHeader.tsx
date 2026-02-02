'use client';

import Image from 'next/image';
import { Clock, Layers, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_INFO, DIFFICULTY_INFO, LUNAR_PHASE_INFO } from '@/types/ritual.types';
import type { RitualDetail } from '@/types/ritual.types';

/**
 * RitualHeader Component Props
 */
export interface RitualHeaderProps {
  /** Ritual detail information */
  ritual: RitualDetail;
}

/**
 * RitualHeader Component
 *
 * Displays a hero header for a ritual with background image,
 * category/difficulty badges, title, and metadata.
 *
 * Features:
 * - Full-width background image with gradient overlay
 * - Category badge with icon and color coding
 * - Difficulty indicator with color coding
 * - Optional lunar phase badge (best time to perform)
 * - Duration, steps count, and completion count
 * - Responsive sizing (mobile/desktop)
 * - Next.js Image optimization with priority loading
 *
 * @example
 * ```tsx
 * <RitualHeader ritual={ritualDetail} />
 * ```
 */
export function RitualHeader({ ritual }: RitualHeaderProps) {
  const categoryInfo = CATEGORY_INFO[ritual.category];
  const difficultyInfo = DIFFICULTY_INFO[ritual.difficulty];
  const lunarInfo = ritual.bestLunarPhase ? LUNAR_PHASE_INFO[ritual.bestLunarPhase] : null;

  return (
    <div className="relative" data-testid="ritual-header">
      {/* Imagen de fondo */}
      <div className="relative h-64 overflow-hidden rounded-lg md:h-80">
        <Image src={ritual.imageUrl} alt={ritual.title} fill className="object-cover" priority />
        <div className="from-background via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      {/* Contenido sobre la imagen */}
      <div className="absolute right-0 bottom-0 left-0 p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className={categoryInfo.color}>
            {categoryInfo.icon} {categoryInfo.name}
          </Badge>
          <Badge variant="outline" className={difficultyInfo.color}>
            {difficultyInfo.name}
          </Badge>
          {lunarInfo && (
            <Badge variant="secondary">
              {lunarInfo.icon} Mejor en {lunarInfo.name}
            </Badge>
          )}
        </div>

        <h1 className="mb-2 font-serif text-3xl md:text-4xl">{ritual.title}</h1>

        <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {ritual.durationMinutes} minutos
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            {ritual.steps.length} pasos
          </span>
          {ritual.completionCount > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {ritual.completionCount} veces realizado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
