'use client';

// 1. React & Next.js
import Image from 'next/image';
// 6. Utils & types
import { cn } from '@/lib/utils';
import type { CardSymbolMarker } from '@/lib/constants/major-arcana-extras.data';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Proporción de las láminas de `public/images/tarot/` (300×527). Las
 * coordenadas de los símbolos son porcentajes sobre ese lienzo, así que el
 * contenedor tiene que conservar la proporción exacta o los marcadores se
 * corren.
 */
const CARD_ASPECT_RATIO = '300 / 527';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardSymbolDiagramProps {
  /** Lámina de la carta (`card.imageUrl`). */
  imageUrl: string;
  /** Nombre en español, para el `alt` y el título de la leyenda. */
  cardName: string;
  /** Símbolos a señalar, en el orden en que se numeran. */
  symbols: CardSymbolMarker[];
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Diagrama de símbolos de una lámina (T-SEO-020).
 *
 * La lámina Rider-Waite-Smith es de dominio público; lo propio del sitio es
 * la anotación: marcadores numerados sobre la imagen y una leyenda con qué es
 * cada símbolo y qué significa. Es la "media original" de la tarea, sin
 * assets nuevos: la imagen ya está, y el diagrama es HTML que el crawler lee.
 *
 * Los marcadores son decorativos (`aria-hidden`); el contenido accesible es
 * la lista ordenada del `figcaption`, cuyos números coinciden con los de la
 * imagen.
 */
export function CardSymbolDiagram({
  imageUrl,
  cardName,
  symbols,
  className,
}: CardSymbolDiagramProps) {
  if (symbols.length === 0) {
    return null;
  }

  return (
    <figure
      data-testid="card-symbol-diagram"
      className={cn('flex flex-col gap-6 sm:flex-row sm:items-start', className)}
    >
      {/* Lámina con los marcadores. `overflow-hidden` recorta un marcador que
          quede justo en el borde: por eso las coordenadas nunca tocan 0 ni 100. */}
      <div
        className="relative mx-auto w-full max-w-[240px] flex-shrink-0 overflow-hidden rounded-lg border shadow-md sm:mx-0"
        style={{ aspectRatio: CARD_ASPECT_RATIO }}
      >
        <Image
          src={imageUrl}
          alt={`Diagrama de símbolos de ${cardName}: la lámina con ${symbols.length} elementos señalados`}
          fill
          className="object-cover"
          sizes="240px"
        />

        {symbols.map((symbol, index) => (
          <span
            key={symbol.label}
            data-testid="card-symbol-marker"
            aria-hidden="true"
            className="bg-secondary text-bg-hero absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-md"
            style={{ left: `${symbol.x}%`, top: `${symbol.y}%` }}
          >
            {index + 1}
          </span>
        ))}
      </div>

      {/* Leyenda: es el contenido real del diagrama. */}
      <figcaption className="flex-1">
        <p className="text-muted-foreground mb-3 text-sm">
          Símbolos señalados en la lámina de {cardName}
        </p>
        <ol data-testid="card-symbol-legend" className="space-y-3">
          {symbols.map((symbol, index) => (
            <li key={symbol.label} className="flex gap-3">
              <span
                className="bg-secondary text-bg-hero mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p className="leading-relaxed">
                <strong className="text-foreground font-semibold">{symbol.label}.</strong>{' '}
                <span className="text-muted-foreground">{symbol.meaning}</span>
              </p>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
