// 1. React & Next.js
import Link from 'next/link';

// 5. Components
import { EditorialCard } from '@/components/common/EditorialCard';
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
 * La tarjeta la dibuja `EditorialCard`, que comparte con
 * `ServiceEditorialContent`; lo propio de este componente es el envoltorio y el
 * pie de enlaces internos.
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
    <EditorialCard
      testId="listing-intro"
      title={title}
      lead={lead}
      sections={sections}
      className={cn('container mx-auto px-4 pt-4 pb-12', className)}
    >
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
    </EditorialCard>
  );
}
