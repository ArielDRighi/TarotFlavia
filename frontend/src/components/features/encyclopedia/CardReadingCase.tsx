'use client';

// 6. Utils & types
import { CARD_SECTION_CLASSES } from './CardContentSection';
import { cn } from '@/lib/utils';
import type { MajorArcanaReadingCase } from '@/lib/constants/major-arcana-extras.data';

// ─── Constants ───────────────────────────────────────────────────────────────

const ORIENTATION_LABEL: Record<MajorArcanaReadingCase['orientation'], string> = {
  upright: 'Derecha',
  reversed: 'Invertida',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardReadingCaseProps {
  readingCase: MajorArcanaReadingCase;
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailItem({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground text-xs tracking-wider uppercase">{term}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Mini-caso de tirada de un Arcano Mayor (T-SEO-020).
 *
 * Muestra en qué consulta salió la carta, con qué tirada, en qué posición y
 * si derecha o invertida, y cómo se leyó con las cartas vecinas. No es una
 * predicción: es un ejemplo de lectura, que es lo que ninguna ficha del web
 * hispano tiene. La pregunta va como cita para que se lea como voz de la
 * persona que consultó, y los datos de la tirada como lista de definiciones
 * para que el crawler los reciba con su rótulo.
 */
export function CardReadingCase({ readingCase, className }: CardReadingCaseProps) {
  return (
    <section
      data-testid="card-section-reading-case"
      className={cn(CARD_SECTION_CLASSES, className)}
    >
      <h2 className="mb-4 font-serif text-lg">{readingCase.heading}</h2>

      <blockquote
        data-testid="card-reading-case-question"
        className="border-secondary mb-4 border-l-4 pl-4 italic"
      >
        <p className="leading-relaxed">{readingCase.question}</p>
      </blockquote>

      <dl
        data-testid="card-reading-case-details"
        className="bg-muted/40 mb-4 grid grid-cols-1 gap-3 rounded-lg p-4 sm:grid-cols-3"
      >
        <DetailItem term="Tirada" value={readingCase.spread} />
        <DetailItem term="Posición" value={readingCase.position} />
        <DetailItem term="Salió" value={ORIENTATION_LABEL[readingCase.orientation]} />
      </dl>

      <div className="space-y-4">
        {readingCase.reading.map((paragraph, i) => (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
