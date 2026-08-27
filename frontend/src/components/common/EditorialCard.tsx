// 6. Utils & types
import { cn } from '@/lib/utils';

/**
 * EditorialCard
 *
 * Tarjeta editorial de una ruta pública: título, párrafo de entrada y una grilla
 * de bloques temáticos. Es el núcleo que comparten `ListingIntro` (T-SEO-003) y
 * `ServiceEditorialContent` (T-SEO-012), que antes lo tenían duplicado carácter
 * por carácter y solo se diferenciaban en el envoltorio y en el pie.
 *
 * Sin `'use client'` a propósito: es el contenido que tiene que llegar al
 * crawler aunque la parte cliente de la página se quede en su esqueleto.
 *
 * El tipo de `sections` se declara acá y **no** se importa de ningún archivo de
 * datos: TypeScript es estructural, así que `ListingIntroSection[]` y
 * `ServiceDetailSection[]` encajan sin que un componente tenga que conocer el
 * dominio del otro.
 *
 * @example
 * ```tsx
 * <EditorialCard testId="listing-intro" title="…" lead="…" sections={secciones}>
 *   <nav>…</nav>
 * </EditorialCard>
 * ```
 */

/** Un bloque temático de la tarjeta (se renderiza como `h3` + párrafo). */
export interface EditorialCardSection {
  /** Encabezado del bloque. */
  heading: string;
  /** Cuerpo del bloque. */
  body: string;
}

export interface EditorialCardProps {
  /** `data-testid` de la `<section>` contenedora. */
  testId: string;
  /** Título del bloque (`h2`; el `h1` es el de la página). */
  title: string;
  /** Párrafo de entrada. */
  lead: string;
  /** Bloques temáticos, en grilla de dos columnas. */
  sections: readonly EditorialCardSection[];
  /** Clases del `<section>` contenedor: cada consumidor trae su envoltorio. */
  className?: string;
  /** Pie de la tarjeta: enlaces, preguntas frecuentes, avisos. */
  children?: React.ReactNode;
}

export function EditorialCard({
  testId,
  title,
  lead,
  sections,
  className,
  children,
}: EditorialCardProps) {
  return (
    <section data-testid={testId} className={className}>
      <div className="border-border bg-card mx-auto max-w-3xl rounded-2xl border p-6 sm:p-8">
        <h2 className="text-card-foreground font-serif text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">{lead}</p>

        <div className={cn('grid gap-6 sm:grid-cols-2', sections.length > 0 && 'mt-6')}>
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-card-foreground font-semibold">{section.heading}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {children}
      </div>
    </section>
  );
}
