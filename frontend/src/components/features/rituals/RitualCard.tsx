'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Layers, Package } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_INFO, DIFFICULTY_INFO, LUNAR_PHASE_INFO } from '@/types/ritual.types';
import type { RitualSummary } from '@/types/ritual.types';

/**
 * RitualCard Component Props
 */
export interface RitualCardProps {
  /** Ritual summary information */
  ritual: RitualSummary;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RitualCard Component
 *
 * Displays a ritual summary card with image, title, description,
 * category, difficulty, and metadata.
 *
 * Features:
 * - Clickable card that links to ritual detail page
 * - Category badge with icon and color coding
 * - Difficulty indicator with color coding
 * - Optional lunar phase badge
 * - Duration, steps, and materials count
 * - Hover effects with image scale
 * - Responsive image with Next.js Image optimization
 *
 * @example
 * ```tsx
 * <RitualCard ritual={ritual} />
 * ```
 */
export function RitualCard({ ritual, className }: RitualCardProps) {
  const categoryInfo = CATEGORY_INFO[ritual.category];
  const difficultyInfo = DIFFICULTY_INFO[ritual.difficulty];
  const lunarInfo = ritual.bestLunarPhase ? LUNAR_PHASE_INFO[ritual.bestLunarPhase] : null;

  return (
    <Link href={`/rituales/${ritual.slug}`} className="block">
      <Card
        data-testid={`ritual-card-${ritual.slug}`}
        className={cn('group overflow-hidden transition-all hover:shadow-lg', className)}
      >
        {/* Imagen */}
        <div className="bg-muted relative aspect-video">
          <Image
            src={ritual.imageUrl}
            alt={ritual.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          {/* Badge de categoría */}
          <Badge className={cn('bg-background/90 absolute top-2 left-2', categoryInfo.color)}>
            {categoryInfo.icon} {categoryInfo.name}
          </Badge>
          {/* Badge de fase lunar */}
          {lunarInfo && (
            <Badge variant="secondary" className="bg-background/90 absolute top-2 right-2">
              {lunarInfo.icon}
            </Badge>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="group-hover:text-primary mb-2 line-clamp-1 font-serif text-lg">
            {ritual.title}
          </h3>
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{ritual.description}</p>

          {/* Meta info */}
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {ritual.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {ritual.stepsCount} pasos
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {ritual.materialsCount}
            </span>
          </div>

          {/* Dificultad */}
          <div className="mt-2">
            <span className={cn('text-xs font-medium', difficultyInfo.color)}>
              {difficultyInfo.name}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
