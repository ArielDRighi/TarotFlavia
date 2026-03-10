'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

import { AstrologySection } from './AstrologySection';
import { GuidesSection } from './GuidesSection';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EncyclopediaHomeProps {
  /** Additional CSS classes (optional) */
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TarotSection() {
  return (
    <section data-testid="tarot-section" className="space-y-4">
      <h2 className="text-foreground text-2xl font-bold">Tarot</h2>
      <p className="text-muted-foreground text-sm">
        Explora las 78 cartas del Tarot, sus significados y simbolismos.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/enciclopedia"
          className="bg-card hover:bg-accent flex flex-col gap-2 rounded-lg border p-5 transition-colors"
        >
          <div className="text-3xl" aria-hidden="true">
            🃏
          </div>
          <h3 className="text-foreground font-semibold">Todas las cartas</h3>
          <p className="text-muted-foreground text-sm">
            Accede al catálogo completo de las 78 cartas del Tarot.
          </p>
        </Link>
        <Link
          href="/enciclopedia?arcana=major"
          className="bg-card hover:bg-accent flex flex-col gap-2 rounded-lg border p-5 transition-colors"
        >
          <div className="text-3xl" aria-hidden="true">
            🌟
          </div>
          <h3 className="text-foreground font-semibold">Arcanos Mayores</h3>
          <p className="text-muted-foreground text-sm">
            Los 22 Arcanos Mayores y sus arquetipos universales.
          </p>
        </Link>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * EncyclopediaHome Component
 *
 * Hub page that unifies all encyclopedia sections:
 * - Tarot: 78 cards
 * - Astrología: Zodiac signs, planets, astrological houses
 * - Guías: 6 activity guides
 *
 * @example
 * ```tsx
 * <EncyclopediaHome />
 * ```
 */
export function EncyclopediaHome({ className }: EncyclopediaHomeProps) {
  return (
    <div
      data-testid="encyclopedia-home"
      className={cn('container mx-auto space-y-12 px-4 py-8', className)}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 font-serif text-4xl">Enciclopedia Mística</h1>
        <p className="text-muted-foreground">
          Tu guía completa del Tarot, la Astrología y las tradiciones místicas
        </p>
      </div>

      {/* Tarot section */}
      <TarotSection />

      {/* Astrology section */}
      <AstrologySection />

      {/* Guides section */}
      <GuidesSection />
    </div>
  );
}
