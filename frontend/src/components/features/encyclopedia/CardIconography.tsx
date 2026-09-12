'use client';

// 5. Components (ui → features)
import { CARD_SECTION_CLASSES } from './CardContentSection';
import { CardSymbolDiagram } from './CardSymbolDiagram';
// 6. Utils & types
import { cn } from '@/lib/utils';
import type { MajorArcanaIconography } from '@/lib/constants/major-arcana-extras.data';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardIconographyProps {
  /** Lámina de la carta (`card.imageUrl`). */
  imageUrl: string;
  /** Nombre en español de la carta. */
  cardName: string;
  iconography: MajorArcanaIconography;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Nota iconográfica de un Arcano Mayor (T-SEO-020).
 *
 * A diferencia de "El simbolismo de la carta" —que describe la escena—, esta
 * sección es específica de la lámina Rider-Waite-Smith: qué símbolo concreto
 * está, dónde, y qué significa. Lleva el diagrama con los marcadores sobre la
 * imagen, que es la media original de la ficha.
 */
export function CardIconography({
  imageUrl,
  cardName,
  iconography,
  className,
}: CardIconographyProps) {
  return (
    <section data-testid="card-section-iconography" className={cn(CARD_SECTION_CLASSES, className)}>
      <h2 className="mb-4 font-serif text-lg">{iconography.heading}</h2>

      <p className="text-muted-foreground mb-6 leading-relaxed">{iconography.intro}</p>

      <CardSymbolDiagram imageUrl={imageUrl} cardName={cardName} symbols={iconography.symbols} />
    </section>
  );
}
