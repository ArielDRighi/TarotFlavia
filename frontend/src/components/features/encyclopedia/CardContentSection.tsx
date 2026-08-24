'use client';

// 6. Utils & types
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Mismas clases que `components/ui/card`, aplicadas sobre un `<section>`.
 *
 * El `Card` de shadcn renderiza un `div`, y acá el elemento importa: cada
 * sección de la ficha es una sección del artículo, con su `h2` propio, y es lo
 * que le da al crawler la estructura que antes no existía (T-SEO-010).
 */
const SECTION_CLASSES = 'bg-card text-card-foreground rounded-xl border p-6 shadow-sm';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardContentSectionProps {
  /** Encabezado visible de la sección (`h2`). */
  heading: string;
  /**
   * Cuerpo de la sección. `undefined` cuando la API todavía no tiene el campo
   * cargado: la sección entera no se renderiza.
   */
  text?: string;
  /** `data-testid` de la sección. */
  testId: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Una sección de contenido de la ficha de una carta.
 *
 * **Degrada sola**: si el campo no vino en la respuesta —o vino en blanco— no
 * renderiza nada, ni siquiera el encabezado. Es lo que permitió desplegar
 * T-SEO-008 antes de que existiera el contenido y cargar las 78 fichas de a
 * tandas sin dejar títulos huérfanos en la página.
 */
export function CardContentSection({ heading, text, testId, className }: CardContentSectionProps) {
  const paragraphs = (text ?? '')
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section data-testid={testId} className={cn(SECTION_CLASSES, className)}>
      <h2 className="mb-4 font-serif text-lg">{heading}</h2>

      <div className="space-y-4">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
