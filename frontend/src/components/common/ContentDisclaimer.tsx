// 6. Utils & types
import { CONTENT_DISCLAIMER } from '@/lib/constants/legal';
import { cn } from '@/lib/utils';

/**
 * ContentDisclaimer
 *
 * Aviso legal de contenido (T-SEO-018): fines culturales, de entretenimiento y
 * de autoconocimiento; no sustituye asesoramiento médico, psicológico, legal ni
 * financiero. Va en el footer global (toda URL) y, además, al pie de cada ficha
 * y de cada lectura, cerca del texto al que aplica.
 *
 * Sin `'use client'` propio, igual que `AuthorByline`: no tiene estado ni
 * handlers, así que el footer y las rutas de servidor lo renderizan en el HTML
 * inicial, y los client components que lo montan lo llevan en su bundle sin
 * costo extra.
 *
 * @example
 * ```tsx
 * <ContentDisclaimer className="mt-8" />
 * ```
 */
export interface ContentDisclaimerProps {
  /** Clases CSS adicionales. */
  className?: string;
}

export function ContentDisclaimer({ className }: ContentDisclaimerProps) {
  return (
    <aside
      data-testid="content-disclaimer"
      aria-label="Aviso legal"
      className={cn('text-muted-foreground text-xs leading-relaxed', className)}
    >
      <p>{CONTENT_DISCLAIMER}</p>
    </aside>
  );
}
