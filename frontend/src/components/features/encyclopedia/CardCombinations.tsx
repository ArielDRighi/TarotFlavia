'use client';

// 1. React & Next.js
import Link from 'next/link';

// 6. Utils & types
import { CARD_COMBINATIONS_SECTION } from '@/lib/constants/card-content-sections.data';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { CardCombination } from '@/types/encyclopedia.types';

import { CARD_SECTION_CLASSES } from './CardContentSection';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Partículas que en el nombre inglés de una carta van en minúscula. */
const LOWERCASE_WORDS = new Set(['of', 'the']);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardCombinationsProps {
  /** Combinaciones de la ficha. Ausente mientras la carta no tenga contenido. */
  combinations?: CardCombination[];
  /**
   * Nombres en español por slug, resueltos en el servidor para que el texto del
   * enlace viaje en el HTML. Si falta uno, se cae al slug legible.
   */
  cardNames?: Record<string, string>;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Etiqueta de respaldo cuando el listado no resolvió el nombre en español:
 * `seven-of-swords` → `Seven of Swords`.
 *
 * El slug **es** el nombre inglés de la carta, que la ficha ya muestra como
 * subtítulo debajo del nombre en español (`CardDetailHero`), así que no es texto
 * ajeno a la página; solo hay que armarlo bien —las partículas van en minúscula,
 * como en `nameEn`— en vez de capitalizar cada palabra a lo bruto. Lo que no
 * puede pasar es que las cuatro combinaciones queden con la misma etiqueta
 * genérica: son enlaces distintos y necesitan texto distinto.
 */
function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((word, i) =>
      i > 0 && LOWERCASE_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Combinaciones frecuentes de la carta con otras del mazo (T-SEO-010).
 *
 * Cada combinación es un **enlace interno real** a `/enciclopedia/tarot/[slug]`,
 * no texto plano: son los cross-links entre fichas que antes no existían y que
 * el crawler necesita para recorrer las 78. Renderizarlas como texto cumpliría
 * media función del bloque.
 *
 * Degrada sola: sin combinaciones cargadas no renderiza nada.
 */
export function CardCombinations({ combinations, cardNames, className }: CardCombinationsProps) {
  if (!combinations || combinations.length === 0) {
    return null;
  }

  return (
    <section
      data-testid={CARD_COMBINATIONS_SECTION.testId}
      className={cn(CARD_SECTION_CLASSES, className)}
    >
      <h2 className="mb-4 font-serif text-lg">{CARD_COMBINATIONS_SECTION.heading}</h2>

      <ul className="space-y-4">
        {combinations.map((combination) => (
          <li key={combination.cardSlug}>
            <Link
              href={ROUTES.ENCICLOPEDIA_TAROT_CARD(combination.cardSlug)}
              className="text-primary focus-visible:ring-primary rounded-sm font-medium hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {cardNames?.[combination.cardSlug] ?? humanizeSlug(combination.cardSlug)}
            </Link>
            <p className="text-muted-foreground mt-1 leading-relaxed">{combination.reading}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
