// 1. React & Next.js
import Link from 'next/link';

// 6. Utils & types
import { cn } from '@/lib/utils';
import type { ListingIntroData } from '@/lib/constants/listing-intros.data';

/**
 * ListingIntro
 *
 * Bloque editorial de una ruta de listado o hub (T-SEO-003). Sin `'use client'`
 * a propósito: es el contenido que tiene que llegar al crawler aunque la API no
 * responda y aunque el listado de arriba se quede en su esqueleto.
 *
 * El texto vive en `listing-intros.data.ts`, no acá: así el guardarraíl de
 * palabras y de unicidad puede verificarlo sin renderizar nada.
 *
 * @example
 * ```tsx
 * import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
 *
 * <ListingIntro intro={LISTING_INTROS.enciclopediaTarot} />
 * ```
 */
export interface ListingIntroProps {
  /** Contenido a renderizar. */
  intro: ListingIntroData;
  /** Clases CSS adicionales. */
  className?: string;
}

export function ListingIntro({ intro, className }: ListingIntroProps) {
  const { title, lead, sections, links } = intro;

  return (
    <section
      data-testid="listing-intro"
      className={cn('container mx-auto px-4 pt-4 pb-12', className)}
    >
      <div className="border-border bg-card mx-auto max-w-3xl rounded-2xl border p-6 sm:p-8">
        <h2 className="text-card-foreground font-serif text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">{lead}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-card-foreground font-semibold">{section.heading}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {links && links.length > 0 && (
          <nav className="border-border mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-secondary focus-visible:ring-secondary rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
