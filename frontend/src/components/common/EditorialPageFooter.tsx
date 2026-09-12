// 1. React & Next.js
import Link from 'next/link';

// 6. Utils & types
import { formatReviewMonth } from '@/lib/utils/date';
import type { EditorialLink } from '@/types/editorial-page.types';

/**
 * EditorialPageFooter
 *
 * Pie de las páginas editoriales estáticas (`/sobre-nosotros`,
 * `/politica-editorial`): la fecha de última revisión y los enlaces internos
 * para que el crawler siga recorriendo.
 *
 * Las dos páginas afirman que el contenido se revisa; sin una fecha a la vista,
 * eso no lo puede verificar nadie. Sin `'use client'`: no tiene estado.
 */
export interface EditorialPageFooterProps {
  /** Última revisión editorial, `YYYY-MM`. */
  lastReviewed: string;
  /** Enlaces internos relacionados. */
  links: EditorialLink[];
  /** Prefijo del `data-testid` de la fecha (`${prefix}-last-reviewed`). */
  testIdPrefix: string;
}

export function EditorialPageFooter({
  lastReviewed,
  links,
  testIdPrefix,
}: EditorialPageFooterProps) {
  return (
    <>
      <p
        data-testid={`${testIdPrefix}-last-reviewed`}
        className="text-muted-foreground mt-6 text-sm"
      >
        Última revisión editorial: {formatReviewMonth(lastReviewed)}
      </p>

      <nav
        aria-label="Enlaces relacionados"
        className="border-border mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6"
      >
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
    </>
  );
}
